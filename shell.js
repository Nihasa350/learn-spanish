// Tiny in-browser bash simulator.
//
// Exposes window.Shell = { create, check, formatCwd }
//
//   const sh = Shell.create({ fs, cwd, env });
//   const result = sh.run("ls -la");          // { stdout, error }
//   const verdict = Shell.check(sh.state, result, expect);
//   sh.reset();
//
// Filesystem nodes:
//   directory: { type: 'dir',  children: { name: node, ... } }
//   file:      { type: 'file', content: 'string' }

(function () {
  // ---------- Path helpers ----------
  function splitPath(p) { return p.split("/").filter(Boolean); }
  function joinPath(parts) { return "/" + parts.join("/"); }

  function normalizePath(p) {
    const parts = [];
    for (const seg of splitPath(p)) {
      if (seg === ".") continue;
      if (seg === "..") { if (parts.length) parts.pop(); continue; }
      parts.push(seg);
    }
    return joinPath(parts);
  }

  function resolvePath(input, cwd, env) {
    if (!input) return cwd;
    let s = input;
    if (s === "~") s = env.HOME;
    else if (s.startsWith("~/")) s = env.HOME + s.slice(1);
    const abs = s.startsWith("/") ? s : (cwd === "/" ? "/" + s : cwd + "/" + s);
    return normalizePath(abs) || "/";
  }

  function formatCwd(cwd, home) {
    if (cwd === home) return "~";
    if (home && cwd.startsWith(home + "/")) return "~" + cwd.slice(home.length);
    return cwd;
  }

  function deepClone(node) {
    if (!node) return { type: "dir", children: {} };
    if (node.type === "file") return { type: "file", content: node.content };
    const children = {};
    for (const [k, v] of Object.entries(node.children || {})) children[k] = deepClone(v);
    return { type: "dir", children };
  }

  function getNode(fs, absPath) {
    if (absPath === "/" || absPath === "") return fs;
    let node = fs;
    for (const seg of splitPath(absPath)) {
      if (!node || node.type !== "dir") return null;
      if (!(seg in node.children)) return null;
      node = node.children[seg];
    }
    return node;
  }

  function getParent(fs, absPath) {
    const parts = splitPath(absPath);
    if (parts.length === 0) return { parent: null, name: null };
    const name = parts.pop();
    const parent = getNode(fs, joinPath(parts));
    return { parent, name };
  }

  // ---------- Tokenize & parse ----------
  function tokenize(line) {
    const tokens = [];
    let i = 0;
    while (i < line.length) {
      const c = line[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === "|") { tokens.push({ type: "op", value: "|" }); i++; continue; }
      if (c === ">") {
        if (line[i + 1] === ">") { tokens.push({ type: "op", value: ">>" }); i += 2; }
        else { tokens.push({ type: "op", value: ">" }); i++; }
        continue;
      }
      if (c === "&" && line[i + 1] === "&") {
        tokens.push({ type: "op", value: "&&" }); i += 2; continue;
      }
      let word = "";
      while (i < line.length && !/[\s|<>]/.test(line[i])) {
        if (line[i] === "&" && line[i + 1] === "&") break;
        const ch = line[i];
        if (ch === '"' || ch === "'") {
          const q = ch;
          i++;
          while (i < line.length && line[i] !== q) { word += line[i]; i++; }
          if (i < line.length) i++;
        } else if (ch === "\\" && i + 1 < line.length) {
          word += line[i + 1];
          i += 2;
        } else {
          word += ch;
          i++;
        }
      }
      tokens.push({ type: "word", value: word });
    }
    return tokens;
  }

  function expandVars(word, env) {
    return word.replace(/\$\{(\w+)\}|\$(\w+)/g, (_, a, b) => {
      const name = a || b;
      return env[name] !== undefined ? env[name] : "";
    });
  }

  // Split tokens on '&&' into segments; each segment is a pipeline of commands.
  function parseScript(tokens) {
    const segments = [[]];
    for (const t of tokens) {
      if (t.type === "op" && t.value === "&&") segments.push([]);
      else segments[segments.length - 1].push(t);
    }
    return segments.map(parsePipeline);
  }

  function parsePipeline(tokens) {
    const cmds = [];
    let cur = { argv: [], redirects: [] };
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.type === "op" && t.value === "|") {
        cmds.push(cur); cur = { argv: [], redirects: [] };
      } else if (t.type === "op" && (t.value === ">" || t.value === ">>")) {
        const next = tokens[i + 1];
        if (!next || next.type !== "word") throw new Error(`syntax error near \`${t.value}\``);
        cur.redirects.push({ op: t.value, target: next.value });
        i++;
      } else {
        cur.argv.push(t.value);
      }
    }
    cmds.push(cur);
    return cmds.filter(c => c.argv.length > 0 || c.redirects.length > 0);
  }

  // ---------- Commands ----------
  function pad(s, n) { s = String(s); return s.length >= n ? s : " ".repeat(n - s.length) + s; }

  const COMMANDS = {
    pwd(state) { return state.cwd + "\n"; },

    cd(state, args) {
      const arg = args.find(a => !a.startsWith("-"));
      const target = arg ? resolvePath(arg, state.cwd, state.env) : state.env.HOME;
      const node = getNode(state.fs, target);
      if (!node) throw new Error(`cd: ${arg || ""}: No such file or directory`);
      if (node.type !== "dir") throw new Error(`cd: ${arg}: Not a directory`);
      state.cwd = target;
      state.env.PWD = target;
      return "";
    },

    ls(state, args, _stdin, opts) {
      const flagStr = args.filter(a => a.startsWith("-") && a !== "-").join("");
      const showHidden = /a/.test(flagStr);
      const longFmt = /l/.test(flagStr);
      const oneFmt = /1/.test(flagStr);
      const piped = !!(opts && opts.piped);
      const onePerLine = longFmt || oneFmt || piped;
      const paths = args.filter(a => !a.startsWith("-"));
      if (paths.length === 0) paths.push(".");
      let out = "";
      for (const p of paths) {
        const abs = resolvePath(p, state.cwd, state.env);
        const node = getNode(state.fs, abs);
        if (!node) { out += `ls: cannot access '${p}': No such file or directory\n`; continue; }
        if (node.type === "file") { out += p + "\n"; continue; }
        let names = Object.keys(node.children).sort();
        if (!showHidden) names = names.filter(n => !n.startsWith("."));
        if (longFmt) {
          for (const n of names) {
            const child = node.children[n];
            const t = child.type === "dir" ? "d" : "-";
            const sz = child.type === "file" ? child.content.length : 4096;
            out += `${t}rwxr-xr-x 1 user user ${pad(sz, 6)} Jan  1 00:00 ${n}\n`;
          }
        } else if (onePerLine) {
          for (const n of names) out += n + "\n";
        } else if (names.length) {
          out += names.join("  ") + "\n";
        }
      }
      return out;
    },

    mkdir(state, args) {
      const parents = args.some(a => /^-.*p/.test(a));
      const paths = args.filter(a => !a.startsWith("-"));
      if (paths.length === 0) throw new Error("mkdir: missing operand");
      for (const path of paths) {
        const abs = resolvePath(path, state.cwd, state.env);
        const parts = splitPath(abs);
        let node = state.fs;
        for (let i = 0; i < parts.length; i++) {
          const name = parts[i];
          if (!(name in node.children)) {
            if (i < parts.length - 1 && !parents) {
              throw new Error(`mkdir: cannot create directory '${path}': No such file or directory`);
            }
            node.children[name] = { type: "dir", children: {} };
          } else if (i === parts.length - 1 && !parents) {
            throw new Error(`mkdir: cannot create directory '${path}': File exists`);
          }
          const next = node.children[name];
          if (next.type !== "dir") throw new Error(`mkdir: '${path}': Not a directory`);
          node = next;
        }
      }
      return "";
    },

    touch(state, args) {
      const paths = args.filter(a => !a.startsWith("-"));
      if (paths.length === 0) throw new Error("touch: missing file operand");
      for (const path of paths) {
        const abs = resolvePath(path, state.cwd, state.env);
        const existing = getNode(state.fs, abs);
        if (existing) continue;
        const { parent, name } = getParent(state.fs, abs);
        if (!parent || parent.type !== "dir") {
          throw new Error(`touch: cannot touch '${path}': No such file or directory`);
        }
        parent.children[name] = { type: "file", content: "" };
      }
      return "";
    },

    rm(state, args) {
      const recursive = args.some(a => /^-.*[rR]/.test(a));
      const force = args.some(a => /^-.*f/.test(a));
      const paths = args.filter(a => !a.startsWith("-"));
      if (paths.length === 0 && !force) throw new Error("rm: missing operand");
      for (const p of paths) {
        const abs = resolvePath(p, state.cwd, state.env);
        const node = getNode(state.fs, abs);
        if (!node) { if (force) continue; throw new Error(`rm: cannot remove '${p}': No such file or directory`); }
        if (node.type === "dir" && !recursive) throw new Error(`rm: cannot remove '${p}': Is a directory`);
        const { parent, name } = getParent(state.fs, abs);
        if (!parent) throw new Error(`rm: cannot remove '${p}'`);
        delete parent.children[name];
      }
      return "";
    },

    cp(state, args) {
      const recursive = args.some(a => /^-.*[rR]/.test(a));
      const paths = args.filter(a => !a.startsWith("-"));
      if (paths.length < 2) throw new Error("cp: missing destination file operand");
      const src = paths[0], dst = paths[paths.length - 1];
      const srcAbs = resolvePath(src, state.cwd, state.env);
      const srcNode = getNode(state.fs, srcAbs);
      if (!srcNode) throw new Error(`cp: cannot stat '${src}': No such file or directory`);
      if (srcNode.type === "dir" && !recursive) {
        throw new Error(`cp: -r not specified; omitting directory '${src}'`);
      }
      let dstAbs = resolvePath(dst, state.cwd, state.env);
      const dstNode = getNode(state.fs, dstAbs);
      if (dstNode && dstNode.type === "dir") {
        dstAbs = (dstAbs === "/" ? "" : dstAbs) + "/" + splitPath(srcAbs).pop();
      }
      const { parent, name } = getParent(state.fs, dstAbs);
      if (!parent || parent.type !== "dir") throw new Error(`cp: cannot create '${dst}': No such file or directory`);
      parent.children[name] = deepClone(srcNode);
      return "";
    },

    mv(state, args) {
      const paths = args.filter(a => !a.startsWith("-"));
      if (paths.length < 2) throw new Error("mv: missing destination file operand");
      const src = paths[0], dst = paths[paths.length - 1];
      const srcAbs = resolvePath(src, state.cwd, state.env);
      const srcNode = getNode(state.fs, srcAbs);
      if (!srcNode) throw new Error(`mv: cannot stat '${src}': No such file or directory`);
      let dstAbs = resolvePath(dst, state.cwd, state.env);
      const dstNode = getNode(state.fs, dstAbs);
      if (dstNode && dstNode.type === "dir") {
        dstAbs = (dstAbs === "/" ? "" : dstAbs) + "/" + splitPath(srcAbs).pop();
      }
      const { parent: dP, name: dN } = getParent(state.fs, dstAbs);
      const { parent: sP, name: sN } = getParent(state.fs, srcAbs);
      if (!dP || dP.type !== "dir") throw new Error(`mv: cannot move to '${dst}': No such file or directory`);
      if (!sP) throw new Error(`mv: cannot move '${src}'`);
      dP.children[dN] = srcNode;
      if (sP !== dP || sN !== dN) delete sP.children[sN];
      return "";
    },

    cat(state, args, stdin) {
      const paths = args.filter(a => !a.startsWith("-"));
      if (paths.length === 0) return stdin || "";
      let out = "";
      for (const p of paths) {
        const abs = resolvePath(p, state.cwd, state.env);
        const node = getNode(state.fs, abs);
        if (!node) throw new Error(`cat: ${p}: No such file or directory`);
        if (node.type !== "file") throw new Error(`cat: ${p}: Is a directory`);
        out += node.content;
      }
      return out;
    },

    echo(_state, args) {
      let newline = true;
      const out = [];
      for (const a of args) {
        if (a === "-n") { newline = false; continue; }
        out.push(a);
      }
      return out.join(" ") + (newline ? "\n" : "");
    },

    head(state, args, stdin) {
      let n = 10;
      const rest = [];
      for (let i = 0; i < args.length; i++) {
        if (args[i] === "-n") { n = parseInt(args[++i], 10); continue; }
        if (/^-\d+$/.test(args[i])) { n = parseInt(args[i].slice(1), 10); continue; }
        if (args[i].startsWith("-")) continue;
        rest.push(args[i]);
      }
      let content;
      if (rest.length === 0) content = stdin || "";
      else {
        const abs = resolvePath(rest[0], state.cwd, state.env);
        const node = getNode(state.fs, abs);
        if (!node) throw new Error(`head: cannot open '${rest[0]}': No such file or directory`);
        if (node.type !== "file") throw new Error(`head: ${rest[0]}: Is a directory`);
        content = node.content;
      }
      const lines = content.split("\n");
      const trailingNL = content.endsWith("\n");
      const sliced = lines.slice(0, trailingNL ? n : n);
      let out = sliced.join("\n");
      if (sliced.length < lines.length || trailingNL) out += "\n";
      return out;
    },

    tail(state, args, stdin) {
      let n = 10;
      const rest = [];
      for (let i = 0; i < args.length; i++) {
        if (args[i] === "-n") { n = parseInt(args[++i], 10); continue; }
        if (/^-\d+$/.test(args[i])) { n = parseInt(args[i].slice(1), 10); continue; }
        if (args[i].startsWith("-")) continue;
        rest.push(args[i]);
      }
      let content;
      if (rest.length === 0) content = stdin || "";
      else {
        const abs = resolvePath(rest[0], state.cwd, state.env);
        const node = getNode(state.fs, abs);
        if (!node) throw new Error(`tail: cannot open '${rest[0]}': No such file or directory`);
        if (node.type !== "file") throw new Error(`tail: ${rest[0]}: Is a directory`);
        content = node.content;
      }
      const trailingNL = content.endsWith("\n");
      const lines = trailingNL ? content.slice(0, -1).split("\n") : content.split("\n");
      const sliced = lines.slice(Math.max(0, lines.length - n));
      return sliced.join("\n") + (trailingNL || sliced.length ? "\n" : "");
    },

    wc(state, args, stdin) {
      const lFlag = args.some(a => /^-.*l/.test(a));
      const wFlag = args.some(a => /^-.*w/.test(a));
      const cFlag = args.some(a => /^-.*c/.test(a));
      const onlyOne = (lFlag + wFlag + cFlag) === 1;
      const paths = args.filter(a => !a.startsWith("-"));
      const fmt = (s, name) => {
        const lines = s.endsWith("\n") ? s.slice(0, -1).split("\n").length : (s.length ? s.split("\n").length : 0);
        const words = (s.match(/\S+/g) || []).length;
        const bytes = s.length;
        if (onlyOne) {
          const v = lFlag ? lines : wFlag ? words : bytes;
          return `${pad(v, name ? 7 : 0)}${name ? " " + name : ""}\n`;
        }
        return `${pad(lines, 7)} ${pad(words, 7)} ${pad(bytes, 7)}${name ? " " + name : ""}\n`;
      };
      if (paths.length === 0) return fmt(stdin || "", "");
      let out = "";
      for (const p of paths) {
        const abs = resolvePath(p, state.cwd, state.env);
        const node = getNode(state.fs, abs);
        if (!node) throw new Error(`wc: ${p}: No such file or directory`);
        if (node.type !== "file") throw new Error(`wc: ${p}: Is a directory`);
        out += fmt(node.content, p);
      }
      return out;
    },

    grep(state, args, stdin) {
      const flags = args.filter(a => a.startsWith("-") && a !== "-").join("");
      const positional = args.filter(a => !a.startsWith("-"));
      if (positional.length === 0) throw new Error("grep: missing pattern");
      const pattern = positional[0];
      const files = positional.slice(1);
      const ignoreCase = /i/.test(flags);
      const lineNum = /n/.test(flags);
      const invert = /v/.test(flags);
      let re;
      try { re = new RegExp(pattern, ignoreCase ? "i" : ""); }
      catch { throw new Error(`grep: bad pattern: ${pattern}`); }
      const inputs = [];
      if (files.length === 0) inputs.push({ name: null, content: stdin || "" });
      else for (const f of files) {
        const abs = resolvePath(f, state.cwd, state.env);
        const node = getNode(state.fs, abs);
        if (!node) throw new Error(`grep: ${f}: No such file or directory`);
        if (node.type !== "file") throw new Error(`grep: ${f}: Is a directory`);
        inputs.push({ name: f, content: node.content });
      }
      let out = "";
      for (const inp of inputs) {
        const lines = (inp.content.endsWith("\n") ? inp.content.slice(0, -1) : inp.content).split("\n");
        lines.forEach((line, i) => {
          const m = re.test(line);
          if (m !== invert) {
            let prefix = "";
            if (files.length > 1) prefix += `${inp.name}:`;
            if (lineNum) prefix += `${i + 1}:`;
            out += prefix + line + "\n";
          }
        });
      }
      return out;
    },

    sort(_state, args, stdin) {
      const content = stdin || "";
      const trailing = content.endsWith("\n");
      const lines = (trailing ? content.slice(0, -1) : content).split("\n");
      const reverse = args.some(a => /^-.*r/.test(a));
      const sorted = lines.slice().sort();
      if (reverse) sorted.reverse();
      return sorted.join("\n") + (lines.length ? "\n" : "");
    },

    uniq(_state, args, stdin) {
      const count = args.some(a => /^-.*c/.test(a));
      const content = stdin || "";
      const trailing = content.endsWith("\n");
      const lines = (trailing ? content.slice(0, -1) : content).split("\n");
      let out = "";
      let prev = null, n = 0;
      const emit = (line, c) => {
        out += count ? `${pad(c, 7)} ${line}\n` : `${line}\n`;
      };
      for (const line of lines) {
        if (prev === null) { prev = line; n = 1; continue; }
        if (line === prev) { n++; continue; }
        emit(prev, n); prev = line; n = 1;
      }
      if (prev !== null) emit(prev, n);
      return out;
    },

    clear() { return "\x1b[CLEAR]"; },
    help() { return "Available commands:\n  " + Object.keys(COMMANDS).sort().join("  ") + "\n"; },
  };

  // ---------- Run a single line ----------
  function runLine(state, line) {
    if (!line.trim()) return { stdout: "", error: null };
    let segments;
    try {
      const tokens = tokenize(line).map(t =>
        t.type === "word" ? { ...t, value: expandVars(t.value, state.env) } : t
      );
      segments = parseScript(tokens);
    } catch (e) {
      return { stdout: "", error: e.message };
    }

    let aggregateOut = "";
    let lastErr = null;
    for (const pipeline of segments) {
      let stdin = "";
      let pipelineOut = "";
      try {
        for (let i = 0; i < pipeline.length; i++) {
          const cmd = pipeline[i];
          if (cmd.argv.length === 0 && cmd.redirects.length === 0) continue;
          const name = cmd.argv[0];
          const rest = cmd.argv.slice(1);
          if (!(name in COMMANDS)) throw new Error(`${name}: command not found`);
          const piped = i < pipeline.length - 1 || cmd.redirects.length > 0;
          let out = COMMANDS[name](state, rest, stdin, { piped }) || "";
          // redirects on this command
          for (const r of cmd.redirects) {
            const abs = resolvePath(r.target, state.cwd, state.env);
            const { parent, name: fname } = getParent(state.fs, abs);
            if (!parent || parent.type !== "dir") {
              throw new Error(`${r.target}: No such file or directory`);
            }
            const existing = parent.children[fname];
            const prev = existing && existing.type === "file" ? existing.content : "";
            parent.children[fname] = {
              type: "file",
              content: (r.op === ">>" ? prev : "") + out,
            };
            out = "";
          }
          if (i === pipeline.length - 1) pipelineOut = out;
          stdin = out;
        }
      } catch (e) {
        aggregateOut += pipelineOut;
        return { stdout: aggregateOut, error: e.message };
      }
      aggregateOut += pipelineOut;
    }
    return { stdout: aggregateOut, error: lastErr };
  }

  // ---------- Expectation checker ----------
  function check(state, lastResult, expect) {
    const reasons = [];
    if (!expect) return { ok: true, reasons };
    if (expect.noError && lastResult && lastResult.error) {
      reasons.push(`Command errored: ${lastResult.error}`);
    }
    if (expect.stdoutTrimEquals !== undefined) {
      const got = (lastResult ? lastResult.stdout : "").trim();
      if (got !== expect.stdoutTrimEquals) {
        reasons.push(`Expected output: \`${expect.stdoutTrimEquals}\`, got: \`${got}\``);
      }
    }
    if (expect.stdoutContains) {
      const got = lastResult ? lastResult.stdout : "";
      const needles = Array.isArray(expect.stdoutContains) ? expect.stdoutContains : [expect.stdoutContains];
      for (const n of needles) {
        if (!got.includes(n)) reasons.push(`Expected output to contain \`${n}\``);
      }
    }
    if (expect.stdoutMatches) {
      const got = lastResult ? lastResult.stdout : "";
      if (!expect.stdoutMatches.test(got)) reasons.push(`Output did not match expected pattern`);
    }
    if (expect.exists) {
      for (const p of [].concat(expect.exists)) {
        if (!getNode(state.fs, p)) reasons.push(`Expected \`${p}\` to exist`);
      }
    }
    if (expect.isDir) {
      for (const p of [].concat(expect.isDir)) {
        const n = getNode(state.fs, p);
        if (!n) reasons.push(`Expected directory \`${p}\` to exist`);
        else if (n.type !== "dir") reasons.push(`Expected \`${p}\` to be a directory`);
      }
    }
    if (expect.isFile) {
      for (const p of [].concat(expect.isFile)) {
        const n = getNode(state.fs, p);
        if (!n) reasons.push(`Expected file \`${p}\` to exist`);
        else if (n.type !== "file") reasons.push(`Expected \`${p}\` to be a file`);
      }
    }
    if (expect.missing) {
      for (const p of [].concat(expect.missing)) {
        if (getNode(state.fs, p)) reasons.push(`Expected \`${p}\` to be removed`);
      }
    }
    if (expect.fileContent) {
      const list = Array.isArray(expect.fileContent) ? expect.fileContent : [expect.fileContent];
      for (const fc of list) {
        const n = getNode(state.fs, fc.path);
        if (!n) reasons.push(`\`${fc.path}\` does not exist`);
        else if (n.type !== "file") reasons.push(`\`${fc.path}\` is not a file`);
        else {
          if (fc.equals !== undefined && n.content !== fc.equals) {
            reasons.push(`\`${fc.path}\` contents don't match expected`);
          }
          if (fc.contains && !n.content.includes(fc.contains)) {
            reasons.push(`\`${fc.path}\` should contain \`${fc.contains}\``);
          }
        }
      }
    }
    if (expect.cwd && state.cwd !== expect.cwd) {
      reasons.push(`Expected current directory \`${expect.cwd}\`, got \`${state.cwd}\``);
    }
    return { ok: reasons.length === 0, reasons };
  }

  // ---------- Shell instance ----------
  function create(initial) {
    const env = Object.assign({ HOME: "/home/user", PWD: initial.cwd || "/home/user", USER: "user" }, initial.env || {});
    const fs = deepClone(initial.fs);
    const state = { fs, cwd: initial.cwd || env.HOME, env };

    function reset() {
      state.fs = deepClone(initial.fs);
      state.cwd = initial.cwd || env.HOME;
      state.env = Object.assign({ HOME: "/home/user", PWD: state.cwd, USER: "user" }, initial.env || {});
    }

    function run(line) {
      const r = runLine(state, line);
      state.env.PWD = state.cwd;
      return r;
    }

    return { state, run, reset };
  }

  window.Shell = { create, check, formatCwd };
})();