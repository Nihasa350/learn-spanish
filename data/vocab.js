// Vocabulary deck — Spain Spanish (castellano).
//
// Card shape (see README):
//   prompt:   English
//   answer:   Spanish (nouns include their article so you learn the gender)
//   accept:   other correct answers (used by the typing mode)
//   explain:  optional note shown after answering
//   concepts: optional grammar reference keys (data/grammar.js) shown as ⓘ chips
//   tags:     used by the tag filter and to pick sensible multiple-choice distractors
//   level:    1 = beginner, 3 = advanced

// Small helper so each entry stays on one line.
// v(id, english, spanish, tags, extra?)
function v(id, prompt, answer, tags, extra = {}) {
  return { id: `v-${id}`, prompt, answer, tags, level: 1, ...extra };
}

window.VOCAB_CARDS = [
  // --- Greetings & phrases ---
  v("hola",          "hello",                         "hola",              ["phrases"]),
  v("adios",         "goodbye",                       "adiós",             ["phrases"]),
  v("buenos-dias",   "good morning",                  "buenos días",       ["phrases"]),
  v("buenas-tardes", "good afternoon",                "buenas tardes",     ["phrases"], { explain: "Used from lunchtime (around 2pm in Spain) until dark." }),
  v("buenas-noches", "good evening / good night",     "buenas noches",     ["phrases"]),
  v("hasta-luego",   "see you later",                 "hasta luego",       ["phrases"], { explain: "In Spain this is also a common casual 'bye', even if you won't see the person again." }),
  v("por-favor",     "please",                        "por favor",         ["phrases"]),
  v("gracias",       "thank you",                     "gracias",           ["phrases"]),
  v("de-nada",       "you're welcome",                "de nada",           ["phrases"]),
  v("perdon",        "sorry / excuse me",             "perdón",            ["phrases"], { accept: ["perdona", "disculpa"] }),
  v("que-tal",       "how's it going?",               "¿qué tal?",         ["phrases"], { accept: ["qué tal"] }),
  v("como-estas",    "how are you? (informal)",       "¿cómo estás?",      ["phrases"], { accept: ["cómo estás"], concepts: ["estar"] }),
  v("me-llamo",      "my name is…",                   "me llamo…",         ["phrases"], { accept: ["me llamo"] }),
  v("encantado",     "nice to meet you",              "encantado",         ["phrases"], { accept: ["encantada", "mucho gusto"], explain: "Say 'encantada' if you're female." }),
  v("no-entiendo",   "I don't understand",            "no entiendo",       ["phrases"]),
  v("hablas-ingles", "do you speak English?",         "¿hablas inglés?",   ["phrases"], { accept: ["hablas inglés"] }),
  v("vale",          "OK",                            "vale",              ["phrases"], { explain: "Extremely common in Spain. Elsewhere you'd hear 'está bien' or 'ok'." }),
  v("si",            "yes",                           "sí",                ["phrases"], { explain: "With an accent. 'si' without one means 'if'." }),
  v("no",            "no",                            "no",                ["phrases"]),

  // --- Question words ---
  v("que",     "what?",          "¿qué?",     ["questions"], { accept: ["qué"] }),
  v("quien",   "who?",           "¿quién?",   ["questions"], { accept: ["quién"] }),
  v("donde",   "where?",         "¿dónde?",   ["questions"], { accept: ["dónde"] }),
  v("cuando",  "when?",          "¿cuándo?",  ["questions"], { accept: ["cuándo"] }),
  v("por-que", "why?",           "¿por qué?", ["questions"], { accept: ["por qué"], explain: "Two words with an accent = 'why?'. One word, no accent (porque) = 'because'." }),
  v("como",    "how?",           "¿cómo?",    ["questions"], { accept: ["cómo"] }),
  v("cuanto",  "how much?",      "¿cuánto?",  ["questions"], { accept: ["cuánto"] }),

  // --- People & family ---
  v("hombre",  "the man",         "el hombre",  ["people", "nouns"], { concepts: ["gender"] }),
  v("mujer",   "the woman",       "la mujer",   ["people", "nouns"], { concepts: ["gender"] }),
  v("chico",   "the boy",         "el chico",   ["people", "nouns"], { accept: ["el niño"] }),
  v("chica",   "the girl",        "la chica",   ["people", "nouns"], { accept: ["la niña"] }),
  v("amigo",   "the friend (male)", "el amigo", ["people", "nouns"]),
  v("amiga",   "the friend (female)", "la amiga", ["people", "nouns"]),
  v("madre",   "the mother",      "la madre",   ["family", "nouns"]),
  v("padre",   "the father",      "el padre",   ["family", "nouns"]),
  v("hermano", "the brother",     "el hermano", ["family", "nouns"]),
  v("hermana", "the sister",      "la hermana", ["family", "nouns"]),
  v("hijo",    "the son",         "el hijo",    ["family", "nouns"]),
  v("hija",    "the daughter",    "la hija",    ["family", "nouns"]),
  v("padres",  "the parents",     "los padres", ["family", "nouns"], { explain: "The masculine plural covers mixed groups: padres = parents, hermanos = siblings.", concepts: ["articles"] }),

  // --- Food & drink ---
  v("agua",     "the water",    "el agua",      ["food", "nouns"], { explain: "Feminine, but takes 'el' because it starts with a stressed 'a' sound: el agua fría.", concepts: ["gender"] }),
  v("cafe",     "the coffee",   "el café",      ["food", "nouns"]),
  v("leche",    "the milk",     "la leche",     ["food", "nouns"]),
  v("zumo",     "the juice",    "el zumo",      ["food", "nouns"], { explain: "Spain says 'zumo'. Latin America says 'jugo'." }),
  v("cerveza",  "the beer",     "la cerveza",   ["food", "nouns"]),
  v("vino",     "the wine",     "el vino",      ["food", "nouns"]),
  v("pan",      "the bread",    "el pan",       ["food", "nouns"]),
  v("queso",    "the cheese",   "el queso",     ["food", "nouns"]),
  v("huevo",    "the egg",      "el huevo",     ["food", "nouns"]),
  v("manzana",  "the apple",    "la manzana",   ["food", "nouns"]),
  v("patata",   "the potato",   "la patata",    ["food", "nouns"], { explain: "Spain says 'patata'. Latin America says 'papa'." }),
  v("pollo",    "the chicken",  "el pollo",     ["food", "nouns"]),
  v("pescado",  "the fish (as food)", "el pescado", ["food", "nouns"], { explain: "'El pescado' is fish you eat. A live fish is 'el pez'." }),
  v("desayuno", "the breakfast", "el desayuno", ["food", "nouns"]),
  v("comida",   "the lunch / the food", "la comida", ["food", "nouns"], { explain: "In Spain 'la comida' is the main midday meal, usually around 2–3pm." }),
  v("cena",     "the dinner",   "la cena",      ["food", "nouns"]),
  v("cuenta",   "the bill (at a restaurant)", "la cuenta", ["food", "nouns"], { explain: "La cuenta, por favor. = The bill, please." }),

  // --- Places & around town ---
  v("casa",        "the house / home", "la casa",         ["places", "nouns"]),
  v("calle",       "the street",       "la calle",        ["places", "nouns"]),
  v("ciudad",      "the city",         "la ciudad",       ["places", "nouns"], { explain: "Words ending in -dad are feminine.", concepts: ["gender"] }),
  v("pueblo",      "the town / village", "el pueblo",     ["places", "nouns"]),
  v("tienda",      "the shop",         "la tienda",       ["places", "nouns"]),
  v("mercado",     "the market",       "el mercado",      ["places", "nouns"]),
  v("restaurante", "the restaurant",   "el restaurante",  ["places", "nouns"]),
  v("bar",         "the bar / café",   "el bar",          ["places", "nouns"]),
  v("playa",       "the beach",        "la playa",        ["places", "nouns"]),
  v("estacion",    "the station",      "la estación",     ["places", "nouns"], { explain: "Words ending in -ción are feminine.", concepts: ["gender"] }),
  v("aeropuerto",  "the airport",      "el aeropuerto",   ["places", "nouns"]),
  v("bano",        "the bathroom / toilet", "el baño",    ["places", "nouns"], { accept: ["el aseo", "los servicios"] }),
  v("trabajo",     "the work / job",   "el trabajo",      ["places", "nouns"]),

  // --- Things ---
  v("coche",     "the car",          "el coche",     ["things", "nouns"], { explain: "Spain says 'coche'. Latin America mostly says 'carro' or 'auto'." }),
  v("movil",     "the mobile phone", "el móvil",     ["things", "nouns"], { explain: "Spain says 'móvil'. Latin America says 'celular'." }),
  v("ordenador", "the computer",     "el ordenador", ["things", "nouns"], { explain: "Spain says 'ordenador'. Latin America says 'computadora'." }),
  v("libro",     "the book",         "el libro",     ["things", "nouns"]),
  v("mesa",      "the table",        "la mesa",      ["things", "nouns"]),
  v("silla",     "the chair",        "la silla",     ["things", "nouns"]),
  v("puerta",    "the door",         "la puerta",    ["things", "nouns"]),
  v("dinero",    "the money",        "el dinero",    ["things", "nouns"]),
  v("billete",   "the ticket",       "el billete",   ["things", "nouns"], { explain: "Spain: 'billete' for a train/bus ticket; 'entrada' for a concert or museum." }),
  v("llave",     "the key",          "la llave",     ["things", "nouns"]),
  v("problema",  "the problem",      "el problema",  ["things", "nouns"], { explain: "Masculine despite ending in -a. So are el día, el mapa, el idioma.", concepts: ["gender"] }),
  v("dia",       "the day",          "el día",       ["time", "nouns"], { explain: "Masculine despite ending in -a.", concepts: ["gender"] }),
  v("semana",    "the week",         "la semana",    ["time", "nouns"]),
  v("ano",       "the year",         "el año",       ["time", "nouns"], { explain: "Don't drop the ñ: 'ano' means something very different." }),
  v("hoy",       "today",            "hoy",          ["time"]),
  v("manana",    "tomorrow",         "mañana",       ["time"], { explain: "'La mañana' (with the article) means 'the morning'." }),
  v("ayer",      "yesterday",        "ayer",         ["time"]),
  v("ahora",     "now",              "ahora",        ["time"]),

  // --- Adjectives ---
  v("grande",    "big",          "grande",   ["adjectives"]),
  v("pequeno",   "small",        "pequeño",  ["adjectives"]),
  v("bueno",     "good",         "bueno",    ["adjectives"]),
  v("malo",      "bad",          "malo",     ["adjectives"]),
  v("nuevo",     "new",          "nuevo",    ["adjectives"]),
  v("viejo",     "old",          "viejo",    ["adjectives"]),
  v("caro",      "expensive",    "caro",     ["adjectives"]),
  v("barato",    "cheap",        "barato",   ["adjectives"]),
  v("cansado",   "tired",        "cansado",  ["adjectives"], { explain: "A temporary state, so it goes with estar: estoy cansado.", concepts: ["estar"] }),
  v("contento",  "happy (right now)", "contento", ["adjectives"], { explain: "Goes with estar: estoy contento.", concepts: ["estar"] }),
  v("facil",     "easy",         "fácil",    ["adjectives"]),
  v("dificil",   "difficult",    "difícil",  ["adjectives"]),

  // --- Common verbs (infinitives) ---
  v("hablar",   "to speak",      "hablar",   ["verbs"]),
  v("comer",    "to eat",        "comer",    ["verbs"]),
  v("beber",    "to drink",      "beber",    ["verbs"], { accept: ["tomar"], explain: "In a bar you'll usually hear 'tomar': ¿Qué vas a tomar?" }),
  v("vivir",    "to live",       "vivir",    ["verbs"]),
  v("trabajar", "to work",       "trabajar", ["verbs"]),
  v("querer",   "to want",       "querer",   ["verbs"]),
  v("poder",    "to be able to / can", "poder", ["verbs"]),
  v("hacer",    "to do / to make", "hacer",  ["verbs"]),
  v("ir-inf",   "to go",         "ir",       ["verbs"], { concepts: ["ir"] }),
  v("ser-inf",  "to be (permanent: identity, origin)", "ser", ["verbs"], { concepts: ["ser", "ser-vs-estar"] }),
  v("estar-inf","to be (location, how you feel)", "estar", ["verbs"], { concepts: ["estar", "ser-vs-estar"] }),
  v("tener-inf","to have",       "tener",    ["verbs"], { concepts: ["tener"] }),

  // --- Grammar: the / it / -o -a -os -as ---
  v("g-los-chicos",  "the boys",             "los chicos",     ["grammar"], { explain: "Masculine plural. Also 'the children' or a mixed group of boys and girls.", concepts: ["articles", "agreement"] }),
  v("g-las-chicas",  "the girls",            "las chicas",     ["grammar"], { concepts: ["articles"] }),
  v("g-los-libros",  "the books",            "los libros",     ["grammar"], { concepts: ["articles"] }),
  v("g-las-casas",   "the houses",           "las casas",      ["grammar"], { concepts: ["articles"] }),
  v("g-coche-nuevo", "a new car",            "un coche nuevo", ["grammar"], { explain: "Adjective after the noun, matching it: coche is ♂ → nuevo.", concepts: ["agreement"] }),
  v("g-casa-nueva",  "a new house",          "una casa nueva", ["grammar"], { explain: "casa is ♀ → nueva.", concepts: ["agreement"] }),
  v("g-coches-nuevos", "the new cars",       "los coches nuevos", ["grammar"], { concepts: ["agreement"] }),
  v("g-casas-nuevas",  "the new houses",     "las casas nuevas",  ["grammar"], { concepts: ["agreement"] }),
  v("g-ciudad-grande", "a big city",         "una ciudad grande", ["grammar"], { explain: "grande ends in -e, so it's the same for ♂ and ♀.", concepts: ["agreement"] }),
  v("g-lo-tengo",    "I have it. (the book)", "Lo tengo.",     ["grammar"], { explain: "el libro is ♂ → lo. The pronoun goes before the verb.", concepts: ["lo-la-los-las"] }),
  v("g-la-tengo",    "I have it. (the key)",  "La tengo.",     ["grammar"], { explain: "la llave is ♀ → la.", concepts: ["lo-la-los-las"] }),
  v("g-los-tengo",   "I have them. (the tickets)", "Los tengo.", ["grammar"], { explain: "los billetes is ♂ plural → los.", concepts: ["lo-la-los-las"] }),
  v("g-las-tengo",   "I have them. (the keys)",    "Las tengo.", ["grammar"], { explain: "las llaves is ♀ plural → las.", concepts: ["lo-la-los-las"] }),
  v("g-lo-bueno",    "the good thing",       "lo bueno",       ["grammar"], { explain: "lo + adjective = 'the ___ thing'. Never lo + noun.", concepts: ["lo-la-los-las"] }),
  v("g-lo-que",      "what I want",          "lo que quiero",  ["grammar"], { explain: "lo que = 'what' / 'the thing that' (not a question).", concepts: ["lo-la-los-las"] }),
];
