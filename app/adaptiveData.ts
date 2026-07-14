export type View = "overview" | "curriculum" | "content" | "sessions" | "learners" | "analytics" | "models" | "trust" | "api";
export type Locale = "en" | "fr";

export const navigation: Array<{ label: string; items: Array<{ id: View; label: string; fr: string; icon: string }> }> = [
  { label: "Engine", items: [
    { id: "overview", label: "Overview", fr: "Aperçu", icon: "⌂" },
    { id: "curriculum", label: "Curriculum graph", fr: "Graphe du curriculum", icon: "◇" },
    { id: "content", label: "Content library", fr: "Bibliothèque", icon: "▤" },
    { id: "sessions", label: "Adaptive sessions", fr: "Sessions adaptatives", icon: "▶" },
    { id: "learners", label: "Learner profiles", fr: "Profils d’apprentissage", icon: "◎" },
  ]},
  { label: "Intelligence", items: [
    { id: "analytics", label: "Quality analytics", fr: "Analyse de la qualité", icon: "↗" },
    { id: "models", label: "Model registry", fr: "Registre des modèles", icon: "◫" },
  ]},
  { label: "Platform", items: [
    { id: "trust", label: "Trust centre", fr: "Centre de confiance", icon: "✓" },
    { id: "api", label: "API & integration", fr: "API et intégration", icon: "{ }" },
  ]},
];

export const concepts = [
  { code: "B2.1", title: "Addition and subtraction facts", fr: "Faits d’addition et de soustraction", strand: "Number", grade: 2, mastery: 74, confidence: 82, prereqs: ["B1.2"], items: 18 },
  { code: "B2.2", title: "Mental math strategies", fr: "Stratégies de calcul mental", strand: "Number", grade: 2, mastery: 61, confidence: 68, prereqs: ["B2.1"], items: 12 },
  { code: "C2.1", title: "Patterns and relationships", fr: "Suites et relations", strand: "Algebra", grade: 2, mastery: 48, confidence: 71, prereqs: ["C1.1"], items: 9 },
  { code: "D1.2", title: "Data collection and organization", fr: "Collecte et organisation de données", strand: "Data", grade: 2, mastery: 83, confidence: 89, prereqs: [], items: 15 },
  { code: "E1.3", title: "Spatial relationships", fr: "Relations spatiales", strand: "Spatial Sense", grade: 2, mastery: 57, confidence: 63, prereqs: ["E1.1"], items: 7 },
  { code: "F1.1", title: "Money concepts", fr: "Concepts monétaires", strand: "Financial Literacy", grade: 2, mastery: 69, confidence: 76, prereqs: ["B1.1"], items: 11 },
];

export const events = [
  { learner: "lrn_7f2a", concept: "B2.2", outcome: "Incorrect", meta: "18.4s · 1 hint · attempt 2", time: "2 min ago" },
  { learner: "lrn_91bc", concept: "D1.2", outcome: "Correct", meta: "8.1s · no hints · attempt 1", time: "6 min ago" },
  { learner: "lrn_4de0", concept: "C2.1", outcome: "Correct", meta: "12.7s · 1 hint · attempt 1", time: "9 min ago" },
  { learner: "lrn_7f2a", concept: "B2.1", outcome: "Correct", meta: "6.3s · no hints · attempt 1", time: "12 min ago" },
];

export const recommendations = [
  { action: "Remediate", learner: "lrn_7f2a", concept: "B2.1", item: "itm_1048", reason: "PREREQUISITE_GAP", confidence: 87 },
  { action: "Practice", learner: "lrn_91bc", concept: "D1.2", item: "itm_0812", reason: "TARGET_DIFFICULTY", confidence: 92 },
  { action: "Review", learner: "lrn_4de0", concept: "C1.1", item: "itm_2240", reason: "RETENTION_RISK", confidence: 78 },
];

export const items = [
  { id: "itm_1048", title: "Make ten to subtract", concepts: ["B2.1", "B2.2"], prior: "2.0", empirical: "2.3", discrimination: "1.18", exposure: "1,284", status: "Healthy" },
  { id: "itm_0812", title: "Read a pictograph", concepts: ["D1.2"], prior: "1.5", empirical: "1.4", discrimination: "0.92", exposure: "986", status: "Healthy" },
  { id: "itm_2240", title: "Continue the pattern", concepts: ["C2.1"], prior: "2.5", empirical: "3.1", discrimination: "0.41", exposure: "744", status: "Review" },
  { id: "itm_1302", title: "Identify the hidden shape", concepts: ["E1.3"], prior: "2.0", empirical: "2.2", discrimination: "1.07", exposure: "511", status: "Healthy" },
];
