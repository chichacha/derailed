// An Astro page can import structured data at build time.
// These examples are intentionally small and editable for learning.
export const examples = [
  {
    id: "garden",
    label: "🌱 The disappearing seedlings",
    assumption: "I can keep a small group of seedlings alive long enough to discover why the others disappeared.",
    test: "Observe six seedlings over several days. Compare a few protected and unprotected plants, and log their care and conditions.",
    evidence: "If damage differs, investigate the cause; a cover may change moisture and temperature too, so the result is a clue, not proof."
  },
  {
    id: "puzzle",
    label: "🧩 A new puzzle game",
    assumption: "A first-time player will understand the core puzzle and want to try again.",
    test: "Give a rough playable prototype to three unfamiliar players. Watch what they do before explaining the rules.",
    evidence: "Repeated hesitation or early exits suggest the interaction needs work before investing in characters and polish."
  },
  {
    id: "microsite",
    label: "🌐 An interactive data story",
    assumption: "A nontechnical reader will understand the key data distinction after one short interaction.",
    test: "Show a minimal story with one interactive example to three colleagues and ask them to explain it back.",
    evidence: "Compare what readers understood with the intended takeaway, and revise the explanation before adding more animations."
  }
];
