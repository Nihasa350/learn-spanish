# code-training

A tiny flashcard + multiple-choice app for learning to code by doing and repetition. Starting with **bash**.

## Run it

Pick whichever's least friction for you. All four paths serve the same files.

```bash
# 1. Docker (recommended — no python needed; one command)
make up                   # → http://localhost:8080
make down                 # stop

# 2. Python http.server (no Docker needed)
make serve                # → http://localhost:8000  (Ctrl+C to stop)

# 3. Just open the file
xdg-open index.html       # localStorage works but some browsers complain

# 4. Self-contained image (no bind mounts; for shipping to a server)
make rebuild              # builds from Dockerfile then runs
```

Override ports: `make up PORT=9090`, `make serve PORT=9000`.

`make up` bind-mounts the source directory into the container, so edits to
`index.html` / `app.js` / `shell.js` / `data/*.js` show up on a browser refresh
with no rebuild. `make rebuild` produces a portable image that includes the
files (uses `docker-compose.build.yml` + the `Dockerfile`).

## What's in it

- **Flashcards** — prompt → flip → rate yourself (knew it / got it wrong).
- **Multiple choice** — pick the right command from 4 options.
- **Exercises** — type real bash into a simulated terminal; we check the resulting filesystem / output. Supports `pwd`, `cd`, `ls`, `mkdir`, `touch`, `rm`, `cp`, `mv`, `cat`, `echo`, `head`, `tail`, `wc`, `grep`, `sort`, `uniq`, plus pipes (`|`), redirects (`>` / `>>`), and chained commands (`&&`).
- **Weighted practice** — items you get wrong resurface more often.
- **Tag filter** — narrow to e.g. just `pipes` or `permissions`.
- **Focus weak cards** — only practice ones you've been getting wrong.
- Progress is saved per topic in `localStorage`.

## Keyboard shortcuts

| Mode         | Key                        | Action            |
|--------------|----------------------------|-------------------|
| Flashcards   | <kbd>Space</kbd>           | Reveal answer     |
| Flashcards   | <kbd>1</kbd>               | Got it wrong      |
| Flashcards   | <kbd>2</kbd>               | Knew it           |
| Flashcards   | <kbd>S</kbd>               | Skip              |
| Multi choice | <kbd>1</kbd>–<kbd>4</kbd>  | Choose answer     |
| Multi choice | <kbd>Enter</kbd>           | Next card         |
| Exercises    | <kbd>Enter</kbd>           | Run command (or advance once solved) |

## File layout

```
index.html                  Markup + control bar
style.css                   Styling (dark + light)
app.js                      State, rendering, persistence, keyboard
shell.js                    In-browser bash simulator (window.Shell)
data/bash.js                Bash flashcards (window.BASH_CARDS)
data/bash-exercises.js      Bash exercises (window.BASH_EXERCISES)
Dockerfile                  Self-contained nginx image
docker-compose.yml          Dev compose: bind-mounts the source for live edits
docker-compose.build.yml    Prod-ish compose: builds from Dockerfile
Makefile                    `make help` for run shortcuts
```

## Adding a new topic

1. Create `data/<topic>.js` and assign `window.<TOPIC>_CARDS = [...]` using the same card shape as `data/bash.js`.
2. Register it in `index.html` with another `<script src="data/<topic>.js">` line and add a topic chip in the header.
3. Add a key in `TOPICS` in `app.js`.

## Card shape

```js
{
  id:      "unique-stable-id",      // used for progress tracking
  prompt:  "What does X do?",
  answer:  "the canonical command",
  accept:  ["alt 1", "alt 2"],      // optional, for a future typing mode
  explain: "short why/how note",    // optional, shown after answering
  choices: ["distractor 1", ...],   // optional, else auto-sampled for MC
  tags:    ["topic", "subtopic"],
  level:   1                        // 1 = beginner, 3 = advanced
}
```

## Exercise shape

```js
{
  id:      "ex-mkdir",
  prompt:  "Create a new directory called `projects`.",
  hint:    "...",                  // optional
  answer:  "mkdir projects",       // shown via Show answer
  context: "...",                  // optional, rendered above the terminal
  initial: { fs, cwd?, env? },     // starting state, deep-cloned per attempt
  expect: {                        // all must pass; check after every Enter
    noError: true,
    cwd: "/home/user/projects",
    stdoutTrimEquals: "...",
    stdoutContains: ["foo", "bar"],
    exists: "/home/user/projects",
    isDir: "/path", isFile: "/path",
    missing: "/path/old.txt",
    fileContent: { path: "/file.txt", equals: "...", contains: "..." },
  },
  tags: ["files"],
}
```

Use the `dir({...})` and `file("...")` helpers in `data/bash-exercises.js` to build the initial filesystem.

## Planned

- More topics: git, python, sql.