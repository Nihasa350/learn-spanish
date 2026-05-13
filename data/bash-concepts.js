// Bash concepts — one entry per command (or operator). Used by:
//   • the Reference tab (browse/search all concepts)
//   • the inline "ⓘ" lookup that pops up from flashcards/MC/exercises
//
// Each concept:
//   summary:     one sentence
//   description: 2-4 sentences, beginner-friendly
//   flags:       [{ flag: "-x", desc: "..." }, ...]
//   examples:    [{ cmd: "...", note: "..." }, ...]
//   seeAlso:     [other concept keys]
//   category:    grouping name used by the Reference tab

window.BASH_CATEGORY_ORDER = [
  "Navigation",
  "Files",
  "Reading files",
  "Search",
  "Pipes & redirects",
  "Permissions",
  "Processes",
  "Environment",
  "Text",
  "Archives",
  "Disk",
  "Help",
];

window.BASH_CONCEPTS = {
  // --- Navigation ---
  pwd: {
    category: "Navigation",
    summary: "Print the path of the current working directory.",
    description:
      "Shows where you are in the filesystem. The output is always an absolute path starting with `/`. Useful in scripts to capture the current location, or just to remind yourself where you are.",
    flags: [],
    examples: [
      { cmd: "pwd", note: "Prints something like /home/sam/projects." },
      { cmd: "cd /tmp && pwd", note: "Change dir then confirm." },
    ],
    seeAlso: ["cd", "ls"],
  },

  cd: {
    category: "Navigation",
    summary: "Change the current working directory.",
    description:
      "Moves your shell into another directory. Without arguments it goes to your home directory. `~` expands to your home, `..` is the parent directory, `-` is the directory you came from.",
    flags: [],
    examples: [
      { cmd: "cd projects", note: "Into a subdirectory." },
      { cmd: "cd ..", note: "Up one level." },
      { cmd: "cd",   note: "Back to your home directory." },
      { cmd: "cd ~/code", note: "Use ~ for $HOME." },
      { cmd: "cd -", note: "Toggle back to the previous directory." },
    ],
    seeAlso: ["pwd", "ls", "pushd"],
  },

  ls: {
    category: "Navigation",
    summary: "List directory contents.",
    description:
      "Shows files and directories in a given path (current directory if no path is given). Hidden files (names starting with a dot) are skipped unless you ask for them.",
    flags: [
      { flag: "-a", desc: "Show all files, including hidden dotfiles." },
      { flag: "-l", desc: "Long format: permissions, owner, size, last modified." },
      { flag: "-h", desc: "Human-readable sizes (KB/MB) — combine with -l." },
      { flag: "-1", desc: "One file per line." },
      { flag: "-R", desc: "Recurse into subdirectories." },
      { flag: "-t", desc: "Sort by modification time, newest first." },
      { flag: "-S", desc: "Sort by size, largest first." },
      { flag: "-r", desc: "Reverse the sort order." },
    ],
    examples: [
      { cmd: "ls", note: "Files in the current directory." },
      { cmd: "ls -la", note: "All files in long format." },
      { cmd: "ls -lh /var/log", note: "Long format with human sizes, in /var/log." },
    ],
    seeAlso: ["pwd", "cd", "find", "tree"],
  },

  // --- Files ---
  touch: {
    category: "Files",
    summary: "Create an empty file (or update an existing file's timestamp).",
    description:
      "If the file doesn't exist, `touch` creates it as an empty file. If it does exist, `touch` updates its modification timestamp without changing the contents. Very useful for quickly making a new file before you start editing it.",
    flags: [
      { flag: "-a", desc: "Only change the access time." },
      { flag: "-m", desc: "Only change the modification time." },
    ],
    examples: [
      { cmd: "touch notes.txt", note: "Make an empty notes.txt." },
      { cmd: "touch a.txt b.txt c.txt", note: "Create several at once." },
    ],
    seeAlso: ["echo", "mkdir", "rm"],
  },

  mkdir: {
    category: "Files",
    summary: "Make a new directory.",
    description:
      "Creates one or more directories. By default it errors if the parent directory doesn't exist; use `-p` to create any missing parents along the way.",
    flags: [
      { flag: "-p", desc: "Create parent directories as needed; don't error if the dir already exists." },
      { flag: "-v", desc: "Verbose — print each created directory." },
    ],
    examples: [
      { cmd: "mkdir projects", note: "Make a single directory." },
      { cmd: "mkdir -p a/b/c", note: "Make nested directories in one go." },
    ],
    seeAlso: ["touch", "rm", "cd"],
  },

  rm: {
    category: "Files",
    summary: "Remove (delete) files and directories.",
    description:
      "Deletes files. To delete a directory, you need `-r` (recursive). Deletions are permanent — there's no trash. Be especially careful with `rm -rf`.",
    flags: [
      { flag: "-r", desc: "Recursive — required to delete directories." },
      { flag: "-f", desc: "Force — don't prompt, don't error on missing files." },
      { flag: "-i", desc: "Interactive — confirm before each deletion." },
      { flag: "-v", desc: "Verbose — print each file as it's removed." },
    ],
    examples: [
      { cmd: "rm notes.txt", note: "Delete one file." },
      { cmd: "rm -r old_project", note: "Delete a directory and its contents." },
      { cmd: "rm -rf build", note: "Force-delete a directory tree (careful!)." },
    ],
    seeAlso: ["rmdir", "mv", "trash-cli"],
  },

  cp: {
    category: "Files",
    summary: "Copy files and directories.",
    description:
      "Copies a file to a new file, or many files into a directory. Use `-r` to copy a directory and everything inside it.",
    flags: [
      { flag: "-r", desc: "Recursive — required to copy directories." },
      { flag: "-i", desc: "Interactive — ask before overwriting." },
      { flag: "-v", desc: "Verbose — print each file copied." },
      { flag: "-p", desc: "Preserve mode, ownership, and timestamps." },
    ],
    examples: [
      { cmd: "cp a.txt b.txt", note: "Copy one file to another." },
      { cmd: "cp -r src/ backup/", note: "Copy a whole directory." },
      { cmd: "cp *.md docs/", note: "Copy many files into a directory." },
    ],
    seeAlso: ["mv", "rsync", "scp"],
  },

  mv: {
    category: "Files",
    summary: "Move or rename files and directories.",
    description:
      "Renaming and moving are the same operation in Unix. `mv old new` renames; `mv file dir/` moves into a directory. Works on directories without any special flag.",
    flags: [
      { flag: "-i", desc: "Interactive — ask before overwriting." },
      { flag: "-n", desc: "Don't overwrite an existing file." },
      { flag: "-v", desc: "Verbose — print each move." },
    ],
    examples: [
      { cmd: "mv old.txt new.txt", note: "Rename." },
      { cmd: "mv file.txt archive/", note: "Move into a directory." },
    ],
    seeAlso: ["cp", "rm"],
  },

  // --- Reading files ---
  cat: {
    category: "Reading files",
    summary: "Concatenate and print files.",
    description:
      "Prints the contents of one or more files to stdout. Most often used to peek at a small file. For long files use `less`. `cat` can also concatenate files when given more than one.",
    flags: [
      { flag: "-n", desc: "Number every line." },
      { flag: "-b", desc: "Number only non-blank lines." },
      { flag: "-A", desc: "Show non-printing characters (tabs, line endings)." },
    ],
    examples: [
      { cmd: "cat file.txt", note: "Print one file." },
      { cmd: "cat a.txt b.txt > both.txt", note: "Concatenate into a new file." },
    ],
    seeAlso: ["less", "head", "tail"],
  },

  less: {
    category: "Reading files",
    summary: "View a file one page at a time.",
    description:
      "Opens a scrollable, searchable pager. Use `/` to search, `n` for next match, `q` to quit, arrow keys to scroll. Much friendlier than `cat` for files longer than your terminal.",
    flags: [
      { flag: "-N", desc: "Show line numbers." },
      { flag: "-S", desc: "Don't wrap long lines (scroll horizontally instead)." },
      { flag: "+F", desc: "Follow the file as it grows (like `tail -f`)." },
    ],
    examples: [
      { cmd: "less /var/log/syslog", note: "Page through a big log." },
      { cmd: "ls -la | less", note: "Paginate any command's output." },
    ],
    seeAlso: ["cat", "more", "tail"],
  },

  head: {
    category: "Reading files",
    summary: "Print the first N lines of a file (default 10).",
    description:
      "Shows just the top of a file or piped input. Handy for peeking at huge files or CSVs.",
    flags: [
      { flag: "-n N", desc: "Show the first N lines (default 10)." },
      { flag: "-c N", desc: "Show the first N bytes." },
    ],
    examples: [
      { cmd: "head file.txt", note: "First 10 lines." },
      { cmd: "head -n 3 file.txt", note: "First 3 lines." },
      { cmd: "ps aux | head", note: "First few processes." },
    ],
    seeAlso: ["tail", "cat", "less"],
  },

  tail: {
    category: "Reading files",
    summary: "Print the last N lines of a file (default 10).",
    description:
      "Shows the bottom of a file. With `-f`, it keeps the file open and prints new lines as they're appended — the canonical way to watch a log in real time.",
    flags: [
      { flag: "-n N", desc: "Show the last N lines (default 10)." },
      { flag: "-f",   desc: "Follow — print new lines as they're appended." },
      { flag: "-F",   desc: "Like -f, but also handles log rotation." },
    ],
    examples: [
      { cmd: "tail file.txt", note: "Last 10 lines." },
      { cmd: "tail -n 50 access.log", note: "Last 50 lines." },
      { cmd: "tail -f app.log", note: "Watch a log live (Ctrl+C to stop)." },
    ],
    seeAlso: ["head", "less"],
  },

  wc: {
    category: "Reading files",
    summary: "Word count — count lines, words, and bytes.",
    description:
      "Stands for \"word count\". With no flags, prints lines, words, and bytes for each file. Most-used flag is `-l` to count lines.",
    flags: [
      { flag: "-l", desc: "Count lines." },
      { flag: "-w", desc: "Count words." },
      { flag: "-c", desc: "Count bytes." },
      { flag: "-m", desc: "Count characters (different from bytes for non-ASCII)." },
    ],
    examples: [
      { cmd: "wc -l file.txt", note: "How many lines in file.txt." },
      { cmd: "ls | wc -l", note: "How many entries in the current dir." },
      { cmd: "wc *.md", note: "Counts for every Markdown file." },
    ],
    seeAlso: ["grep", "sort", "uniq"],
  },

  // --- Search ---
  grep: {
    category: "Search",
    summary: "Search text for matching lines.",
    description:
      "Prints lines that match a pattern. The pattern is a regular expression by default. Reads from files or from stdin, making it the workhorse for filtering pipelines.",
    flags: [
      { flag: "-i", desc: "Case-insensitive match." },
      { flag: "-n", desc: "Print line numbers." },
      { flag: "-r", desc: "Recurse into directories." },
      { flag: "-v", desc: "Invert — print lines that do NOT match." },
      { flag: "-c", desc: "Print only the count of matching lines." },
      { flag: "-E", desc: "Use extended regex (no need to backslash + ? | ())." },
      { flag: "-w", desc: "Match whole words only." },
      { flag: "-l", desc: "Print only filenames that contain a match." },
    ],
    examples: [
      { cmd: "grep TODO file.txt", note: "Lines containing TODO." },
      { cmd: "grep -in error app.log", note: "Case-insensitive with line numbers." },
      { cmd: "grep -r FIXME .", note: "Recursive search from here." },
      { cmd: "ps aux | grep nginx", note: "Find a process." },
    ],
    seeAlso: ["find", "sed", "awk"],
  },

  find: {
    category: "Search",
    summary: "Find files by name, type, size, time, etc.",
    description:
      "Walks a directory tree and prints matching paths. Vastly more powerful than `ls` for searching — and unlike `grep`, it matches on the file metadata, not the content.",
    flags: [
      { flag: "-name PATTERN", desc: "Match filename (use quotes around globs)." },
      { flag: "-iname PATTERN", desc: "Like -name but case-insensitive." },
      { flag: "-type f|d|l", desc: "Match files / directories / symlinks." },
      { flag: "-size +1M", desc: "Match by size (+ greater, - less). M=MB, k=KB." },
      { flag: "-mtime -7", desc: "Modified in the last 7 days." },
      { flag: "-delete", desc: "Delete matches (be careful!)." },
      { flag: "-exec CMD {} \\;", desc: "Run CMD on each match." },
    ],
    examples: [
      { cmd: "find . -name '*.log'", note: "All .log files under here." },
      { cmd: "find . -type d -name node_modules", note: "Find every node_modules dir." },
      { cmd: "find . -size +100M", note: "Files bigger than 100 MB." },
    ],
    seeAlso: ["grep", "locate", "ls"],
  },

  // --- Pipes & redirects ---
  "|": {
    category: "Pipes & redirects",
    summary: "Pipe stdout of one command into stdin of the next.",
    description:
      "The pipe symbol joins commands so the output of the left becomes the input of the right. It's the unix philosophy in one character: small tools, composed into pipelines.",
    flags: [],
    examples: [
      { cmd: "ls | wc -l", note: "Count entries in the current dir." },
      { cmd: "cat log.txt | grep ERROR | wc -l", note: "Count error lines." },
      { cmd: "ps aux | grep nginx | grep -v grep", note: "Find processes, hide grep itself." },
    ],
    seeAlso: [">", ">>", "tee"],
  },

  ">": {
    category: "Pipes & redirects",
    summary: "Redirect stdout into a file (overwrite).",
    description:
      "Sends a command's standard output into a file. If the file already exists, it is replaced. Be careful — there's no warning.",
    flags: [],
    examples: [
      { cmd: "echo hi > note.txt", note: "Create note.txt with 'hi'." },
      { cmd: "ls > files.txt", note: "Save directory listing to a file." },
    ],
    seeAlso: [">>", "|", "tee"],
  },

  ">>": {
    category: "Pipes & redirects",
    summary: "Redirect stdout into a file (append).",
    description:
      "Like `>` but adds to the end of the file instead of replacing. Creates the file if it doesn't exist yet.",
    flags: [],
    examples: [
      { cmd: "echo done >> log.txt", note: "Append a line to log.txt." },
      { cmd: "date >> deploys.log", note: "Append a timestamp line." },
    ],
    seeAlso: [">", "|", "tee"],
  },

  "2>": {
    category: "Pipes & redirects",
    summary: "Redirect stderr (errors) into a file.",
    description:
      "Every process has three file descriptors: 0=stdin, 1=stdout, 2=stderr. `>` only catches stdout. To redirect errors, prefix with `2`. `&>` redirects both stdout and stderr.",
    flags: [],
    examples: [
      { cmd: "command 2> errors.log", note: "Save errors only." },
      { cmd: "command > out.log 2> err.log", note: "Split stdout and stderr." },
      { cmd: "command &> all.log", note: "Both into one file." },
      { cmd: "command 2> /dev/null", note: "Discard errors." },
    ],
    seeAlso: [">", ">>", "/dev/null"],
  },

  echo: {
    category: "Pipes & redirects",
    summary: "Print arguments to stdout.",
    description:
      "Prints whatever you give it, followed by a newline. Used everywhere: messages in scripts, writing into files via `>`, and inspecting variables like `echo $HOME`.",
    flags: [
      { flag: "-n", desc: "Don't print a trailing newline." },
      { flag: "-e", desc: "Interpret escape sequences like \\n, \\t." },
    ],
    examples: [
      { cmd: "echo hello", note: "Just prints 'hello'." },
      { cmd: "echo $HOME", note: "Print an environment variable." },
      { cmd: "echo hi > file.txt", note: "Write into a file." },
    ],
    seeAlso: ["printf", ">"],
  },

  // --- Permissions ---
  chmod: {
    category: "Permissions",
    summary: "Change file permissions.",
    description:
      "Permissions have three actor groups (owner, group, others) and three modes (read/r, write/w, execute/x). You can set them symbolically (`+x`) or numerically (`755`). Each digit is the sum r=4 w=2 x=1.",
    flags: [
      { flag: "+x / -x", desc: "Add / remove execute for everyone." },
      { flag: "u+w",     desc: "Give the owner write permission." },
      { flag: "go-w",    desc: "Remove write for group and others." },
      { flag: "-R",      desc: "Recurse into directories." },
    ],
    examples: [
      { cmd: "chmod +x script.sh", note: "Make a script executable." },
      { cmd: "chmod 755 script.sh", note: "rwx for owner, rx for group+others." },
      { cmd: "chmod 644 file.txt", note: "rw for owner, r for everyone else." },
      { cmd: "chmod -R u+w src/", note: "Give the owner write on a whole tree." },
    ],
    seeAlso: ["chown", "umask"],
  },

  chown: {
    category: "Permissions",
    summary: "Change file owner (and optionally group).",
    description:
      "Sets which user (and optionally group) owns a file. Usually requires sudo. Format is `user`, `user:group`, or `:group`.",
    flags: [
      { flag: "-R", desc: "Recurse into directories." },
    ],
    examples: [
      { cmd: "sudo chown alice file.txt", note: "Give file.txt to alice." },
      { cmd: "sudo chown alice:dev project/", note: "Owner alice, group dev." },
      { cmd: "sudo chown -R www-data /var/www", note: "Recursive chown." },
    ],
    seeAlso: ["chmod", "chgrp"],
  },

  // --- Processes ---
  ps: {
    category: "Processes",
    summary: "List running processes.",
    description:
      "Snapshot of currently running processes. The classic argument string `aux` (BSD style, no dash) shows every process for every user with extra detail.",
    flags: [
      { flag: "aux",  desc: "All processes, user-readable format with CPU/mem." },
      { flag: "-ef",  desc: "Same idea but in System V format." },
      { flag: "-u USER", desc: "Only processes for USER." },
    ],
    examples: [
      { cmd: "ps aux", note: "Everything running." },
      { cmd: "ps aux | grep nginx", note: "Find a specific process." },
    ],
    seeAlso: ["top", "kill", "pgrep"],
  },

  kill: {
    category: "Processes",
    summary: "Send a signal to a process (usually to stop it).",
    description:
      "Sends a signal to one or more process IDs. Default signal is SIGTERM (15), which asks the process to clean up and exit. SIGKILL (9) is the unstoppable last resort — use sparingly.",
    flags: [
      { flag: "-15 / -TERM", desc: "Polite terminate (default)." },
      { flag: "-9 / -KILL",  desc: "Force kill — process can't trap it." },
      { flag: "-2 / -INT",   desc: "Like Ctrl+C." },
      { flag: "-1 / -HUP",   desc: "Hang-up; daemons often reload config on this." },
      { flag: "-l",          desc: "List all signal names." },
    ],
    examples: [
      { cmd: "kill 1234", note: "Polite stop of PID 1234." },
      { cmd: "kill -9 1234", note: "Force kill." },
      { cmd: "kill -HUP $(pgrep nginx)", note: "Reload nginx." },
    ],
    seeAlso: ["ps", "pgrep", "pkill"],
  },

  // --- Environment ---
  export: {
    category: "Environment",
    summary: "Set an environment variable for this shell and its children.",
    description:
      "Variables set without `export` only live in the current shell. Exporting makes them visible to any process the shell launches. Most env vars (PATH, HOME, EDITOR, …) are exported.",
    flags: [
      { flag: "-p", desc: "Print all exported variables." },
    ],
    examples: [
      { cmd: "export API_URL=https://api.example.com", note: "Set and export." },
      { cmd: "export PATH=$PATH:$HOME/bin", note: "Append to PATH." },
      { cmd: "export -p", note: "Show every exported var." },
    ],
    seeAlso: ["echo", "env", "which"],
  },

  which: {
    category: "Environment",
    summary: "Find which executable will run for a given command.",
    description:
      "Searches your $PATH and prints the first match. Handy for sanity-checking that you're calling the version of `python` or `node` you think you are. Note that `which` doesn't see shell builtins or aliases — use `type` for that.",
    flags: [
      { flag: "-a", desc: "Show all matches, not just the first." },
    ],
    examples: [
      { cmd: "which python", note: "Which python is on PATH." },
      { cmd: "which -a python", note: "All matches on PATH." },
    ],
    seeAlso: ["type", "command", "whereis"],
  },

  // --- Text manipulation ---
  sort: {
    category: "Text",
    summary: "Sort lines of text.",
    description:
      "Reads lines from stdin or a file and prints them sorted. By default, lexicographic (alphabetical). Pairs naturally with `uniq` to collapse duplicates.",
    flags: [
      { flag: "-n", desc: "Sort numerically." },
      { flag: "-r", desc: "Reverse the order." },
      { flag: "-u", desc: "Unique — drop duplicate lines." },
      { flag: "-k N", desc: "Sort by the Nth whitespace-separated column." },
      { flag: "-t C", desc: "Use C as the column separator (e.g. -t,)." },
    ],
    examples: [
      { cmd: "sort names.txt", note: "Alphabetical sort." },
      { cmd: "sort -n -k 2 file.tsv", note: "Numeric sort on column 2." },
      { cmd: "sort file.txt | uniq", note: "Sort then deduplicate." },
    ],
    seeAlso: ["uniq", "cut", "awk"],
  },

  uniq: {
    category: "Text",
    summary: "Collapse adjacent duplicate lines.",
    description:
      "Removes consecutive duplicate lines from input. Because it only looks at adjacent lines, the input usually needs to be sorted first.",
    flags: [
      { flag: "-c", desc: "Prefix each line with its count." },
      { flag: "-d", desc: "Only print duplicates." },
      { flag: "-u", desc: "Only print lines that appear once." },
    ],
    examples: [
      { cmd: "sort log.txt | uniq", note: "Deduplicate." },
      { cmd: "sort log.txt | uniq -c | sort -nr", note: "Count occurrences, most frequent first." },
    ],
    seeAlso: ["sort", "wc"],
  },

  cut: {
    category: "Text",
    summary: "Pull out specific columns from each line.",
    description:
      "Slices each line by character position, byte position, or by delimiter-separated fields. Most common: `-d`/`-f` to pick fields from CSV/TSV.",
    flags: [
      { flag: "-d C",   desc: "Use C as the field separator (e.g. -d,)." },
      { flag: "-f N",   desc: "Pick field N (1-indexed). Use ranges like -f 1,3 or -f 2-4." },
      { flag: "-c N-M", desc: "Pick characters N..M." },
    ],
    examples: [
      { cmd: "cut -d, -f1 file.csv", note: "First column of a CSV." },
      { cmd: "cut -d: -f1 /etc/passwd", note: "All usernames on the system." },
      { cmd: "echo 'hello world' | cut -c1-5", note: "First 5 characters." },
    ],
    seeAlso: ["awk", "sort", "tr"],
  },

  // --- Archives ---
  tar: {
    category: "Archives",
    summary: "Bundle files into a single archive (and unpack them).",
    description:
      "Originally \"tape archive\". The same command both creates and extracts archives — the flags decide which. The flag pattern to memorize is `czf` (create gz) and `xzf` (extract gz).",
    flags: [
      { flag: "-c", desc: "Create an archive." },
      { flag: "-x", desc: "Extract an archive." },
      { flag: "-t", desc: "List archive contents without extracting." },
      { flag: "-z", desc: "Use gzip compression (.tar.gz)." },
      { flag: "-j", desc: "Use bzip2 compression (.tar.bz2)." },
      { flag: "-f F", desc: "Use F as the archive filename." },
      { flag: "-v", desc: "Verbose — list each file." },
      { flag: "-C DIR", desc: "Change to DIR before doing anything." },
    ],
    examples: [
      { cmd: "tar -czf backup.tar.gz src/", note: "Create a gzipped archive." },
      { cmd: "tar -xzf backup.tar.gz", note: "Extract a gzipped archive." },
      { cmd: "tar -tzf backup.tar.gz", note: "List contents." },
      { cmd: "tar -xzf backup.tar.gz -C /tmp", note: "Extract into /tmp." },
    ],
    seeAlso: ["gzip", "zip", "unzip"],
  },

  // --- Disk ---
  df: {
    category: "Disk",
    summary: "Show free space on mounted filesystems.",
    description:
      "Prints one line per mount: size, used, available, percentage, mount point. Almost always run with `-h` for human-readable sizes.",
    flags: [
      { flag: "-h", desc: "Human-readable sizes (KB/MB/GB)." },
      { flag: "-i", desc: "Show inodes instead of bytes." },
      { flag: "-T", desc: "Also show filesystem type." },
    ],
    examples: [
      { cmd: "df -h", note: "Free space, human-readable." },
      { cmd: "df -h /", note: "Just the root filesystem." },
    ],
    seeAlso: ["du", "mount"],
  },

  du: {
    category: "Disk",
    summary: "Show how much disk space a file or directory uses.",
    description:
      "Adds up the sizes of files in a directory tree. Where `df` looks at whole filesystems, `du` looks at individual paths. Pair with `sort -h` to find your biggest directories.",
    flags: [
      { flag: "-h", desc: "Human-readable sizes." },
      { flag: "-s", desc: "Summary only (one line per argument)." },
      { flag: "-c", desc: "Add a grand total at the end." },
      { flag: "--max-depth=N", desc: "Limit how deep to descend." },
    ],
    examples: [
      { cmd: "du -sh .", note: "Total size of the current directory." },
      { cmd: "du -h --max-depth=1", note: "Sizes of immediate subdirectories." },
      { cmd: "du -sh * | sort -h", note: "Sort children by size." },
    ],
    seeAlso: ["df", "ls"],
  },

  // --- Help ---
  man: {
    category: "Help",
    summary: "Open the manual page for a command.",
    description:
      "Shows the official manual: synopsis, every flag, examples, related commands. Pages open in `less`, so `/` to search, `n` for next, `q` to quit. If `man` isn't enough, try `--help` or `tldr`.",
    flags: [
      { flag: "-k WORD", desc: "Search manual page descriptions for WORD." },
      { flag: "N CMD",   desc: "Open manual section N for CMD (e.g. `man 5 passwd`)." },
    ],
    examples: [
      { cmd: "man grep", note: "Manual for grep." },
      { cmd: "man -k 'list directory'", note: "Find man pages about listing dirs." },
    ],
    seeAlso: ["tldr", "help", "info"],
  },

  history: {
    category: "Help",
    summary: "Show or recall previous commands.",
    description:
      "Prints the list of commands you've typed in this shell. You can re-run earlier commands by their number (`!42`) or the last one with `!!`. `Ctrl+R` is even faster for incremental reverse-search.",
    flags: [
      { flag: "-c", desc: "Clear the in-memory history." },
      { flag: "N",  desc: "Show only the last N entries." },
    ],
    examples: [
      { cmd: "history", note: "All history with numbers." },
      { cmd: "history 20", note: "Last 20 commands." },
      { cmd: "!!", note: "Re-run the last command." },
      { cmd: "!42", note: "Re-run history entry 42." },
    ],
    seeAlso: ["fc"],
  },
};