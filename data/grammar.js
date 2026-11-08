// Grammar reference — powers the Reference tab and the ⓘ chips on cards.
//
// Each concept:
//   category:    grouping used by the Reference tab
//   summary:     one sentence
//   description: a few beginner-friendly sentences
//   table:       [{ label, value }] — e.g. a conjugation table (optional)
//   examples:    [{ es, en }]
//   seeAlso:     other concept keys
//
// Load after data/verbs.js: verb tables are filled from window.VERB_TABLES.

window.GRAMMAR_CATEGORY_ORDER = ["Key verbs", "Usage", "Nouns", "Pronouns"];

window.GRAMMAR_CONCEPTS = {
  ser: {
    category: "Key verbs",
    summary: "to be — for what something is (identity, origin, job, personality, time).",
    description:
      "Use ser for things that define what someone or something is: who they are, where they're from, what they do, what they're like, and for telling the time and dates. Irregular in almost every form.",
    examples: [
      { es: "Soy Ana.", en: "I'm Ana." },
      { es: "Somos de Londres.", en: "We're from London." },
      { es: "Es médico.", en: "He's a doctor." },
      { es: "Son las tres.", en: "It's three o'clock." },
    ],
    seeAlso: ["estar", "ser-vs-estar"],
  },

  estar: {
    category: "Key verbs",
    summary: "to be — for where something is and how it is right now.",
    description:
      "Use estar for location (even permanent location: Madrid está en España) and for states and feelings that can change: tired, happy, ill, busy. Note the accents on estás, está, estáis, están.",
    examples: [
      { es: "Estoy en casa.", en: "I'm at home." },
      { es: "¿Cómo estás?", en: "How are you?" },
      { es: "Está cansada.", en: "She's tired." },
      { es: "El bar está cerrado.", en: "The bar is closed." },
    ],
    seeAlso: ["ser", "ser-vs-estar"],
  },

  tener: {
    category: "Key verbs",
    summary: "to have — also used for age, hunger, thirst, cold and more.",
    description:
      "Tener means 'to have', but Spanish also uses it where English uses 'to be': tengo 30 años (I'm 30), tengo hambre (I'm hungry), tengo sed (I'm thirsty), tengo frío (I'm cold). Tener que + infinitive means 'to have to'.",
    examples: [
      { es: "Tengo dos hermanos.", en: "I have two brothers." },
      { es: "¿Cuántos años tienes?", en: "How old are you?" },
      { es: "Tenemos hambre.", en: "We're hungry." },
      { es: "Tengo que trabajar.", en: "I have to work." },
    ],
    seeAlso: ["ser"],
  },

  ir: {
    category: "Key verbs",
    summary: "to go — and with 'a' + infinitive, 'going to' do something.",
    description:
      "Ir is completely irregular. It is followed by 'a' before a place (a + el contracts to al). Ir a + infinitive is the easiest way to talk about the future: voy a comer = I'm going to eat. Vamos on its own also means 'let's go'.",
    examples: [
      { es: "Voy al mercado.", en: "I'm going to the market." },
      { es: "¿Adónde vas?", en: "Where are you going?" },
      { es: "Vamos a cenar.", en: "We're going to have dinner." },
      { es: "¡Vamos!", en: "Let's go!" },
    ],
    seeAlso: ["tener"],
  },

  "ser-vs-estar": {
    category: "Usage",
    summary: "Both mean 'to be'. Ser = what it is. Estar = where it is / how it is now.",
    description:
      "A rough rule: ser for identity and characteristics, estar for location and temporary states. Some adjectives change meaning: es aburrido (he's boring) vs está aburrido (he's bored); es listo (he's clever) vs está listo (he's ready).",
    table: [
      { label: "ser",   value: "identity, origin, job, personality, nationality, time, what something is made of" },
      { label: "estar", value: "location, feelings, moods, temporary conditions, results of a change" },
    ],
    examples: [
      { es: "Soy de Madrid, pero estoy en Sevilla.", en: "I'm from Madrid, but I'm in Seville." },
      { es: "Es simpática.", en: "She's nice (that's her personality)." },
      { es: "Está contenta.", en: "She's happy (right now)." },
    ],
    seeAlso: ["ser", "estar"],
  },

  gender: {
    category: "Nouns",
    summary: "Every noun is masculine or feminine. Learn the article with the word.",
    description:
      "Most nouns ending in -o are masculine and most ending in -a are feminine, but there are exceptions, so always learn nouns with el/la. Endings that are reliably feminine: -ción, -sión, -dad, -tad. Feminine nouns starting with a stressed 'a' take 'el' in the singular: el agua, el aula.",
    table: [
      { label: "usually ♂", value: "-o, -or, -aje, and many words of Greek origin ending in -ma (el problema, el idioma)" },
      { label: "usually ♀", value: "-a, -ción, -sión, -dad, -tad, -tud" },
      { label: "exceptions", value: "el día, el mapa, el problema · la mano, la foto, la moto" },
    ],
    examples: [
      { es: "el libro / la mesa", en: "the book / the table" },
      { es: "la ciudad / la estación", en: "the city / the station" },
      { es: "el agua fría", en: "the cold water (feminine, but 'el')" },
    ],
    seeAlso: ["articles"],
  },

  articles: {
    category: "Nouns",
    summary: "The: el, la, los, las. A / some: un, una, unos, unas.",
    description:
      "Articles match the noun's gender and number. Masculine plural also covers mixed groups (los padres = the parents). Spanish leaves out 'a' before professions after ser: es profesora = she's a teacher. a + el → al and de + el → del.",
    table: [
      { label: "el / los",   value: "the (masculine singular / plural)" },
      { label: "la / las",   value: "the (feminine singular / plural)" },
      { label: "un / unos",  value: "a / some (masculine)" },
      { label: "una / unas", value: "a / some (feminine)" },
      { label: "al / del",   value: "a + el / de + el" },
    ],
    examples: [
      { es: "los chicos y las chicas", en: "the boys and the girls" },
      { es: "Voy al bar.", en: "I'm going to the bar." },
      { es: "Soy estudiante.", en: "I'm a student." },
    ],
    seeAlso: ["gender", "agreement", "lo-la-los-las"],
  },

  agreement: {
    category: "Nouns",
    summary: "Adjectives match the noun: -o / -a / -os / -as.",
    description:
      "An adjective takes the same gender and number as its noun, and usually comes after it: un coche nuevo, una casa nueva. Adjectives ending in -o have four forms. Adjectives ending in -e or a consonant don't change for gender, only for plural. A mixed group of masculine and feminine uses the masculine plural.",
    table: [
      { label: "♂ singular", value: "-o → el chico alto" },
      { label: "♀ singular", value: "-a → la chica alta" },
      { label: "♂ plural",   value: "-os → los chicos altos (also mixed groups)" },
      { label: "♀ plural",   value: "-as → las chicas altas" },
      { label: "-e / consonant", value: "grande → grandes, fácil → fáciles (same for ♂ and ♀)" },
    ],
    examples: [
      { es: "un coche nuevo / una casa nueva", en: "a new car / a new house" },
      { es: "los libros caros / las llaves pequeñas", en: "the expensive books / the small keys" },
      { es: "una ciudad grande / unas ciudades grandes", en: "a big city / some big cities" },
      { es: "Mis padres están cansados.", en: "My parents are tired. (mixed → -os)" },
    ],
    seeAlso: ["gender", "articles"],
  },

  "lo-la-los-las": {
    category: "Nouns",
    summary: "la and los do two jobs ('the' and 'it/them'); lo is never 'the' before a noun.",
    description:
      "Before a noun, el/la/los/las mean 'the'. Before a verb, lo/la/los/las mean 'it/him', 'it/her' and 'them': they replace a noun that's already been mentioned and match its gender. Lo also has a third job: lo + adjective means 'the ___ thing' (lo bueno = the good thing), and lo que means 'what' (lo que quiero = what I want). There is no 'lo' + noun: it's always el libro, never lo libro.",
    table: [
      { label: "el / la + noun",   value: "the (singular): el libro, la casa" },
      { label: "los / las + noun", value: "the (plural): los libros, las casas" },
      { label: "lo + verb",  value: "it / him (♂): ¿El libro? Lo tengo." },
      { label: "la + verb",  value: "it / her (♀): ¿La llave? La tengo." },
      { label: "los / las + verb", value: "them: ¿Los billetes? Los tengo. ¿Las llaves? Las tengo." },
      { label: "lo + adjective", value: "the … thing: lo bueno, lo malo, lo difícil" },
      { label: "lo que", value: "what / the thing that: lo que quiero" },
    ],
    examples: [
      { es: "¿Dónde está el café? — Lo tengo yo.", en: "Where's the coffee? — I've got it." },
      { es: "Las llaves… ¡no las tengo!", en: "The keys… I don't have them!" },
      { es: "Lo bueno es que hoy no trabajo.", en: "The good thing is I'm not working today." },
      { es: "No es lo que quiero.", en: "It's not what I want." },
    ],
    seeAlso: ["articles", "agreement"],
  },

  pronouns: {
    category: "Pronouns",
    summary: "yo, tú, él/ella/usted, nosotros, vosotros, ellos/ellas/ustedes.",
    description:
      "Subject pronouns are usually dropped because the verb ending already shows who: 'hablo' already means 'I speak'. Use tú with friends and people your age, usted when being formal. In Spain, vosotros is the normal informal plural 'you all'; ustedes is the formal plural.",
    table: [
      { label: "yo", value: "I" },
      { label: "tú", value: "you (informal)" },
      { label: "él / ella / usted", value: "he / she / you (formal)" },
      { label: "nosotros/as", value: "we" },
      { label: "vosotros/as", value: "you all (informal — Spain)" },
      { label: "ellos / ellas / ustedes", value: "they / you all (formal)" },
    ],
    examples: [
      { es: "¿Habláis inglés?", en: "Do you (all) speak English? — vosotros" },
      { es: "¿Habla usted inglés?", en: "Do you speak English? — formal" },
    ],
    seeAlso: ["ser"],
  },
};

// Fill in present-tense tables for the key verbs from data/verbs.js.
(function () {
  const tables = window.VERB_TABLES || {};
  const persons = window.VERB_PERSONS || [];
  for (const [verb, t] of Object.entries(tables)) {
    const c = window.GRAMMAR_CONCEPTS[verb];
    if (!c) continue;
    c.tableTitle = "Present tense";
    c.table = persons.map((p, i) => ({ label: p.key, value: t.forms[i] }));
  }
})();
