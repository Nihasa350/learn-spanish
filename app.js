// code-training: tiny flashcard + MC engine, no build step.
//
// Data is loaded from window.<TOPIC>_CARDS globals (see data/bash.js).
// Per-card progress (right/wrong counts + last-seen) is persisted to
// localStorage under key `ct:progress:<topic>` so weak cards resurface more.

const TOPICS = {
  bash: () => window.BASH_CARDS || [],
};

const EXERCISES = {
  bash: () => window.BASH_EXERCISES || [],
};

const state = {
  topic: "bash",
  mode: "flash",        // "flash" | "mc" | "ex"
  tag: "",              // active tag filter, "" = all
  weakOnly: false,
  pool: [],             // filtered cards (flash/mc)
  exPool: [],           // filtered exercises
  current: null,
  flipped: false,
  mc: { choices: [], answered: false, correctIndex: -1 },
  ex: {
    current: null,      // current exercise
    shell: null,        // shell instance
    history: [],        // strings: lines entered this attempt
    lastResult: null,   // last { stdout, error }
    solved: false,
    revealed: false,
  },
  session: { seen: 0, correct: 0, wrong: 0 },
  progress: {},         // { [cardId]: { right, wrong, last } }
};

// ---------- Concepts (Reference + inline lookup) ----------
function getConcept(name) {
  const concepts = window.BASH_CONCEPTS || {};
  return concepts[name] || null;
}

// Pull command names out of an answer string for "look up" chips.
// e.g. "grep ERROR access.log | wc -l" → ["grep", "wc"]
// Operators (>, >>, |, 2>) are also surfaced if they have a concept entry.
function extractCommands(text) {
  if (!text) return [];
  const concepts = window.BASH_CONCEPTS || {};
  const found = [];
  const seen = new Set();
  const add = name => {
    if (!name || seen.has(name) || !(name in concepts)) return;
    seen.add(name); found.push(name);
  };
  // Operators
  if (/(^|\s)>>(\s|$)/.test(text)) add(">>");
  else if (/(^|\s)>(\s|$)/.test(text)) add(">");
  if (/2>/.test(text)) add("2>");
  if (/\|/.test(text)) add("|");
  // Commands: first word of each pipe/&&/; segment
  for (const seg of text.split(/\||&&|;|\n/)) {
    const tokens = seg.trim().split(/\s+/);
    let i = 0;
    while (i < tokens.length && /^[A-Z_]+=/.test(tokens[i])) i++; // skip env-var prefixes
    if (tokens[i] === "sudo") i++;
    add(tokens[i]);
  }
  return found;
}

function cmdChipHTML(name) {
  return `<button class="cmd-chip" type="button" data-concept="${escapeHtml(name)}">${escapeHtml(name)}</button>`;
}

function explainRowHTML(commands, label = "Look up") {
  if (!commands || commands.length === 0) return "";
  const chips = commands.map(cmdChipHTML).join("");
  return `<div class="explain-row"><span>${escapeHtml(label)}:</span>${chips}</div>`;
}

function conceptDetailHTML(name) {
  const c = getConcept(name);
  if (!c) return `<div class="ref-detail-empty">No reference for <code>${escapeHtml(name)}</code>.</div>`;
  const flags = (c.flags && c.flags.length)
    ? `<div class="ref-section"><h3>Common flags</h3><div class="ref-flags">${
        c.flags.map(f =>
          `<div class="ref-flag"><code>${escapeHtml(f.flag)}</code><span class="desc">${escapeHtml(f.desc)}</span></div>`
        ).join("")
      }</div></div>`
    : "";
  const examples = (c.examples && c.examples.length)
    ? `<div class="ref-section"><h3>Examples</h3><div class="ref-examples">${
        c.examples.map(e =>
          `<div class="ref-example"><span class="cmd">${escapeHtml(e.cmd)}</span>${
            e.note ? `<span class="note">— ${escapeHtml(e.note)}</span>` : ""
          }</div>`
        ).join("")
      }</div></div>`
    : "";
  const seeAlso = (c.seeAlso && c.seeAlso.length)
    ? `<div class="ref-section"><h3>See also</h3><div class="ref-also">${
        c.seeAlso.map(cmdChipHTML).join("")
      }</div></div>`
    : "";
  return `
    <div>
      <span class="ref-cmd">${escapeHtml(name)}</span>
      <div class="ref-summary">${escapeHtml(c.summary || "")}</div>
    </div>
    ${c.description ? `<div class="ref-section"><h3>What it does</h3><div class="ref-desc">${escapeHtml(c.description)}</div></div>` : ""}
    ${flags}
    ${examples}
    ${seeAlso}
  `;
}

// ---------- Modal ----------
function openConceptModal(name) {
  const modal = document.getElementById("modal");
  document.getElementById("modal-body").innerHTML = conceptDetailHTML(name);
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
}
function closeModal() {
  const modal = document.getElementById("modal");
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
}

// ---------- Reference view ----------
function renderRef(initialCommand) {
  const concepts = window.BASH_CONCEPTS || {};
  const order = window.BASH_CATEGORY_ORDER || [];
  const list = document.getElementById("ref-list");
  const search = (document.getElementById("ref-search").value || "").trim().toLowerCase();

  // Group by category
  const byCat = {};
  for (const [name, c] of Object.entries(concepts)) {
    if (search) {
      const hay = (name + " " + (c.summary || "") + " " + (c.description || "")).toLowerCase();
      if (!hay.includes(search)) continue;
    }
    const cat = c.category || "Other";
    (byCat[cat] = byCat[cat] || []).push(name);
  }
  const cats = [...new Set([...order, ...Object.keys(byCat)])].filter(c => byCat[c]);

  list.innerHTML = "";
  for (const cat of cats) {
    const group = document.createElement("div");
    group.className = "ref-group";
    group.textContent = cat;
    list.appendChild(group);
    for (const name of byCat[cat]) {
      const btn = document.createElement("button");
      btn.className = "ref-item";
      btn.dataset.concept = name;
      btn.innerHTML = `<span>${escapeHtml(name)}</span><span class="ri-summary">${escapeHtml(concepts[name].summary || "")}</span>`;
      btn.addEventListener("click", () => selectRef(name));
      list.appendChild(btn);
    }
  }

  // Pick something to show on the right
  const flat = cats.flatMap(c => byCat[c]);
  const target = (initialCommand && concepts[initialCommand]) ? initialCommand : (flat[0] || null);
  if (target) selectRef(target);
  else document.getElementById("ref-detail").innerHTML = '<div class="ref-detail-empty">No matches.</div>';
}

function selectRef(name) {
  document.querySelectorAll(".ref-item").forEach(b => {
    b.classList.toggle("active", b.dataset.concept === name);
  });
  document.getElementById("ref-detail").innerHTML = conceptDetailHTML(name);
}

// ---------- Persistence ----------
function progressKey(topic) { return `ct:progress:${topic}`; }

function loadProgress() {
  try {
    const raw = localStorage.getItem(progressKey(state.topic));
    state.progress = raw ? JSON.parse(raw) : {};
  } catch { state.progress = {}; }
}
function saveProgress() {
  try { localStorage.setItem(progressKey(state.topic), JSON.stringify(state.progress)); }
  catch {}
}
function recordResult(cardId, ok) {
  const p = state.progress[cardId] || { right: 0, wrong: 0, last: 0 };
  if (ok) p.right += 1; else p.wrong += 1;
  p.last = Date.now();
  state.progress[cardId] = p;
  saveProgress();
}

// ---------- Pool / weighting ----------
function applyFilters(items) {
  let pool = items.filter(it => !state.tag || (it.tags || []).includes(state.tag));
  if (state.weakOnly) {
    const weak = pool.filter(it => {
      const p = state.progress[it.id];
      return !p || p.wrong > p.right;
    });
    if (weak.length) return weak;
  }
  return pool;
}

function rebuildPool() {
  state.pool = applyFilters(TOPICS[state.topic]());
  state.exPool = applyFilters(EXERCISES[state.topic]());
  const stat = document.getElementById("stat-pool");
  if (state.mode === "ex") stat.textContent = `${state.exPool.length} exercises in pool`;
  else stat.textContent = `${state.pool.length} cards in pool`;
}

// Weighted random pick: items you got wrong more often appear more.
// Weight = 1 + 2*wrong - right (floored at 0.25).
function pickFrom(pool) {
  if (pool.length === 0) return null;
  const weights = pool.map(c => {
    const p = state.progress[c.id] || { right: 0, wrong: 0 };
    return Math.max(0.25, 1 + 2 * p.wrong - p.right);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

// Avoid showing the same item twice in a row when possible.
function pickNext(pool, prevId) {
  if (pool.length <= 1) return pickFrom(pool);
  for (let i = 0; i < 8; i++) {
    const c = pickFrom(pool);
    if (!prevId || c.id !== prevId) return c;
  }
  return pickFrom(pool);
}

function pickCard() { return pickFrom(state.pool); }
function pickNextCard(prevId) { return pickNext(state.pool, prevId); }
function pickExercise() { return pickFrom(state.exPool); }
function pickNextExercise(prevId) { return pickNext(state.exPool, prevId); }

// ---------- Flashcard view ----------
function renderFlash() {
  if (!state.current) state.current = pickNextCard(null);
  if (!state.current) {
    document.getElementById("flash-prompt").textContent = "No cards match. Adjust the filter.";
    return;
  }
  state.flipped = false;
  document.getElementById("flash-prompt").textContent = state.current.prompt;
  document.getElementById("flash-answer").textContent = state.current.answer;
  document.getElementById("flash-explain").textContent = state.current.explain || "";
  document.querySelector("#flash-card .card-front").hidden = false;
  document.querySelector("#flash-card .card-back").hidden = true;
  document.getElementById("flash-reveal").hidden = false;
  document.getElementById("flash-rate").hidden = true;
}

function flipFlash() {
  if (state.flipped || !state.current) return;
  state.flipped = true;
  document.querySelector("#flash-card .card-front").hidden = true;
  document.querySelector("#flash-card .card-back").hidden = false;
  document.getElementById("flash-reveal").hidden = true;
  document.getElementById("flash-rate").hidden = false;

  // Surface command lookup chips for the answer
  const back = document.querySelector("#flash-card .card-back");
  back.querySelectorAll(":scope > .explain-row").forEach(el => el.remove());
  const cmds = extractCommands(state.current.answer);
  if (cmds.length) {
    const div = document.createElement("div");
    div.className = "explain-row";
    div.innerHTML = `<span>Look up:</span>${cmds.map(cmdChipHTML).join("")}`;
    back.insertBefore(div, back.querySelector(".card-hint"));
  }
}

function rateFlash(rate) {
  if (!state.flipped || !state.current) return;
  const ok = rate === "ok";
  state.session.seen += 1;
  if (ok) state.session.correct += 1; else state.session.wrong += 1;
  recordResult(state.current.id, ok);
  updateStats();
  const prevId = state.current.id;
  state.current = pickNextCard(prevId);
  renderFlash();
}

function skipFlash() {
  const prevId = state.current ? state.current.id : null;
  state.current = pickNextCard(prevId);
  renderFlash();
}

// ---------- Multiple choice view ----------
function buildChoices(card) {
  // If the card author supplied choices, use them; else sample distractors.
  let choices;
  if (card.choices && card.choices.length) {
    choices = [...new Set([card.answer, ...card.choices])].slice(0, 4);
  } else {
    const all = TOPICS[state.topic]();
    const pool = all
      .filter(c => c.id !== card.id && c.answer && c.answer !== card.answer)
      .map(c => c.answer);
    const distractors = [];
    const used = new Set();
    while (distractors.length < 3 && pool.length > 0) {
      const i = Math.floor(Math.random() * pool.length);
      const v = pool.splice(i, 1)[0];
      if (!used.has(v)) { used.add(v); distractors.push(v); }
    }
    choices = [card.answer, ...distractors];
  }
  // shuffle
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}

function renderMC() {
  if (!state.current) state.current = pickNextCard(null);
  if (!state.current) {
    document.getElementById("mc-prompt").textContent = "No cards match. Adjust the filter.";
    document.getElementById("mc-choices").innerHTML = "";
    return;
  }
  const card = state.current;
  const choices = buildChoices(card);
  state.mc.choices = choices;
  state.mc.answered = false;
  state.mc.correctIndex = choices.indexOf(card.answer);

  document.getElementById("mc-prompt").textContent = card.prompt;
  const wrap = document.getElementById("mc-choices");
  wrap.innerHTML = "";
  choices.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "mc-choice";
    btn.dataset.index = String(i);
    btn.innerHTML = `<span class="idx">${i + 1}</span><span>${escapeHtml(text)}</span>`;
    btn.addEventListener("click", () => answerMC(i));
    wrap.appendChild(btn);
  });
  document.getElementById("mc-feedback").hidden = true;
  document.getElementById("mc-next").hidden = true;
}

function answerMC(i) {
  if (state.mc.answered || !state.current) return;
  state.mc.answered = true;
  const ok = i === state.mc.correctIndex;
  state.session.seen += 1;
  if (ok) state.session.correct += 1; else state.session.wrong += 1;
  recordResult(state.current.id, ok);
  updateStats();

  const buttons = [...document.querySelectorAll(".mc-choice")];
  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === state.mc.correctIndex) btn.classList.add("correct");
    if (idx === i && !ok) btn.classList.add("wrong");
  });

  const fb = document.getElementById("mc-feedback");
  const explain = state.current.explain ? `<div>${escapeHtml(state.current.explain)}</div>` : "";
  const lookup = explainRowHTML(extractCommands(state.current.answer));
  fb.innerHTML = `
    <div class="label">${ok ? "Correct" : "Not quite"}</div>
    <div><code>${escapeHtml(state.current.answer)}</code></div>
    ${explain}
    ${lookup}
  `;
  fb.hidden = false;
  const next = document.getElementById("mc-next");
  next.hidden = false;
  next.focus();
}

function nextMC() {
  const prevId = state.current ? state.current.id : null;
  state.current = pickNextCard(prevId);
  renderMC();
}

// ---------- Exercise view ----------
function loadExercise(exercise) {
  state.ex.current = exercise;
  state.ex.shell = window.Shell.create(exercise.initial);
  state.ex.history = [];
  state.ex.lastResult = null;
  state.ex.solved = false;
  state.ex.revealed = false;
}

function renderExStatic() {
  const ex = state.ex.current;
  document.getElementById("ex-prompt").textContent = ex.prompt;

  const ctx = document.getElementById("ex-context");
  if (ex.context) { ctx.textContent = ex.context; ctx.hidden = false; }
  else { ctx.hidden = true; }

  const hintBtn = document.getElementById("ex-hint-btn");
  const hint = document.getElementById("ex-hint");
  hint.hidden = true;
  hint.textContent = "";
  if (ex.hint) { hintBtn.hidden = false; }
  else { hintBtn.hidden = true; }

  document.getElementById("term-output").innerHTML = "";
  document.getElementById("ex-feedback").hidden = true;
  document.getElementById("ex-next").hidden = true;
  const input = document.getElementById("term-input");
  input.value = "";
  input.disabled = false;
  updatePrompt();
  input.focus();
}

function updatePrompt() {
  const sh = state.ex.shell;
  if (!sh) return;
  const cwd = window.Shell.formatCwd(sh.state.cwd, sh.state.env.HOME);
  document.getElementById("term-prompt").textContent = `user@box:${cwd}$`;
}

function termAppend(html) {
  const out = document.getElementById("term-output");
  const div = document.createElement("div");
  div.innerHTML = html;
  out.appendChild(div);
  const term = document.getElementById("terminal");
  term.scrollTop = term.scrollHeight;
}

function runExLine(line) {
  if (!state.ex.shell) return;
  const sh = state.ex.shell;
  const cwd = window.Shell.formatCwd(sh.state.cwd, sh.state.env.HOME);
  const prompt = `user@box:${cwd}$`;
  termAppend(`<span class="echo"><span class="p">${escapeHtml(prompt)}</span> ${escapeHtml(line)}</span>`);
  if (!line.trim()) return;

  const result = sh.run(line);
  state.ex.lastResult = result;
  state.ex.history.push(line);

  if (result.stdout && result.stdout !== "\x1b[CLEAR]") {
    termAppend(escapeHtml(result.stdout.replace(/\n$/, "")));
  }
  if (result.stdout === "\x1b[CLEAR]") {
    document.getElementById("term-output").innerHTML = "";
  }
  if (result.error) {
    termAppend(`<span class="err">${escapeHtml(result.error)}</span>`);
  }
  updatePrompt();

  // Check expectations
  const verdict = window.Shell.check(sh.state, result, state.ex.current.expect);
  if (verdict.ok) markExSolved();
  else if (result.error) showExFeedback(false, [result.error]);
  else document.getElementById("ex-feedback").hidden = true;
}

function markExSolved() {
  if (state.ex.solved) return;
  state.ex.solved = true;
  state.session.seen += 1;
  if (state.ex.revealed) {
    state.session.wrong += 1;
    recordResult(state.ex.current.id, false);
  } else {
    state.session.correct += 1;
    recordResult(state.ex.current.id, true);
  }
  updateStats();
  showExFeedback(true);
  document.getElementById("ex-next").hidden = false;
  document.getElementById("ex-next").focus();
}

function showExFeedback(ok, reasons) {
  const fb = document.getElementById("ex-feedback");
  fb.hidden = false;
  fb.classList.toggle("ok", !!ok);
  fb.classList.toggle("bad", !ok);
  if (ok) {
    const expl = state.ex.current.answer
      ? `<div>One way: <code>${escapeHtml(state.ex.current.answer)}</code></div>`
      : "";
    const lookup = explainRowHTML(extractCommands(state.ex.current.answer));
    fb.innerHTML = `<div class="label">Solved</div>${expl}${lookup}`;
  } else {
    const list = (reasons || []).map(r => `<li>${escapeHtml(r)}</li>`).join("");
    fb.innerHTML = `<div class="label">Try again</div><ul>${list}</ul>`;
  }
}

function resetExercise() {
  if (!state.ex.current) return;
  state.ex.shell.reset();
  state.ex.history = [];
  state.ex.lastResult = null;
  state.ex.solved = false;
  document.getElementById("term-output").innerHTML = "";
  document.getElementById("ex-feedback").hidden = true;
  document.getElementById("ex-next").hidden = true;
  updatePrompt();
  const input = document.getElementById("term-input");
  input.disabled = false;
  input.value = "";
  input.focus();
}

function nextExercise() {
  const prevId = state.ex.current ? state.ex.current.id : null;
  const next = pickNextExercise(prevId);
  if (!next) {
    document.getElementById("ex-prompt").textContent = "No exercises match. Adjust the filter.";
    document.getElementById("term-output").innerHTML = "";
    document.getElementById("ex-feedback").hidden = true;
    return;
  }
  loadExercise(next);
  renderExStatic();
}

function showExAnswer() {
  if (!state.ex.current) return;
  state.ex.revealed = true;
  termAppend(
    `<span class="echo">// answer: <code>${escapeHtml(state.ex.current.answer)}</code></span>`
  );
}

function showExHint() {
  if (!state.ex.current || !state.ex.current.hint) return;
  const hint = document.getElementById("ex-hint");
  hint.textContent = state.ex.current.hint;
  hint.hidden = false;
  state.ex.revealed = true; // counted as needing help
}

function skipExercise() {
  if (state.ex.current && !state.ex.solved) {
    state.session.seen += 1;
    state.session.wrong += 1;
    recordResult(state.ex.current.id, false);
    updateStats();
  }
  nextExercise();
}

// ---------- View / mode switching ----------
function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll(".seg-btn").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  document.getElementById("flash-view").classList.toggle("active", mode === "flash");
  document.getElementById("mc-view").classList.toggle("active", mode === "mc");
  document.getElementById("ex-view").classList.toggle("active", mode === "ex");
  document.getElementById("ref-view").classList.toggle("active", mode === "ref");
  state.current = null;

  const stat = document.getElementById("stat-pool");
  if (mode === "ex") stat.textContent = `${state.exPool.length} exercises in pool`;
  else if (mode === "ref") stat.textContent = `${Object.keys(window.BASH_CONCEPTS || {}).length} commands in reference`;
  else stat.textContent = `${state.pool.length} cards in pool`;

  if (mode === "flash") renderFlash();
  else if (mode === "mc") renderMC();
  else if (mode === "ex") nextExercise();
  else if (mode === "ref") renderRef();
}

// ---------- Filters / stats ----------
function populateTagFilter() {
  const sel = document.getElementById("tag-filter");
  const tags = new Set();
  TOPICS[state.topic]().forEach(c => (c.tags || []).forEach(t => tags.add(t)));
  EXERCISES[state.topic]().forEach(c => (c.tags || []).forEach(t => tags.add(t)));
  sel.innerHTML = '<option value="">All tags</option>';
  [...tags].sort().forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    sel.appendChild(opt);
  });
}

function updateStats() {
  document.getElementById("stat-seen").textContent = state.session.seen;
  document.getElementById("stat-correct").textContent = state.session.correct;
  document.getElementById("stat-wrong").textContent = state.session.wrong;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

// ---------- Wiring ----------
function wire() {
  document.querySelectorAll(".seg-btn").forEach(btn => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });

  function refreshAfterFilterChange() {
    rebuildPool();
    state.current = null;
    if (state.mode === "flash") renderFlash();
    else if (state.mode === "mc") renderMC();
    else nextExercise();
  }

  document.getElementById("tag-filter").addEventListener("change", e => {
    state.tag = e.target.value;
    refreshAfterFilterChange();
  });

  document.getElementById("weak-only").addEventListener("change", e => {
    state.weakOnly = e.target.checked;
    refreshAfterFilterChange();
  });

  document.getElementById("reset-progress").addEventListener("click", () => {
    if (!confirm("Clear saved progress for this topic?")) return;
    localStorage.removeItem(progressKey(state.topic));
    state.progress = {};
    state.session = { seen: 0, correct: 0, wrong: 0 };
    updateStats();
    refreshAfterFilterChange();
  });

  document.getElementById("flash-reveal").addEventListener("click", flipFlash);
  document.getElementById("flash-skip").addEventListener("click", skipFlash);
  document.querySelectorAll(".rate").forEach(b => {
    b.addEventListener("click", () => rateFlash(b.dataset.rate));
  });

  document.getElementById("mc-next").addEventListener("click", nextMC);

  document.getElementById("ex-reset").addEventListener("click", resetExercise);
  document.getElementById("ex-show-answer").addEventListener("click", showExAnswer);
  document.getElementById("ex-hint-btn").addEventListener("click", showExHint);
  document.getElementById("ex-skip").addEventListener("click", skipExercise);
  document.getElementById("ex-next").addEventListener("click", nextExercise);

  // Reference search re-renders the list on every keystroke
  document.getElementById("ref-search").addEventListener("input", () => {
    if (state.mode === "ref") renderRef();
  });

  // Modal: close button + backdrop click
  document.getElementById("modal").addEventListener("click", e => {
    if (e.target.matches("[data-close]")) closeModal();
  });

  // Delegate clicks on any .cmd-chip anywhere on the page → open the concept modal
  document.addEventListener("click", e => {
    const chip = e.target.closest(".cmd-chip");
    if (chip && chip.dataset.concept) {
      e.preventDefault();
      openConceptModal(chip.dataset.concept);
    }
  });

  const termInput = document.getElementById("term-input");
  termInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (state.ex.solved) { nextExercise(); return; }
      const line = termInput.value;
      termInput.value = "";
      runExLine(line);
    }
  });
  // Focus the input when the terminal area is clicked.
  document.getElementById("terminal").addEventListener("click", () => {
    if (state.mode === "ex" && !state.ex.solved) {
      document.getElementById("term-input").focus();
    }
  });

  document.addEventListener("keydown", onKey);
}

function onKey(e) {
  // Escape closes the modal from anywhere
  if (e.key === "Escape" && !document.getElementById("modal").hidden) {
    e.preventDefault();
    closeModal();
    return;
  }

  // Don't hijack typing in inputs/selects. The terminal input has its own handler.
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "select" || tag === "textarea") return;

  if (state.mode === "ex") {
    if (e.key === "Enter" && state.ex.solved) {
      e.preventDefault();
      nextExercise();
    }
    return;
  }

  if (state.mode === "flash") {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!state.flipped) flipFlash();
    } else if (e.key === "1") {
      if (state.flipped) rateFlash("hard");
    } else if (e.key === "2") {
      if (state.flipped) rateFlash("ok");
    } else if (e.key.toLowerCase() === "s") {
      skipFlash();
    }
  } else if (state.mode === "mc") {
    if (!state.mc.answered) {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= state.mc.choices.length) {
        answerMC(n - 1);
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      nextMC();
    }
  }
}

// ---------- Boot ----------
function boot() {
  loadProgress();
  populateTagFilter();
  rebuildPool();
  wire();
  setMode("flash");
  updateStats();
}

document.addEventListener("DOMContentLoaded", boot);