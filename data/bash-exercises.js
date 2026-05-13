// Bash exercises — solved against the in-browser shell simulator (see shell.js).
//
// Each exercise:
//   id:      stable id for progress tracking
//   prompt:  what the user is asked to do
//   hint:    optional one-liner hint
//   answer:  canonical solution (revealed via Show answer)
//   initial: { fs, cwd?, env? } — starting state, deep-cloned per attempt
//   context: optional short string shown above the terminal explaining setup
//   expect:  { stdoutTrimEquals?, stdoutContains?, exists?, isDir?, isFile?,
//              missing?, fileContent?, cwd?, noError? } — all must pass
//   tags:    topic tags

const HOME = "/home/user";

// Convenience builders for filesystems.
const dir = (children = {}) => ({ type: "dir", children });
const file = (content = "") => ({ type: "file", content });

// A "home with user dir" base so paths exist for relative ops.
function homeFs(userChildren = {}) {
  return dir({
    home: dir({
      user: dir(userChildren),
    }),
  });
}

window.BASH_EXERCISES = [
  {
    id: "ex-pwd",
    prompt: "Print the path of the current working directory.",
    answer: "pwd",
    initial: { fs: homeFs(), cwd: HOME },
    expect: { noError: true, stdoutTrimEquals: "/home/user" },
    tags: ["navigation"],
  },
  {
    id: "ex-ls-basic",
    prompt: "List the files in the current directory.",
    answer: "ls",
    context: "Your home folder contains notes.txt and README.md.",
    initial: { fs: homeFs({ "notes.txt": file("…"), "README.md": file("# hi\n") }), cwd: HOME },
    expect: { noError: true, stdoutContains: ["notes.txt", "README.md"] },
    tags: ["navigation"],
  },
  {
    id: "ex-ls-hidden",
    prompt: "List ALL files in the current directory, including hidden ones (names starting with a dot).",
    hint: "There's a flag for that.",
    answer: "ls -a",
    context: "The home dir contains hello.txt and a hidden .bashrc.",
    initial: { fs: homeFs({ "hello.txt": file(""), ".bashrc": file("export PS1='$ '\n") }), cwd: HOME },
    expect: { noError: true, stdoutContains: [".bashrc", "hello.txt"] },
    tags: ["navigation"],
  },
  {
    id: "ex-mkdir",
    prompt: "Create a new directory called `projects`.",
    answer: "mkdir projects",
    initial: { fs: homeFs(), cwd: HOME },
    expect: { noError: true, isDir: "/home/user/projects" },
    tags: ["files"],
  },
  {
    id: "ex-mkdir-p",
    prompt: "Create the nested directories `code/practice/bash` in one command.",
    hint: "Use the flag that creates missing parents.",
    answer: "mkdir -p code/practice/bash",
    initial: { fs: homeFs(), cwd: HOME },
    expect: { noError: true, isDir: "/home/user/code/practice/bash" },
    tags: ["files"],
  },
  {
    id: "ex-touch",
    prompt: "Create an empty file called `hello.txt`.",
    answer: "touch hello.txt",
    initial: { fs: homeFs(), cwd: HOME },
    expect: { noError: true, isFile: "/home/user/hello.txt", fileContent: { path: "/home/user/hello.txt", equals: "" } },
    tags: ["files"],
  },
  {
    id: "ex-echo-redirect",
    prompt: "Write the word `hello` into a new file called `greeting.txt`.",
    hint: "Combine `echo` with the `>` redirect.",
    answer: "echo hello > greeting.txt",
    initial: { fs: homeFs(), cwd: HOME },
    expect: { noError: true, fileContent: { path: "/home/user/greeting.txt", equals: "hello\n" } },
    tags: ["pipes", "files"],
  },
  {
    id: "ex-echo-append",
    prompt: "Append the word `world` to the end of `greeting.txt`.",
    hint: "`>` overwrites — you want the operator that appends.",
    context: "greeting.txt currently contains `hello\\n`.",
    answer: "echo world >> greeting.txt",
    initial: { fs: homeFs({ "greeting.txt": file("hello\n") }), cwd: HOME },
    expect: { noError: true, fileContent: { path: "/home/user/greeting.txt", equals: "hello\nworld\n" } },
    tags: ["pipes", "files"],
  },
  {
    id: "ex-cat",
    prompt: "Print the contents of `secret.txt` to the terminal.",
    answer: "cat secret.txt",
    context: "secret.txt contains the line `the answer is 42`.",
    initial: { fs: homeFs({ "secret.txt": file("the answer is 42\n") }), cwd: HOME },
    expect: { noError: true, stdoutContains: "the answer is 42" },
    tags: ["reading"],
  },
  {
    id: "ex-cp",
    prompt: "Copy `notes.txt` to `notes-backup.txt`.",
    answer: "cp notes.txt notes-backup.txt",
    context: "notes.txt exists with some content.",
    initial: { fs: homeFs({ "notes.txt": file("important stuff\n") }), cwd: HOME },
    expect: {
      noError: true,
      isFile: ["/home/user/notes.txt", "/home/user/notes-backup.txt"],
      fileContent: { path: "/home/user/notes-backup.txt", equals: "important stuff\n" },
    },
    tags: ["files"],
  },
  {
    id: "ex-mv-rename",
    prompt: "Rename `old.txt` to `new.txt`.",
    answer: "mv old.txt new.txt",
    initial: { fs: homeFs({ "old.txt": file("contents\n") }), cwd: HOME },
    expect: { noError: true, missing: "/home/user/old.txt", isFile: "/home/user/new.txt" },
    tags: ["files"],
  },
  {
    id: "ex-rm",
    prompt: "Delete the file `trash.txt`.",
    answer: "rm trash.txt",
    initial: { fs: homeFs({ "trash.txt": file("bye\n"), "keep.txt": file("hi\n") }), cwd: HOME },
    expect: { noError: true, missing: "/home/user/trash.txt", isFile: "/home/user/keep.txt" },
    tags: ["files"],
  },
  {
    id: "ex-rm-r",
    prompt: "Delete the directory `old_project` and everything inside it.",
    hint: "You need a recursive flag.",
    answer: "rm -r old_project",
    initial: {
      fs: homeFs({
        old_project: dir({
          "main.py": file("print('hi')\n"),
          "README.md": file("# old\n"),
        }),
      }),
      cwd: HOME,
    },
    expect: { noError: true, missing: "/home/user/old_project" },
    tags: ["files"],
  },
  {
    id: "ex-cd",
    prompt: "Change into the `projects` directory.",
    answer: "cd projects",
    initial: { fs: homeFs({ projects: dir({ "todo.md": file("") }) }), cwd: HOME },
    expect: { noError: true, cwd: "/home/user/projects" },
    tags: ["navigation"],
  },
  {
    id: "ex-cd-up",
    prompt: "Go up one directory level (back to /home/user).",
    answer: "cd ..",
    initial: { fs: homeFs({ projects: dir() }), cwd: "/home/user/projects" },
    expect: { noError: true, cwd: "/home/user" },
    tags: ["navigation"],
  },
  {
    id: "ex-wc-l",
    prompt: "Count the number of lines in `log.txt`.",
    answer: "wc -l log.txt",
    context: "log.txt has 5 lines.",
    initial: { fs: homeFs({ "log.txt": file("a\nb\nc\nd\ne\n") }), cwd: HOME },
    expect: { noError: true, stdoutContains: "5" },
    tags: ["reading"],
  },
  {
    id: "ex-grep",
    prompt: "Find every line in `todo.txt` that contains the word `URGENT`.",
    answer: "grep URGENT todo.txt",
    context: "todo.txt has a few lines, some marked URGENT.",
    initial: {
      fs: homeFs({
        "todo.txt": file(
          "buy milk\n" +
          "URGENT: pay rent\n" +
          "renew library card\n" +
          "URGENT: call mom\n"
        ),
      }),
      cwd: HOME,
    },
    expect: { noError: true, stdoutContains: ["URGENT: pay rent", "URGENT: call mom"] },
    tags: ["search"],
  },
  {
    id: "ex-pipe-ls-wc",
    prompt: "Count how many files (and dirs) are in the current directory.",
    hint: "Pipe `ls` into `wc -l`.",
    answer: "ls | wc -l",
    context: "There are 3 files in the home dir.",
    initial: {
      fs: homeFs({ "a.txt": file(""), "b.txt": file(""), "c.txt": file("") }),
      cwd: HOME,
    },
    expect: { noError: true, stdoutContains: "3" },
    tags: ["pipes"],
  },
  {
    id: "ex-pipe-grep-count",
    prompt: "Count how many lines in `access.log` contain the text `ERROR`.",
    hint: "`grep` then pipe to `wc -l`.",
    answer: "grep ERROR access.log | wc -l",
    context: "access.log has 6 lines; 2 contain ERROR.",
    initial: {
      fs: homeFs({
        "access.log": file(
          "INFO start\n" +
          "ERROR db timeout\n" +
          "INFO retrying\n" +
          "INFO ok\n" +
          "ERROR cache miss\n" +
          "INFO done\n"
        ),
      }),
      cwd: HOME,
    },
    expect: { noError: true, stdoutContains: "2" },
    tags: ["pipes", "search"],
  },
  {
    id: "ex-mkdir-cd",
    prompt: "Create a directory called `workspace` and then change into it.",
    hint: "You can chain commands with `&&` or run them on separate lines.",
    answer: "mkdir workspace && cd workspace",
    initial: { fs: homeFs(), cwd: HOME },
    expect: { noError: true, isDir: "/home/user/workspace", cwd: "/home/user/workspace" },
    tags: ["navigation", "files"],
  },
];