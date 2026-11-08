// Verb deck — present tense of the four most important verbs, Spain Spanish
// (includes vosotros). Conjugation cards are generated from VERB_TABLES so
// each verb is defined once. Short sentence cards follow at the end.

window.VERB_PERSONS = [
  { key: "yo",       en: "I" },
  { key: "tú",       en: "you (informal)" },
  { key: "él/ella/usted", en: "he / she / you (formal)" },
  { key: "nosotros", en: "we" },
  { key: "vosotros", en: "you all (informal)" },
  { key: "ellos/ellas/ustedes", en: "they / you all (formal)" },
];

// Forms in VERB_PERSONS order. `en` is the English for each person.
window.VERB_TABLES = {
  ser:   { meaning: "to be — permanent", forms: ["soy", "eres", "es", "somos", "sois", "son"],
           en: ["I am", "you are", "he/she is", "we are", "you all are", "they are"] },
  estar: { meaning: "to be — state or location", forms: ["estoy", "estás", "está", "estamos", "estáis", "están"],
           en: ["I am", "you are", "he/she is", "we are", "you all are", "they are"] },
  tener: { meaning: "to have", forms: ["tengo", "tienes", "tiene", "tenemos", "tenéis", "tienen"],
           en: ["I have", "you have", "he/she has", "we have", "you all have", "they have"] },
  ir:    { meaning: "to go", forms: ["voy", "vas", "va", "vamos", "vais", "van"],
           en: ["I go", "you go", "he/she goes", "we go", "you all go", "they go"] },
};

(function () {
  const personIds = ["yo", "tu", "el", "nosotros", "vosotros", "ellos"];
  const cards = [];
  for (const [verb, t] of Object.entries(window.VERB_TABLES)) {
    window.VERB_PERSONS.forEach((p, i) => {
      cards.push({
        id: `c-${verb}-present-${personIds[i]}`,
        prompt: `${verb}, present tense: ${p.key}`,
        answer: t.forms[i],
        explain: `${p.key.split("/")[0]} ${t.forms[i]} = ${t.en[i]}  ·  ${verb}: ${t.meaning}`,
        concepts: [verb],
        // What the Search tab shows for this card.
        lookup: { es: `${p.key.split("/")[0]} ${t.forms[i]}`, en: `${t.en[i]} (${verb})` },
        // The verb tag makes multiple choice offer the other forms of the same verb.
        tags: ["conjugation", "present", verb],
        level: 1,
      });
    });
  }

  // Sentence cards: English → Spanish, practising which verb to use.
  const s = (id, prompt, answer, concepts, explain, accept) =>
    ({ id: `s-${id}`, prompt, answer, concepts, explain, accept, tags: ["sentences"], level: 1 });

  cards.push(
    s("soy-de",        "I am from England.",          "Soy de Inglaterra.",   ["ser", "ser-vs-estar"], "Origin → ser."),
    s("es-profesora",  "She is a teacher.",           "Es profesora.",        ["ser", "articles"],     "Profession → ser, and no 'una' before the job.", ["Ella es profesora."]),
    s("estoy-cansado", "I am tired.",                 "Estoy cansado.",       ["estar", "ser-vs-estar"], "How you feel right now → estar.", ["Estoy cansada."]),
    s("donde-esta",    "Where is the station?",       "¿Dónde está la estación?", ["estar", "ser-vs-estar"], "Location → estar."),
    s("estamos-casa",  "We are at home.",             "Estamos en casa.",     ["estar"],               "Location → estar. 'En casa' = at home (no article)."),
    s("tengo-anos",    "I am 30 years old.",          "Tengo treinta años.",  ["tener"],               "Age uses tener: literally 'I have 30 years'."),
    s("tengo-hambre",  "I am hungry.",                "Tengo hambre.",        ["tener"],               "Hunger uses tener: literally 'I have hunger'. Also: tengo sed (thirsty), tengo frío (cold)."),
    s("tienes-hermanos","Do you have siblings?",      "¿Tienes hermanos?",    ["tener"]),
    s("voy-playa",     "I'm going to the beach.",     "Voy a la playa.",      ["ir"],                  "ir + a + place."),
    s("vamos-bar",     "Let's go to the bar!",        "¡Vamos al bar!",       ["ir"],                  "a + el contracts to 'al'."),
    s("voy-a-comer",   "I'm going to eat.",           "Voy a comer.",         ["ir"],                  "ir + a + infinitive = 'going to' (near future)."),
    s("vosotros-sois", "You all are very nice. (informal)", "Sois muy simpáticos.", ["ser"],           "Personality → ser. 'Sois' is the vosotros form, used in Spain."),
  );

  window.VERB_CARDS = cards;
})();
