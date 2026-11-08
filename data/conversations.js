// Conversations deck — short everyday dialogues, Spain Spanish.
//
// Each dialogue is written once. From it we generate:
//   • one practice card per line where `you: true` — the prompt shows what the
//     other person just said plus what you want to say (in English); the
//     answer is your line in Spanish.
//   • a Reference page (category "Conversations") showing the whole script.
//
// Line shape: { who, es, en, you?, accept?, concepts?, note? }
// Card ids are `d-<dialogue>-<line index>`, so append new lines at the end of
// a dialogue rather than inserting in the middle (progress is keyed on id).
//
// Load after data/grammar.js (registers the dialogue pages there).

window.DIALOGUES = [
  {
    id: "meet",
    title: "Meeting someone",
    setting: "At a friend's party. You meet Lucía.",
    lines: [
      { who: "Lucía", es: "¡Hola! Me llamo Lucía. ¿Y tú?", en: "Hi! I'm Lucía. And you?" },
      { who: "You", you: true, es: "Hola, me llamo Alex.", en: "Hi, my name is Alex.", accept: ["Hola, soy Alex."] },
      { who: "Lucía", es: "Encantada. ¿De dónde eres?", en: "Nice to meet you. Where are you from?" },
      { who: "You", you: true, es: "Soy de Inglaterra. ¿Y tú?", en: "I'm from England. And you?", concepts: ["ser"] },
      { who: "Lucía", es: "Soy de Valencia, pero vivo en Madrid.", en: "I'm from Valencia, but I live in Madrid." },
      { who: "You", you: true, es: "¿Hablas inglés?", en: "Do you speak English?" },
      { who: "Lucía", es: "Un poco. ¡Pero tu español es muy bueno!", en: "A little. But your Spanish is very good!" },
      { who: "You", you: true, es: "¡Gracias! Eres muy simpática.", en: "Thanks! You're very nice.", concepts: ["ser-vs-estar"], note: "Personality → ser." },
    ],
  },
  {
    id: "bar",
    title: "At the bar",
    setting: "Breakfast at a bar in Spain. The waiter comes over.",
    lines: [
      { who: "Camarero", es: "Hola, buenos días. ¿Qué te pongo?", en: "Hi, good morning. What can I get you?", note: "'¿Qué te pongo?' (literally 'what do I put you?') is how bar staff in Spain take your order." },
      { who: "You", you: true, es: "Un café con leche, por favor.", en: "A white coffee, please." },
      { who: "Camarero", es: "¿Algo más?", en: "Anything else?" },
      { who: "You", you: true, es: "Sí, una tostada con tomate.", en: "Yes, toast with tomato.", note: "Tostada con tomate is a classic Spanish breakfast." },
      { who: "Camarero", es: "Muy bien. ¿Para tomar aquí o para llevar?", en: "Very good. For here or to take away?" },
      { who: "You", you: true, es: "Para tomar aquí.", en: "For here.", accept: ["Para aquí."] },
      { who: "You", you: true, es: "¿Cuánto es?", en: "How much is it?" },
      { who: "Camarero", es: "Son tres euros con cincuenta.", en: "That's three euros fifty." },
      { who: "You", you: true, es: "Aquí tienes. ¡Gracias!", en: "Here you go. Thanks!" },
      { who: "Camarero", es: "A ti. ¡Hasta luego!", en: "Thank you. See you!", note: "'A ti' = 'thank YOU' when someone thanks you." },
    ],
  },
  {
    id: "directions",
    title: "Asking for directions",
    setting: "You're lost and stop someone in the street.",
    lines: [
      { who: "You", you: true, es: "Perdona, ¿dónde está la estación?", en: "Excuse me, where is the station?", accept: ["Perdone, ¿dónde está la estación?"], concepts: ["estar"], note: "Location → estar. Use 'perdone' to be more formal." },
      { who: "Señora", es: "Está muy cerca. Sigue todo recto y gira a la derecha.", en: "It's very close. Go straight on and turn right." },
      { who: "You", you: true, es: "¿Todo recto y a la derecha?", en: "Straight on and to the right?" },
      { who: "Señora", es: "Sí, eso es. Está al lado del mercado.", en: "Yes, that's it. It's next to the market." },
      { who: "You", you: true, es: "Muchas gracias.", en: "Thank you very much." },
      { who: "Señora", es: "De nada. ¡Buen viaje!", en: "You're welcome. Have a good trip!" },
    ],
  },
  {
    id: "market",
    title: "At the market",
    setting: "Buying fruit and vegetables at a market stall.",
    lines: [
      { who: "Vendedora", es: "Hola, ¿qué quieres?", en: "Hi, what would you like?" },
      { who: "You", you: true, es: "Hola. Un kilo de manzanas, por favor.", en: "Hi. A kilo of apples, please." },
      { who: "Vendedora", es: "Aquí tienes. ¿Algo más?", en: "Here you go. Anything else?" },
      { who: "You", you: true, es: "¿Cuánto cuestan las patatas?", en: "How much are the potatoes?" },
      { who: "Vendedora", es: "Dos euros el kilo.", en: "Two euros a kilo." },
      { who: "You", you: true, es: "Vale, un kilo también. ¿Cuánto es todo?", en: "OK, a kilo of those too. How much is everything?" },
      { who: "Vendedora", es: "Son cinco euros.", en: "That's five euros." },
    ],
  },
  {
    id: "restaurant",
    title: "At a restaurant",
    setting: "Dinner for two. The waitress greets you at the door.",
    lines: [
      { who: "Camarera", es: "Buenas noches. ¿Cuántos sois?", en: "Good evening. How many of you are there?", note: "'Sois' is the vosotros form of ser — normal in Spain." },
      { who: "You", you: true, es: "Somos dos.", en: "There are two of us.", concepts: ["ser"] },
      { who: "Camarera", es: "Muy bien, por aquí. ¿Qué vais a tomar de beber?", en: "Very good, this way. What would you like to drink?" },
      { who: "You", you: true, es: "Agua y una cerveza, por favor.", en: "Water and a beer, please." },
      { who: "Camarera", es: "¿Y para comer?", en: "And to eat?" },
      { who: "You", you: true, es: "Para mí, el pollo con patatas.", en: "For me, the chicken with potatoes." },
      { who: "Camarera", es: "¿Todo bien?", en: "Is everything OK?" },
      { who: "You", you: true, es: "Sí, todo muy bueno. La cuenta, por favor.", en: "Yes, it's all very good. The bill, please." },
    ],
  },
  {
    id: "plans",
    title: "Weekend plans",
    setting: "Chatting with your friend Javier on Friday.",
    lines: [
      { who: "Javier", es: "¿Qué vas a hacer el fin de semana?", en: "What are you going to do at the weekend?" },
      { who: "You", you: true, es: "Voy a ir a la playa. ¿Y tú?", en: "I'm going to go to the beach. And you?", concepts: ["ir"] },
      { who: "Javier", es: "Yo tengo que trabajar el sábado.", en: "I have to work on Saturday." },
      { who: "You", you: true, es: "¿Y el domingo?", en: "And on Sunday?" },
      { who: "Javier", es: "El domingo estoy libre.", en: "On Sunday I'm free." },
      { who: "You", you: true, es: "¿Vamos al cine el domingo?", en: "Shall we go to the cinema on Sunday?", concepts: ["ir", "articles"], note: "a + el → al." },
      { who: "Javier", es: "¡Vale! ¿A qué hora?", en: "OK! What time?" },
      { who: "You", you: true, es: "A las seis.", en: "At six." },
    ],
  },
  {
    id: "family",
    title: "Talking about family",
    setting: "Lucía asks about your family.",
    lines: [
      { who: "Lucía", es: "¿Tienes hermanos?", en: "Do you have any brothers or sisters?" },
      { who: "You", you: true, es: "Sí, tengo un hermano y una hermana.", en: "Yes, I have a brother and a sister.", concepts: ["tener"] },
      { who: "Lucía", es: "¿Cuántos años tiene tu hermano?", en: "How old is your brother?" },
      { who: "You", you: true, es: "Tiene veinte años.", en: "He's twenty.", concepts: ["tener"], note: "Age uses tener." },
      { who: "Lucía", es: "¿Y dónde viven?", en: "And where do they live?" },
      { who: "You", you: true, es: "Viven con mis padres.", en: "They live with my parents." },
      { who: "Lucía", es: "Yo no tengo hermanos. Soy hija única.", en: "I don't have any siblings. I'm an only child." },
    ],
  },
  {
    id: "station",
    title: "At the train station",
    setting: "Buying a train ticket at the counter.",
    lines: [
      { who: "You", you: true, es: "Hola. Un billete para Sevilla, por favor.", en: "Hi. A ticket to Seville, please." },
      { who: "Empleado", es: "¿De ida o de ida y vuelta?", en: "One way or return?" },
      { who: "You", you: true, es: "De ida y vuelta.", en: "Return." },
      { who: "Empleado", es: "¿Para hoy?", en: "For today?" },
      { who: "You", you: true, es: "No, para mañana por la mañana.", en: "No, for tomorrow morning." },
      { who: "Empleado", es: "Hay un tren a las nueve. Son sesenta euros.", en: "There's a train at nine. That's sixty euros." },
      { who: "You", you: true, es: "Vale. ¿De qué andén sale?", en: "OK. Which platform does it leave from?" },
      { who: "Empleado", es: "Del andén tres.", en: "From platform three." },
    ],
  },

  // --- Spy comedy: original scenes. You are Agente Romero: talented, lazy,
  // always hungry. Doña Carmen runs the agency and is out of patience.
  {
    id: "spy-mission",
    title: "🕶️ Spy: The new mission",
    setting: "Agency HQ, Madrid. Your boss, Doña Carmen, calls you into her office.",
    tags: ["spy"],
    lines: [
      { who: "Doña Carmen", es: "Agente Romero, tienes una misión nueva.", en: "Agent Romero, you have a new mission." },
      { who: "You", you: true, es: "¿Ahora? Estoy muy cansado.", en: "Now? I'm very tired.", accept: ["¿Ahora? Estoy muy cansada."], concepts: ["estar"] },
      { who: "Doña Carmen", es: "Son las diez de la mañana.", en: "It's ten in the morning.", note: "Time → ser: son las diez." },
      { who: "You", you: true, es: "Exacto. Es muy temprano.", en: "Exactly. It's very early." },
      { who: "Doña Carmen", es: "Vas a ir a Sevilla.", en: "You're going to Seville." },
      { who: "You", you: true, es: "¿Sevilla? ¿Hay playa?", en: "Seville? Is there a beach?", note: "hay = there is / there are." },
      { who: "Doña Carmen", es: "No. Hay un espía enemigo.", en: "No. There's an enemy spy." },
      { who: "You", you: true, es: "Vale. Pero primero, un café.", en: "OK. But first, a coffee." },
    ],
  },
  {
    id: "spy-password",
    title: "🕶️ Spy: The password",
    setting: "A dark bar in Seville. You meet your contact. You were supposed to memorise a password.",
    tags: ["spy"],
    lines: [
      { who: "Contacto", es: "La luna está muy bonita esta noche.", en: "The moon is very pretty tonight." },
      { who: "You", you: true, es: "¿Qué?", en: "What?" },
      { who: "Contacto", es: "La contraseña. ¿Tienes la contraseña?", en: "The password. Do you have the password?" },
      { who: "You", you: true, es: "Ah, sí… ¿El sol es amarillo?", en: "Ah, yes… The sun is yellow?", note: "Colour as a characteristic → ser." },
      { who: "Contacto", es: "No.", en: "No." },
      { who: "You", you: true, es: "¿El gato es negro?", en: "The cat is black?" },
      { who: "Contacto", es: "No. Es «el café está frío».", en: "No. It's 'the coffee is cold'.", note: "A temporary state → estar: the coffee isn't always cold." },
      { who: "You", you: true, es: "¡Ah, sí! El café está frío.", en: "Oh, right! The coffee is cold.", concepts: ["ser-vs-estar"] },
      { who: "Contacto", es: "Demasiado tarde. Me voy.", en: "Too late. I'm leaving." },
    ],
  },
  {
    id: "spy-gadgets",
    title: "🕶️ Spy: The gadgets",
    setting: "The lab. Óscar, the agency's inventor, shows you this week's gadgets.",
    tags: ["spy"],
    lines: [
      { who: "Óscar", es: "Aquí tienes tus gadgets nuevos.", en: "Here are your new gadgets." },
      { who: "You", you: true, es: "¿Es un bolígrafo?", en: "Is it a pen?" },
      { who: "Óscar", es: "No, es una bomba. ¡Cuidado!", en: "No, it's a bomb. Careful!" },
      { who: "You", you: true, es: "¿Y esto? ¿Es una bomba también?", en: "And this? Is it a bomb too?" },
      { who: "Óscar", es: "No, eso es mi bocadillo.", en: "No, that's my sandwich.", note: "A bocadillo is a sandwich on a baguette, very Spanish." },
      { who: "You", you: true, es: "Tengo hambre. ¿Puedo…?", en: "I'm hungry. Can I…?", concepts: ["tener"] },
      { who: "Óscar", es: "¡No! Lo necesito. Es mi comida.", en: "No! I need it. It's my lunch.", note: "lo = it (el bocadillo is masculine)." },
    ],
  },
  {
    id: "spy-rival",
    title: "🕶️ Spy: The rival",
    setting: "A fancy party. You run into Valeria, a rival agent, who is holding the briefcase you were sent to steal.",
    tags: ["spy"],
    lines: [
      { who: "Valeria", es: "Hola, Romero. ¿Qué haces aquí?", en: "Hello, Romero. What are you doing here?" },
      { who: "You", you: true, es: "Estoy de vacaciones.", en: "I'm on holiday.", concepts: ["estar"], note: "estar de vacaciones = to be on holiday." },
      { who: "Valeria", es: "¿Con una pistola?", en: "With a gun?" },
      { who: "You", you: true, es: "Es para… las fotos.", en: "It's for… the photos.", note: "la foto is feminine even though it ends in -o (short for la fotografía)." },
      { who: "Valeria", es: "Claro. Yo también estoy de vacaciones.", en: "Of course. I'm on holiday too." },
      { who: "You", you: true, es: "¿Y el maletín?", en: "And the briefcase?" },
      { who: "Valeria", es: "¿Qué maletín?", en: "What briefcase?" },
      { who: "You", you: true, es: "El maletín que tienes en la mano.", en: "The briefcase you have in your hand.", note: "la mano is feminine even though it ends in -o." },
    ],
  },
  {
    id: "spy-debrief",
    title: "🕶️ Spy: The debrief",
    setting: "Back in Madrid. The mission did not go well.",
    tags: ["spy"],
    lines: [
      { who: "Doña Carmen", es: "¿Dónde está el maletín?", en: "Where is the briefcase?" },
      { who: "You", you: true, es: "Es una historia muy larga.", en: "It's a very long story." },
      { who: "Doña Carmen", es: "¿Y el coche?", en: "And the car?" },
      { who: "You", you: true, es: "El coche está… en el mar.", en: "The car is… in the sea.", concepts: ["estar"], note: "Location → estar." },
      { who: "Doña Carmen", es: "¡Es el tercer coche este mes!", en: "That's the third car this month!" },
      { who: "You", you: true, es: "El cuarto.", en: "The fourth." },
      { who: "Doña Carmen", es: "Estás despedido.", en: "You're fired." },
      { who: "You", you: true, es: "¿Otra vez?", en: "Again?" },
    ],
  },
];

(function () {
  const cards = [];
  const concepts = window.GRAMMAR_CONCEPTS || (window.GRAMMAR_CONCEPTS = {});
  if (window.GRAMMAR_CATEGORY_ORDER && !window.GRAMMAR_CATEGORY_ORDER.includes("Conversations")) {
    window.GRAMMAR_CATEGORY_ORDER.push("Conversations");
  }

  for (const d of window.DIALOGUES) {
    const pageKey = `dlg-${d.id}`;
    concepts[pageKey] = {
      category: "Conversations",
      title: d.title,
      summary: d.setting,
      dialogue: d.lines,
    };

    d.lines.forEach((line, i) => {
      if (!line.you) return;
      const prev = d.lines[i - 1];
      const context = prev && !prev.you
        ? `${prev.who}: ${prev.es}`
        : (i === 0 ? d.setting : "");
      const explain = [
        prev && !prev.you ? `${prev.who}: “${prev.es}” = ${prev.en}` : "",
        line.note || "",
      ].filter(Boolean).join("\n");
      cards.push({
        id: `d-${d.id}-${i}`,
        prompt: `${context ? context + "\n\n" : ""}You say: ${line.en}`,
        answer: line.es,
        accept: line.accept,
        explain,
        concepts: [pageKey, ...(line.concepts || [])],
        // Dialogue tag first so multiple choice offers other lines from the same scene.
        tags: [d.id, "conversations", ...(d.tags || [])],
        level: 1,
      });
    });
  }

  window.CONVERSATION_CARDS = cards;
})();
