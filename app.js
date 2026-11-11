// learn-spanish: tiny flashcard + multiple-choice engine, no build step.
//
// Decks are loaded from window.<DECK>_CARDS globals (see data/vocab.js and
// data/verbs.js). Per-card progress (right/wrong counts + last-seen) is
// persisted to localStorage under `ls:progress:<topic>` so weak cards
// resurface more.

const TOPICS = {
  vocab: () => window.VOCAB_CARDS || [],
  verbs: () => window.VERB_CARDS || [],
  numbers: () => window.NUMBER_CARDS || [],
  conversations: () => window.CONVERSATION_CARDS || [],
};

const state = {
  topic: "vocab",
  mode: "flash",        // "flash" | "mc" | "type" | "ref" | "search"
  dir: "en-es",         // "en-es" | "es-en" (flashcards + MC; typing is always en-es)
  tag: "",              // active tag filter, "" = all
  weakOnly: false,
  pool: [],             // filtered cards
  current: null,
  flipped: false,
  mc: { choices: [], answered: false, correctIndex: -1 },
  type: { answered: false },
  session: { seen: 0, correct: 0, wrong: 0 },
  progress: {},         // { [cardId]: { right, wrong, last } }
};

// ---------- Grammar concepts (Reference + inline ⓘ lookup) ----------
function getConcept(name) {
  const concepts = window.GRAMMAR_CONCEPTS || {};
  return concepts[name] || null;
}

// Concept keys a card links to, filtered to ones that exist.
function cardConcepts(card) {
  return ((card && card.concepts) || []).filter(k => getConcept(k));
}

// Display name: dialogue pages have a title; grammar notes use their key.
function conceptLabel(name) {
  const c = getConcept(name);
  return (c && c.title) || name;
}

function conceptChipHTML(name) {
  return `<button class="cmd-chip" type="button" data-concept="${escapeHtml(name)}">${escapeHtml(conceptLabel(name))}</button>`;
}

function dialogueHTML(lines) {
  return `<div class="dialogue">${
    lines.map(l => `
      <div class="dlg-line${l.you ? " you" : ""}">
        <div class="dlg-who">${escapeHtml(l.who)}</div>
        <div class="dlg-es" lang="es">${escapeHtml(l.es)}</div>
        <div class="dlg-en">${escapeHtml(l.en)}</div>
      </div>`).join("")
  }</div>`;
}

function explainRowHTML(concepts, label = "Look up") {
  if (!concepts || concepts.length === 0) return "";
  const chips = concepts.map(conceptChipHTML).join("");
  return `<div class="explain-row"><span>${escapeHtml(label)}:</span>${chips}</div>`;
}

function conceptDetailHTML(name) {
  const c = getConcept(name);
  if (!c) return `<div class="ref-detail-empty">No notes for <code>${escapeHtml(name)}</code>.</div>`;
  const table = (c.table && c.table.length)
    ? `<div class="ref-section"><h3>${escapeHtml(c.tableTitle || "Overview")}</h3><div class="ref-flags">${
        c.table.map(r =>
          `<div class="ref-flag"><code>${escapeHtml(r.label)}</code><span class="desc" lang="es">${escapeHtml(r.value)}</span></div>`
        ).join("")
      }</div></div>`
    : "";
  const examples = (c.examples && c.examples.length)
    ? `<div class="ref-section"><h3>Examples</h3><div class="ref-examples">${
        c.examples.map(e =>
          `<div class="ref-example"><span class="cmd" lang="es">${escapeHtml(e.es)}</span>${
            e.en ? `<span class="note">— ${escapeHtml(e.en)}</span>` : ""
          }</div>`
        ).join("")
      }</div></div>`
    : "";
  const dialogue = (c.dialogue && c.dialogue.length)
    ? `<div class="ref-section"><h3>Conversation</h3>${dialogueHTML(c.dialogue)}</div>`
    : "";
  const seeAlso = (c.seeAlso && c.seeAlso.length)
    ? `<div class="ref-section"><h3>See also</h3><div class="ref-also">${
        c.seeAlso.map(conceptChipHTML).join("")
      }</div></div>`
    : "";
  return `
    <div>
      <span class="ref-cmd">${escapeHtml(conceptLabel(name))}</span>
      <div class="ref-summary">${escapeHtml(c.summary || "")}</div>
    </div>
    ${c.description ? `<div class="ref-section"><h3>Notes</h3><div class="ref-desc">${escapeHtml(c.description)}</div></div>` : ""}
    ${table}
    ${dialogue}
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
  const concepts = window.GRAMMAR_CONCEPTS || {};
  const order = window.GRAMMAR_CATEGORY_ORDER || [];
  const list = document.getElementById("ref-list");
  const search = (document.getElementById("ref-search").value || "").trim().toLowerCase();

  // Group by category
  const byCat = {};
  for (const [name, c] of Object.entries(concepts)) {
    if (search) {
      const lines = (c.dialogue || []).map(l => l.es + " " + l.en).join(" ");
      const hay = [name, c.title, c.summary, c.description, lines].join(" ").toLowerCase();
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
      btn.innerHTML = `<span>${escapeHtml(conceptLabel(name))}</span><span class="ri-summary">${escapeHtml(concepts[name].summary || "")}</span>`;
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
function progressKey(topic) { return `ls:progress:${topic}`; }

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
// Spanish → English is tracked separately: recognising a word and producing it
// are different skills. Typing always produces Spanish, so it uses the base id.
function reversed() { return state.dir === "es-en" && state.mode !== "type"; }
function progressId(card) { return reversed() ? `${card.id}@es-en` : card.id; }

function recordResult(card, ok) {
  const id = progressId(card);
  const p = state.progress[id] || { right: 0, wrong: 0, last: 0 };
  if (ok) p.right += 1; else p.wrong += 1;
  p.last = Date.now();
  state.progress[id] = p;
  saveProgress();
}

function countResult(card, ok) {
  state.session.seen += 1;
  if (ok) state.session.correct += 1; else state.session.wrong += 1;
  recordResult(card, ok);
  updateStats();
}

// The prompt/answer pair for the current direction.
function cardView(card) {
  if (!reversed()) return { prompt: card.prompt, answer: card.answer, promptLang: "en", answerLang: "es" };
  return {
    prompt: (card.lookup && card.lookup.es) || card.answer,
    answer: (card.lookup && card.lookup.en) || card.prompt,
    promptLang: "es", answerLang: "en",
  };
}

// ---------- Pool / weighting ----------
function applyFilters(items) {
  let pool = items.filter(it => !state.tag || (it.tags || []).includes(state.tag));
  if (state.weakOnly) {
    const weak = pool.filter(it => {
      const p = state.progress[progressId(it)];
      return !p || p.wrong > p.right;
    });
    if (weak.length) return weak;
  }
  return pool;
}

function rebuildPool() {
  state.pool = applyFilters(TOPICS[state.topic]());
  updatePoolStat();
}

function updatePoolStat() {
  const stat = document.getElementById("stat-pool");
  if (state.mode === "ref") stat.textContent = `${Object.keys(window.GRAMMAR_CONCEPTS || {}).length} reference pages`;
  else if (state.mode === "search") stat.textContent = `${getSearchIndex().length} searchable phrases`;
  else stat.textContent = `${state.pool.length} cards in pool`;
}

// Weighted random pick: items you got wrong more often appear more.
// Weight = 1 + 2*wrong - right (floored at 0.25).
function pickFrom(pool) {
  if (pool.length === 0) return null;
  const weights = pool.map(c => {
    const p = state.progress[progressId(c)] || { right: 0, wrong: 0 };
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

function pickNextCard(prevId) { return pickNext(state.pool, prevId); }

// ---------- Flashcard view ----------
function renderFlash() {
  if (!state.current) state.current = pickNextCard(null);
  if (!state.current) {
    document.getElementById("flash-prompt").textContent = "No cards match. Adjust the filter.";
    return;
  }
  state.flipped = false;
  const v = cardView(state.current);
  const promptEl = document.getElementById("flash-prompt");
  const answerEl = document.getElementById("flash-answer");
  promptEl.textContent = v.prompt;
  promptEl.lang = v.promptLang;
  answerEl.textContent = v.answer;
  answerEl.lang = v.answerLang;
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

  // Surface grammar lookup chips for the card
  const back = document.querySelector("#flash-card .card-back");
  back.querySelectorAll(":scope > .explain-row").forEach(el => el.remove());
  const row = explainRowHTML(cardConcepts(state.current));
  if (row) back.querySelector(".card-hint").insertAdjacentHTML("beforebegin", row);
}

function rateFlash(rate) {
  if (!state.flipped || !state.current) return;
  countResult(state.current, rate === "ok");
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
// Prefer distractors that share the most tags with the card, so a food word
// gets other food words and "ser — yo" gets other forms of ser.
function sampleDistractors(card, n) {
  const tags = new Set(card.tags || []);
  const byAnswer = new Map();
  for (const c of TOPICS[state.topic]()) {
    const answer = cardView(c).answer;
    if (c.id === card.id || !answer || answer === cardView(card).answer) continue;
    const score = (c.tags || []).filter(t => tags.has(t)).length + Math.random() * 0.9;
    const prev = byAnswer.get(answer);
    if (prev === undefined || score > prev) byAnswer.set(answer, score);
  }
  return [...byAnswer.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([answer]) => answer);
}

function buildChoices(card) {
  // If the card author supplied choices, use them; else sample distractors.
  // Author-supplied choices are Spanish, so they only apply English → Spanish.
  const answer = cardView(card).answer;
  let choices;
  if (!reversed() && card.choices && card.choices.length) {
    choices = [...new Set([answer, ...card.choices])].slice(0, 4);
  } else {
    choices = [answer, ...sampleDistractors(card, 3)];
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
  const v = cardView(card);
  state.mc.correctIndex = choices.indexOf(v.answer);

  document.getElementById("mc-label").textContent = reversed() ? "Pick the English" : "Pick the Spanish";
  const promptEl = document.getElementById("mc-prompt");
  promptEl.textContent = v.prompt;
  promptEl.lang = v.promptLang;
  const wrap = document.getElementById("mc-choices");
  wrap.innerHTML = "";
  choices.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "mc-choice";
    btn.dataset.index = String(i);
    btn.innerHTML = `<span class="idx">${i + 1}</span><span lang="${v.answerLang}">${escapeHtml(text)}</span>`;
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
  countResult(state.current, ok);

  const buttons = [...document.querySelectorAll(".mc-choice")];
  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === state.mc.correctIndex) btn.classList.add("correct");
    if (idx === i && !ok) btn.classList.add("wrong");
  });

  const fb = document.getElementById("mc-feedback");
  const explain = state.current.explain ? `<div>${escapeHtml(state.current.explain)}</div>` : "";
  const lookup = explainRowHTML(cardConcepts(state.current));
  fb.innerHTML = `
    <div class="label">${ok ? "Correct" : "Not quite"}</div>
    <div class="answer" lang="${cardView(state.current).answerLang}">${escapeHtml(cardView(state.current).answer)}</div>
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

// ---------- Typing view ----------
// Compare typed Spanish to the answer (and `accept` alternatives), forgiving
// case, punctuation and spacing. Missing accents count as correct but are
// pointed out; a missing article or a one-letter slip is flagged as "close".
const PUNCT = /[¿?¡!.,;:«»"“”'‘’…()]/g;
const ARTICLE = /^(el|la|los|las|un|una|unos|unas)\s+/;

function canon(s) {
  return String(s || "").normalize("NFC").toLowerCase().replace(PUNCT, " ").replace(/\s+/g, " ").trim();
}
// Strip accent marks but keep ñ: año and ano are different words.
function stripAccents(s) {
  return s.normalize("NFC").replace(/ñ/g, "\u0000")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\u0000/g, "ñ");
}
function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

// → { ok, kind: "exact" | "accents" | "article" | "close" | "wrong", target }
function checkTyped(input, card) {
  const typed = canon(input);
  const targets = [card.answer, ...(card.accept || [])];
  if (!typed) return { ok: false, kind: "wrong", target: card.answer };
  for (const t of targets) if (canon(t) === typed) return { ok: true, kind: "exact", target: t };
  for (const t of targets) {
    if (stripAccents(canon(t)) === stripAccents(typed)) return { ok: true, kind: "accents", target: t };
  }
  for (const t of targets) {
    const bare = canon(t).replace(ARTICLE, "");
    if (bare !== canon(t) && stripAccents(bare) === stripAccents(typed)) return { ok: false, kind: "article", target: t };
  }
  for (const t of targets) {
    const a = stripAccents(canon(t)), b = stripAccents(typed);
    const allowed = a.length >= 12 ? 2 : a.length >= 5 ? 1 : 0;
    if (allowed && editDistance(a, b) <= allowed) return { ok: false, kind: "close", target: t };
  }
  return { ok: false, kind: "wrong", target: card.answer };
}

function renderType() {
  if (!state.current) state.current = pickNextCard(null);
  const input = document.getElementById("type-input");
  const fb = document.getElementById("type-feedback");
  state.type.answered = false;
  fb.hidden = true;
  input.value = "";
  input.readOnly = false;
  input.classList.remove("ok", "bad");
  document.getElementById("type-check").hidden = false;
  document.getElementById("type-reveal").hidden = false;
  document.getElementById("type-next").hidden = true;
  if (!state.current) {
    document.getElementById("type-prompt").textContent = "No cards match. Adjust the filter.";
    return;
  }
  document.getElementById("type-prompt").textContent = state.current.prompt;
  input.focus();
}

function finishType(result, revealed) {
  const card = state.current;
  const input = document.getElementById("type-input");
  state.type.answered = true;
  countResult(card, result.ok);
  input.readOnly = true;
  input.classList.toggle("ok", result.ok);
  input.classList.toggle("bad", !result.ok);

  const messages = {
    exact:   "¡Correcto!",
    accents: "Correct, but watch the accents:",
    article: "Almost. Include the article, because it tells you the gender:",
    close:   "Close! Check the spelling:",
    wrong:   revealed ? "The answer is:" : "Not quite. The answer is:",
  };
  const fb = document.getElementById("type-feedback");
  const showAnswer = result.kind !== "exact";
  fb.className = `type-feedback ${result.ok ? "ok" : "bad"}`;
  fb.innerHTML = `
    <div class="label">${escapeHtml(messages[result.kind])}</div>
    ${showAnswer ? `<div class="answer" lang="es">${escapeHtml(result.target)}</div>` : ""}
    ${card.explain ? `<div class="type-explain">${escapeHtml(card.explain)}</div>` : ""}
    ${explainRowHTML(cardConcepts(card))}
  `;
  fb.hidden = false;
  document.getElementById("type-check").hidden = true;
  document.getElementById("type-reveal").hidden = true;
  document.getElementById("type-next").hidden = false;
  input.focus();
}

function checkType() {
  if (state.type.answered || !state.current) return;
  const input = document.getElementById("type-input");
  if (!canon(input.value)) { input.focus(); return; }
  finishType(checkTyped(input.value, state.current), false);
}

function revealType() {
  if (state.type.answered || !state.current) return;
  finishType({ ok: false, kind: "wrong", target: state.current.answer }, true);
}

function nextType() {
  const prevId = state.current ? state.current.id : null;
  state.current = pickNextCard(prevId);
  renderType();
}

// Insert a character at the cursor (accent buttons + Alt shortcuts).
function insertChar(ch) {
  const input = document.getElementById("type-input");
  if (input.readOnly) return;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  input.value = input.value.slice(0, start) + ch + input.value.slice(end);
  input.selectionStart = input.selectionEnd = start + ch.length;
  input.focus();
}
const ALT_CHARS = { a: "á", e: "é", i: "í", o: "ó", u: "ú", n: "ñ", "?": "¿", "/": "¿", "!": "¡", "1": "¡" };

// ---------- Search view ----------
// One flat index of { es, en, note, source, concept } built from every deck,
// every conversation line and every grammar example. Built lazily, once.
const TOPIC_LABELS = { vocab: "Vocabulario", verbs: "Verbos", numbers: "Números", conversations: "Conversaciones" };
let searchIndex = null;

// Lowercase, strip accents and punctuation so "cuanto es" matches "¿Cuánto es?".
function normalize(s) {
  return String(s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSearchIndex() {
  if (searchIndex) return searchIndex;
  const entries = [];
  const seen = new Set();
  const add = (e) => {
    const key = normalize(e.es) + "|" + normalize(e.en);
    if (!e.es || seen.has(key)) return;
    seen.add(key);
    e.hay = normalize(`${e.es} ${(e.accept || []).join(" ")} ${e.en}`);
    entries.push(e);
  };

  // Vocabulary + verbs. Conversation cards are skipped: their lines are indexed below.
  for (const topic of ["vocab", "verbs", "numbers"]) {
    for (const c of TOPICS[topic]()) {
      add({
        es: (c.lookup && c.lookup.es) || c.answer,
        en: (c.lookup && c.lookup.en) || c.prompt,
        accept: c.accept,
        note: c.lookup ? "" : (c.explain || ""),
        source: TOPIC_LABELS[topic],
        concept: cardConcepts(c)[0] || null,
      });
    }
  }
  // Every line of every conversation, including the other speakers' lines.
  for (const d of window.DIALOGUES || []) {
    for (const l of d.lines) {
      add({ es: l.es, en: l.en, accept: l.accept, note: l.note || "", source: d.title, concept: `dlg-${d.id}` });
    }
  }
  // Grammar examples.
  for (const [key, c] of Object.entries(window.GRAMMAR_CONCEPTS || {})) {
    for (const ex of c.examples || []) {
      add({ es: ex.es, en: ex.en, note: "", source: conceptLabel(key), concept: key });
    }
  }
  searchIndex = entries;
  return entries;
}

// All query words must appear. Whole-phrase matches and shorter entries rank first.
function searchPhrases(query, limit = 60) {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(" ");
  const scored = [];
  for (const e of getSearchIndex()) {
    if (!words.every(w => e.hay.includes(w))) continue;
    let score = e.hay.length;
    if (normalize(e.es) === q || normalize(e.en) === q) score -= 1000;
    else if ((" " + e.hay + " ").includes(" " + q + " ")) score -= 500;
    scored.push([score, e]);
  }
  return scored.sort((a, b) => a[0] - b[0]).slice(0, limit).map(([, e]) => e);
}

function renderSearch() {
  const input = document.getElementById("search-input");
  const out = document.getElementById("search-results");
  const q = input.value;
  if (!normalize(q)) {
    out.innerHTML = `<div class="ref-detail-empty">Type a word or phrase in English or Spanish. Accents are optional.</div>`;
    return;
  }
  const results = searchPhrases(q);
  if (!results.length) {
    out.innerHTML = `<div class="ref-detail-empty">Nothing found for “${escapeHtml(q)}”.</div>`;
    return;
  }
  out.innerHTML = results.map(e => `
    <div class="search-row">
      <div class="search-text">
        <div class="dlg-es" lang="es">${escapeHtml(e.es)}</div>
        <div class="dlg-en">${escapeHtml(e.en)}</div>
        ${e.note ? `<div class="search-note">${escapeHtml(e.note)}</div>` : ""}
      </div>
      <div class="search-source">${
        e.concept
          ? `<button class="cmd-chip" type="button" data-concept="${escapeHtml(e.concept)}">${escapeHtml(e.source)}</button>`
          : `<span class="search-badge">${escapeHtml(e.source)}</span>`
      }</div>
    </div>`).join("");
}

// ---------- View / mode switching ----------
function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll(".seg-btn").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  document.getElementById("flash-view").classList.toggle("active", mode === "flash");
  document.getElementById("mc-view").classList.toggle("active", mode === "mc");
  document.getElementById("type-view").classList.toggle("active", mode === "type");
  document.getElementById("ref-view").classList.toggle("active", mode === "ref");
  document.getElementById("search-view").classList.toggle("active", mode === "search");
  state.current = null;

  updatePoolStat();

  if (mode === "flash") renderFlash();
  else if (mode === "mc") renderMC();
  else if (mode === "type") renderType();
  else if (mode === "ref") renderRef();
  else if (mode === "search") {
    renderSearch();
    const input = document.getElementById("search-input");
    input.focus();
    input.select();
  }
}

function setTopic(topic) {
  if (!TOPICS[topic] || topic === state.topic) return;
  state.topic = topic;
  state.tag = "";
  document.querySelectorAll(".topic").forEach(b => b.classList.toggle("active", b.dataset.topic === topic));
  loadProgress();
  populateTagFilter();
  rebuildPool();
  if (state.mode === "ref") setMode("flash");
  else setMode(state.mode);
}

// ---------- Filters / stats ----------
function populateTagFilter() {
  const sel = document.getElementById("tag-filter");
  const tags = new Set();
  TOPICS[state.topic]().forEach(c => (c.tags || []).forEach(t => tags.add(t)));
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

  document.querySelectorAll(".topic").forEach(btn => {
    btn.addEventListener("click", () => setTopic(btn.dataset.topic));
  });

  function refreshAfterFilterChange() {
    rebuildPool();
    state.current = null;
    if (state.mode === "flash") renderFlash();
    else if (state.mode === "mc") renderMC();
    else if (state.mode === "type") renderType();
  }

  const dirSel = document.getElementById("direction");
  dirSel.value = state.dir;
  dirSel.addEventListener("change", e => {
    state.dir = e.target.value;
    try { localStorage.setItem("ls:dir", state.dir); } catch {}
    refreshAfterFilterChange();
  });

  document.getElementById("type-check").addEventListener("click", checkType);
  document.getElementById("type-reveal").addEventListener("click", revealType);
  document.getElementById("type-next").addEventListener("click", nextType);
  const typeInput = document.getElementById("type-input");
  typeInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (state.type.answered) nextType(); else checkType();
      return;
    }
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      const ch = ALT_CHARS[e.key.toLowerCase()];
      if (ch) { e.preventDefault(); insertChar(e.shiftKey && ch.length === 1 && /[a-zñ]/i.test(e.key) ? ch.toUpperCase() : ch); }
    }
  });
  // mousedown + preventDefault keeps focus (and the cursor position) in the input.
  document.getElementById("accent-row").addEventListener("mousedown", e => {
    const btn = e.target.closest("[data-char]");
    if (!btn) return;
    e.preventDefault();
    insertChar(btn.dataset.char);
  });

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

  document.getElementById("search-input").addEventListener("input", renderSearch);

  // Reference search re-renders the list on every keystroke
  document.getElementById("ref-search").addEventListener("input", () => {
    if (state.mode === "ref") renderRef();
  });

  // Modal: close button + backdrop click
  document.getElementById("modal").addEventListener("click", e => {
    if (e.target.matches("[data-close]")) closeModal();
  });

  // Delegate clicks on any ⓘ chip anywhere on the page → open the grammar modal
  document.addEventListener("click", e => {
    const chip = e.target.closest(".cmd-chip");
    if (chip && chip.dataset.concept) {
      e.preventDefault();
      openConceptModal(chip.dataset.concept);
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

  // Don't hijack typing in inputs/selects.
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "select" || tag === "textarea") return;

  // "/" jumps to Search from anywhere.
  if (e.key === "/") {
    e.preventDefault();
    setMode("search");
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
  try { state.dir = localStorage.getItem("ls:dir") === "es-en" ? "es-en" : "en-es"; } catch {}
  loadProgress();
  populateTagFilter();
  rebuildPool();
  wire();
  setMode("flash");
  updateStats();
}

document.addEventListener("DOMContentLoaded", boot);