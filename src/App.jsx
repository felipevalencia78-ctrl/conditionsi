// App React – La condition (si + présent → présent / impératif)
// Version gamifiée: Home (règle) → Quiz (20 Q) → Résultats + Révision
// Colle ce fichier dans src/App.jsx (Vite + React)

import React, { useMemo, useState } from "react";

// -----------------------------
// Helpers
// -----------------------------
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

function capitalize(s) {
  const str = String(s || "").trim();
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function normalizeVerb(v) {
  const vv = String(v || "").trim();
  if (vv === "etre") return "être";
  return vv;
}

function extractSiMeta(sentence) {
  // Ex: "Si vous ____ (vouloir) réserver, ..." -> subject="vous" ; verb="vouloir"
  const s = String(sentence || "");
  if (!s.startsWith("Si ")) return null;

  const idxBlank = s.indexOf("____");
  if (idxBlank === -1) return null;

  const subject = s.slice(3, idxBlank).trim();

  const open = s.indexOf("(", idxBlank);
  const close = s.indexOf(")", open + 1);
  if (open === -1 || close === -1) return null;

  const verb = normalizeVerb(s.slice(open + 1, close));
  if (!subject || !verb) return null;

  return { subject, verb };
}

function siConjugationLine(sentence, presentForm) {
  // Format voulu: "Vouloir au présent : vous voulez"
  const meta = extractSiMeta(sentence);
  if (!meta || !presentForm) return null;
  return `${capitalize(meta.verb)} au présent : ${meta.subject} ${presentForm}`;
}

// IMPORTANT didactique:
// Ici, on travaille la condition réelle (et non le temps "conditionnel").
// Structure:
//   - Si + présent  → présent
//   - Si + présent  → impératif

const QUESTIONS = [
  // 1–10 : compléter la conséquence (présent / impératif)
  {
    id: 1,
    type: "si + présent → présent",
    mode: "consequence",
    prompt: "Complète la conséquence.",
    sentence: "Si tu as le temps, tu ____ avec nous.",
    options: [
      { id: "a", text: "viens", correct: true },
      { id: "b", text: "viendras", correct: false },
      { id: "c", text: "venais", correct: false },
    ],
  },
  {
    id: 2,
    type: "si + présent → impératif",
    mode: "consequence",
    prompt: "Complète la conséquence.",
    sentence: "Si tu es fatigué, ____ un peu.",
    options: [
      { id: "a", text: "repose-toi", correct: true },
      { id: "b", text: "tu te reposes", correct: false },
      { id: "c", text: "tu reposeras", correct: false },
    ],
  },
  {
    id: 3,
    type: "si + présent → présent",
    mode: "consequence",
    prompt: "Complète la conséquence.",
    sentence: "Si on finit tôt, on ____ au cinéma.",
    options: [
      { id: "a", text: "va", correct: true },
      { id: "b", text: "ira", correct: false },
      { id: "c", text: "allait", correct: false },
    ],
  },
  {
    id: 4,
    type: "si + présent → impératif",
    mode: "consequence",
    prompt: "Complète la conséquence.",
    sentence: "Si vous voulez des infos, ____ ce numéro.",
    options: [
      { id: "a", text: "appelez", correct: true },
      { id: "b", text: "appelez-vous", correct: false },
      { id: "c", text: "appelez-vous de", correct: false },
    ],
  },
  {
    id: 5,
    type: "si + présent → présent",
    mode: "consequence",
    prompt: "Complète la conséquence.",
    sentence: "Si tu fais le travail, tu ____ rapidement.",
    options: [
      { id: "a", text: "finis", correct: true },
      { id: "b", text: "finiras", correct: false },
      { id: "c", text: "finissais", correct: false },
    ],
  },
  {
    id: 6,
    type: "si + présent → impératif",
    mode: "consequence",
    prompt: "Complète la conséquence.",
    sentence: "Si tu vois un problème, ____-moi !",
    options: [
      { id: "a", text: "écris", correct: true },
      { id: "b", text: "écris-tu", correct: false },
      { id: "c", text: "écriras", correct: false },
    ],
  },
  {
    id: 7,
    type: "si + présent → présent",
    mode: "consequence",
    prompt: "Complète la conséquence.",
    sentence: "Si elle a besoin d'aide, je ____ tout de suite.",
    options: [
      { id: "a", text: "viens", correct: true },
      { id: "b", text: "viendrai", correct: false },
      { id: "c", text: "venais", correct: false },
    ],
  },
  {
    id: 8,
    type: "si + présent → impératif",
    mode: "consequence",
    prompt: "Complète la conséquence.",
    sentence: "Si vous avez un problème, ____ au guichet.",
    options: [
      { id: "a", text: "allez", correct: true },
      { id: "b", text: "irez", correct: false },
      { id: "c", text: "alliez", correct: false },
    ],
  },
  {
    id: 9,
    type: "si + présent → présent",
    mode: "consequence",
    prompt: "Complète la conséquence.",
    sentence: "Si nous sommes en retard, le train ____ sans nous.",
    options: [
      { id: "a", text: "part", correct: true },
      { id: "b", text: "partira", correct: false },
      { id: "c", text: "partait", correct: false },
    ],
  },
  {
    id: 10,
    type: "si + présent → impératif",
    mode: "consequence",
    prompt: "Complète la conséquence.",
    sentence: "Si tu as un doute, ____ la question.",
    options: [
      { id: "a", text: "pose", correct: true },
      { id: "b", text: "poses", correct: false },
      { id: "c", text: "poseras", correct: false },
    ],
  },

  // 11–20 : compléter la proposition en SI (présent)
  {
    id: 11,
    type: "si + présent",
    mode: "si",
    prompt: "Complète la proposition avec si.",
    sentence: "Si tu ____ (avoir) besoin, appelle-moi.",
    options: [
      { id: "a", text: "as", correct: true },
      { id: "b", text: "avais", correct: false },
      { id: "c", text: "auras", correct: false },
    ],
  },
  {
    id: 12,
    type: "si + présent",
    mode: "si",
    prompt: "Complète la proposition avec si.",
    sentence: "Si vous ____ (vouloir) réserver, faites-le aujourd'hui.",
    options: [
      { id: "a", text: "voulez", correct: true },
      { id: "b", text: "voudrez", correct: false },
      { id: "c", text: "vouliez", correct: false },
    ],
  },
  {
    id: 13,
    type: "si + présent",
    mode: "si",
    prompt: "Complète la proposition avec si.",
    sentence: "Si on ____ (finir) tôt, on va au café.",
    options: [
      { id: "a", text: "finit", correct: true },
      { id: "b", text: "finira", correct: false },
      { id: "c", text: "finissait", correct: false },
    ],
  },
  {
    id: 14,
    type: "si + présent",
    mode: "si",
    prompt: "Complète la proposition avec si.",
    sentence: "Si tu ____ (être) libre, tu peux passer chez moi.",
    options: [
      { id: "a", text: "es", correct: true },
      { id: "b", text: "étais", correct: false },
      { id: "c", text: "seras", correct: false },
    ],
  },
  {
    id: 15,
    type: "si + présent",
    mode: "si",
    prompt: "Complète la proposition avec si.",
    sentence: "Si elle ____ (pouvoir) venir, on commence à 19h.",
    options: [
      { id: "a", text: "peut", correct: true },
      { id: "b", text: "pourra", correct: false },
      { id: "c", text: "pouvait", correct: false },
    ],
  },
  {
    id: 16,
    type: "si + présent",
    mode: "si",
    prompt: "Complète la proposition avec si.",
    sentence: "Si nous ____ (avoir) le choix, on prend le train.",
    options: [
      { id: "a", text: "avons", correct: true },
      { id: "b", text: "aurons", correct: false },
      { id: "c", text: "avions", correct: false },
    ],
  },
  {
    id: 17,
    type: "si + présent",
    mode: "si",
    prompt: "Complète la proposition avec si.",
    sentence: "Si vous ____ (être) d'accord, on signe.",
    options: [
      { id: "a", text: "êtes", correct: true },
      { id: "b", text: "seriez", correct: false },
      { id: "c", text: "étiez", correct: false },
    ],
  },
  {
    id: 18,
    type: "si + présent",
    mode: "si",
    prompt: "Complète la proposition avec si.",
    sentence: "Si je ____ (faire) une erreur, dis-le-moi.",
    options: [
      { id: "a", text: "fais", correct: true },
      { id: "b", text: "ferai", correct: false },
      { id: "c", text: "faisais", correct: false },
    ],
  },
  {
    id: 19,
    type: "si + présent",
    mode: "si",
    prompt: "Complète la proposition avec si.",
    sentence: "Si tu ____ (voir) Paul, dis-lui bonjour.",
    options: [
      { id: "a", text: "vois", correct: true },
      { id: "b", text: "verras", correct: false },
      { id: "c", text: "voyais", correct: false },
    ],
  },
  {
    id: 20,
    type: "si + présent",
    mode: "si",
    prompt: "Complète la proposition avec si.",
    sentence: "Si on ____ (prendre) ce chemin, on arrive plus vite.",
    options: [
      { id: "a", text: "prend", correct: true },
      { id: "b", text: "prendra", correct: false },
      { id: "c", text: "prenait", correct: false },
    ],
  },
];

const XP_PER_GOOD = 10;

const THEMES = {
  light: {
    pageBg: "linear-gradient(135deg, #eef2ff 0%, #fdf2f8 50%, #ecfeff 100%)",
    text: "#111827",
    muted: "#374151",
    cardBg: "rgba(255, 255, 255, 0.78)",
    cardBorder: "rgba(229, 231, 235, 0.95)",
    shadow: "0 12px 30px rgba(0,0,0,0.10)",
    pillBg: "rgba(255, 255, 255, 0.65)",
    pillBorder: "rgba(229, 231, 235, 0.95)",
    secondaryBg: "rgba(255, 255, 255, 0.80)",
    secondaryText: "#111827",
    barBg: "rgba(229, 231, 235, 0.90)",
    barFill: "#111827",
  },
  dark: {
    pageBg: "linear-gradient(135deg, #0b1220 0%, #111827 40%, #0b1220 100%)",
    text: "#f9fafb",
    muted: "#cbd5e1",
    cardBg: "rgba(17, 24, 39, 0.72)",
    cardBorder: "rgba(148, 163, 184, 0.25)",
    shadow: "0 16px 40px rgba(0,0,0,0.55)",
    pillBg: "rgba(30, 41, 59, 0.70)",
    pillBorder: "rgba(148, 163, 184, 0.25)",
    secondaryBg: "rgba(30, 41, 59, 0.65)",
    secondaryText: "#f9fafb",
    barBg: "rgba(148, 163, 184, 0.25)",
    barFill: "#f9fafb",
  },
};

// -----------------------------
// Self-tests (dev only)
// -----------------------------
function runSelfTests() {
  if (!Array.isArray(QUESTIONS) || QUESTIONS.length !== 20) {
    throw new Error("Self-test failed: QUESTIONS must contain 20 items.");
  }

  const ids = QUESTIONS.map((q) => q.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error("Self-test failed: question ids must be unique.");
  }

  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    if (!q.options || q.options.length < 2) {
      throw new Error("Self-test failed: each question must have options.");
    }
    const correctCount = q.options.filter((o) => Boolean(o.correct)).length;
    if (correctCount !== 1) {
      throw new Error("Self-test failed: each question must have exactly one correct option.");
    }
  }

  // Test du helper de conjugaison
  const line = siConjugationLine("Si vous ____ (vouloir) réserver, ...", "voulez");
  if (line !== "Vouloir au présent : vous voulez") {
    throw new Error("Self-test failed: siConjugationLine output mismatch.");
  }
}

try {
  const mode = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.MODE : "production";
  if (typeof window !== "undefined" && mode !== "production") {
    runSelfTests();
  }
} catch (e) {
  // eslint-disable-next-line no-console
  console.error(e);
}

export default function App() {
  const [theme, setTheme] = useState("light");
  const t = THEMES[theme];

  const [screen, setScreen] = useState("home"); // home | quiz | results
  const [idx, setIdx] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([]);

  // UX: sélection puis bouton "Vérifier"
  const [selectedId, setSelectedId] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Réponses vérifiées
  const [answersById, setAnswersById] = useState({});
  // Sélections non vérifiées (pour conserver la sélection si on va à l'accueil)
  const [draftById, setDraftById] = useState({});

  const [reviewOpen, setReviewOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  const q = quizQuestions[idx];

  const shuffledOptions = useMemo(() => {
    if (!q) return [];
    return shuffle(q.options);
  }, [q ? q.id : 0]);

  const correctOption = useMemo(() => {
    if (!q) return null;
    return q.options.find((o) => o.correct) || null;
  }, [q ? q.id : 0]);

  const correctOptionText = correctOption ? correctOption.text : null;

  const score = useMemo(() => {
    return Object.values(answersById).filter((a) => a.correct).length;
  }, [answersById]);

  const xp = useMemo(() => score * XP_PER_GOOD, [score]);

  function resetGame() {
    setIdx(0);
    setQuizQuestions([]);
    setSelectedId(null);
    setShowFeedback(false);
    setAnswersById({});
    setDraftById({});
    setReviewOpen(false);
    setRulesOpen(false);
    setScreen("home");
  }

  function start() {
    const shuffled = shuffle(QUESTIONS);
    setQuizQuestions(shuffled);
    setIdx(0);
    setSelectedId(null);
    setShowFeedback(false);
    setAnswersById({});
    setDraftById({});
    setReviewOpen(false);
    setRulesOpen(false);
    setScreen("quiz");
  }

  function goHomeFromQuiz() {
    // Revenir à l'accueil sans perdre la progression.
    setScreen("home");
  }

  function resumeQuiz() {
    setScreen("quiz");
    const currentQ = quizQuestions[idx];
    if (!currentQ) return;

    const saved = answersById[currentQ.id];
    if (saved) {
      const optId = currentQ.options.find((o) => o.text === saved.chosen)?.id ?? null;
      setSelectedId(optId);
      setShowFeedback(true);
      return;
    }

    const draft = draftById[currentQ.id];
    setSelectedId(draft ?? null);
    setShowFeedback(false);
  }

  function select(optionId) {
    if (!q) return;
    if (showFeedback) return;

    setSelectedId(optionId);
    setDraftById((prev) => ({ ...prev, [q.id]: optionId }));
  }

  function verify() {
    if (!q) return;
    if (!selectedId) return;

    const chosen = q.options.find((o) => o.id === selectedId);
    if (!chosen) return;

    const isCorrect = Boolean(chosen.correct);

    setAnswersById((prev) => {
      const next = { ...prev };
      next[q.id] = {
        id: q.id,
        type: q.type,
        sentence: q.sentence,
        prompt: q.prompt,
        chosen: chosen.text,
        correct: isCorrect,
      };
      return next;
    });

    // Une fois vérifié, on peut laisser le draft, mais il n'est plus utilisé.
    setShowFeedback(true);
  }

  function loadQuestionState(targetIdx) {
    const target = quizQuestions[targetIdx];
    if (!target) return;

    const saved = answersById[target.id];
    if (saved) {
      const optId = target.options.find((o) => o.text === saved.chosen)?.id ?? null;
      setSelectedId(optId);
      setShowFeedback(true);
      return;
    }

    const draft = draftById[target.id];
    setSelectedId(draft ?? null);
    setShowFeedback(false);
  }

  function next() {
    const last = idx >= quizQuestions.length - 1;
    if (last) {
      setScreen("results");
      return;
    }
    const newIdx = idx + 1;
    setIdx(newIdx);
    loadQuestionState(newIdx);
  }

  function back() {
    if (idx <= 0) return;
    const newIdx = idx - 1;
    setIdx(newIdx);
    loadQuestionState(newIdx);
  }

  const progress = quizQuestions.length ? Math.round(((idx + 1) / quizQuestions.length) * 100) : 0;
  const isLast = quizQuestions.length ? idx >= quizQuestions.length - 1 : false;

  const cardStyle = {
    border: "1px solid " + t.cardBorder,
    borderRadius: 18,
    padding: 20,
    background:
      theme === "dark"
        ? "linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(30,64,175,0.55) 24%, rgba(59,130,246,0.25) 42%, " + t.cardBg + " 65%)"
        : "linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(30,64,175,0.45) 26%, rgba(59,130,246,0.20) 44%, " + t.cardBg + " 65%)",
    boxShadow: t.shadow,
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    // ✅ Option 2: pas de scroll de page, scroll interne si besoin
    maxHeight: "calc(100vh - 220px)",
    overflowY: "auto",
    overscrollBehavior: "contain",
  };

  const btnBase = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid " + t.pillBorder,
    background: theme === "dark" ? "rgba(30, 41, 59, 0.55)" : "rgba(249, 250, 251, 0.9)",
    cursor: "pointer",
    textAlign: "left",
    fontSize: 16,
    fontWeight: 800,
    color: t.text,
  };

  const primary = {
    padding: "14px 36px",
    minWidth: 220,
    borderRadius: 999,
    border: "none",
    background:
      theme === "dark"
        ? "linear-gradient(135deg, #38bdf8 0%, #22c55e 100%)"
        : "linear-gradient(135deg, #6366f1 0%, #22c55e 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 16,
    boxShadow:
      theme === "dark"
        ? "0 8px 24px rgba(56,189,248,0.35)"
        : "0 8px 24px rgba(99,102,241,0.35)",
  };

  const secondary = {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid " + t.pillBorder,
    background: t.secondaryBg,
    color: t.secondaryText,
    cursor: "pointer",
    fontWeight: 900,
  };

  const pill = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: t.pillBg,
    border: "1px solid " + t.pillBorder,
    fontSize: 12,
    color: t.text,
  };

  const feedbackText = useMemo(() => {
    if (!q) return "";

    // Cas 1 : compléter la proposition en SI (conjugaison au présent)
    if (q.mode === "si") {
      return siConjugationLine(q.sentence, correctOptionText) || "Verbe au présent : (conjugaison)";
    }

    // Cas 2 : conséquence à l’impératif
    if (q.type.includes("impératif")) {
      return "Après si + présent, on peut donner un conseil ou une instruction à l’impératif.";
    }

    // Cas 3 : conséquence au présent
    return "Avec si + présent, la conséquence est au présent.";
  }, [q ? q.id : 0, correctOptionText]);

  const verifiedCurrent = q ? Boolean(answersById[q.id]) : false;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          height: "100vh",
          overflow: "hidden",
          background: t.pageBg,
          padding: "28px 14px",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
          color: t.text,
        }}
      >
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          {/* Header + Theme toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: 28 }}>⚡ La condition – Si + présent</h1>
              <p style={{ margin: "6px 0 0", color: t.muted }}>
                Objectif : pratiquer la structure <strong>si + présent</strong> pour exprimer une conséquence au{" "}
                <strong>présent</strong> ou donner une <strong>consigne</strong> (à l’<strong>impératif</strong>).
              </p>
            </div>
            <button
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid " + t.pillBorder,
                background: t.secondaryBg,
                color: t.secondaryText,
                cursor: "pointer",
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
              onClick={() => setTheme((v) => (v === "light" ? "dark" : "light"))}
              title="Changer le thème"
              type="button"
            >
              {theme === "light" ? "🌙 Mode sombre" : "☀️ Mode clair"}
            </button>
          </div>

          {screen === "home" && (
            <div style={cardStyle}>
              <div style={{ marginBottom: 12 }}>
                <h2
                  style={{
                    margin: "0 0 14px",
                    fontSize: 20,
                    fontWeight: 900,
                    letterSpacing: "0.5px",
                    textAlign: "center",
                  }}
                >
                  Règle rapide
                </h2>

                <div style={{ display: "grid", gap: 10 }}>
                  <div
                    style={{
                      background: theme === "dark" ? "rgba(30,41,59,0.55)" : "rgba(249,250,251,0.9)",
                      border: "1px solid " + t.pillBorder,
                      borderRadius: 12,
                      padding: 12,
                      textAlign: "center",
                    }}
                  >
                    <strong>Si + présent</strong> → conséquence au <strong>présent</strong>.
                  </div>
                  <div
                    style={{
                      background: theme === "dark" ? "rgba(30,41,59,0.55)" : "rgba(249,250,251,0.9)",
                      border: "1px solid " + t.pillBorder,
                      borderRadius: 12,
                      padding: 12,
                      textAlign: "center",
                    }}
                  >
                    <strong>Si + présent</strong> → conséquence à l’<strong>impératif</strong>.
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 14, textAlign: "center" }}>
                <h2 style={{ margin: "0 0 10px", fontSize: 18, textAlign: "center" }}>Exemples</h2>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, lineHeight: 1.7 }}>
                  <li style={{ marginBottom: 6 }}>
                    <span style={{ color: "#6366f1", fontWeight: 800 }}>Si</span> je peux lire, je{" "}
                    <strong style={{ color: "#16a34a" }}>vais</strong> à la bibliothèque.
                  </li>
                  <li>
                    <span style={{ color: "#6366f1", fontWeight: 800 }}>Si</span> tu es malade,{" "}
                    <strong style={{ color: "#16a34a" }}>va</strong> à la pharmacie !
                  </li>
                </ul>
              </div>

              <div style={{ display: "flex", justifyContent: "center", marginTop: 10, gap: 10, flexWrap: "wrap" }}>
                <button style={primary} onClick={start} type="button">
                  S’entraîner
                </button>

                {quizQuestions.length > 0 && (
                  <button style={primary} onClick={resumeQuiz} type="button">Reprendre</button>
                )}
              </div>
            </div>
          )}

          {screen === "quiz" && q && (
            <div style={cardStyle}>
              {/* Score / XP / Progress */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <span style={pill}>
                    Question {idx + 1} / {quizQuestions.length}
                  </span>
                  <span style={pill}>Score: {score}</span>
                  <span style={pill}>XP: ⚡ {xp}</span>
                </div>
                <div style={{ minWidth: 220, flex: 1 }}>
                  <div style={{ height: 10, background: t.barBg, borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: progress + "%", height: "100%", background: t.barFill }} />
                  </div>
                  <div style={{ fontSize: 12, color: t.muted, marginTop: 4, textAlign: "right" }}>{progress}%</div>
                </div>
              </div>

              {/* Question */}
              <div key={q.id} style={{ marginBottom: 10, animation: "fadeIn 220ms ease-out" }}>
                {/* Bandeau consigne */}
                <div
                  style={{
                    marginBottom: 10,
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: theme === "dark" ? "rgba(30,41,59,0.65)" : "rgba(243,244,246,0.95)",
                    border: "1px solid " + t.pillBorder,
                    textAlign: "center",
                    fontWeight: 900,
                  }}
                >
                  {q.prompt}
                </div>

                {/* Phrase */}
                <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.35, textAlign: "center" }}>{q.sentence}</div>

                {/* Lien règles */}
                <div style={{ marginTop: 6, textAlign: "center" }}>
                  <button
                    onClick={() => setRulesOpen(true)}
                    style={{ ...secondary, padding: "8px 12px", borderRadius: 999, fontSize: 12, fontWeight: 900 }}
                    type="button"
                  >
                    Revoir les règles
                  </button>
                </div>
              </div>

              {/* Options (sélection seulement) */}
              <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                {shuffledOptions.map((o) => {
                  const picked = selectedId === o.id;
                  const correct = Boolean(o.correct);

                  let bg = theme === "dark" ? "rgba(30,41,59,0.55)" : "rgba(249,250,251,0.9)";
                  let border = t.pillBorder;

                  if (picked && !showFeedback) {
                    bg = theme === "dark" ? "rgba(56,189,248,0.18)" : "rgba(99,102,241,0.12)";
                    border = theme === "dark" ? "rgba(56,189,248,0.55)" : "#6366f1";
                  }

                  if (showFeedback) {
                    if (correct) {
                      bg = "rgba(34,197,94,0.20)";
                      border = theme === "dark" ? "rgba(34,197,94,0.55)" : "#16a34a";
                    } else if (picked && !correct) {
                      bg = "rgba(239,68,68,0.18)";
                      border = theme === "dark" ? "rgba(239,68,68,0.55)" : "#dc2626";
                    }
                  }

                  return (
                    <button
                      key={o.id}
                      onClick={() => select(o.id)}
                      style={{ ...btnBase, background: bg, borderColor: border }}
                      type="button"
                    >
                      {o.text}
                    </button>
                  );
                })}
              </div>

              {/* Bouton Vérifier – apparaît dès qu’une réponse est sélectionnée */}
              {selectedId && !showFeedback && !verifiedCurrent && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
                  <button style={primary} onClick={verify} type="button">
                    Vérifier
                  </button>
                </div>
              )}

              {/* Feedback + navigation */}
              {showFeedback && (
                <div
                  style={{
                    marginTop: 14,
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid " + t.pillBorder,
                    background: answersById[q.id]?.correct
                      ? theme === "dark"
                        ? "rgba(34,197,94,0.25)"
                        : "rgba(34,197,94,0.18)"
                      : theme === "dark"
                      ? "rgba(239,68,68,0.25)"
                      : "rgba(239,68,68,0.18)",
                  }}
                >
                  <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap", justifyContent: "center" }}>
                    <button style={primary} onClick={goHomeFromQuiz} type="button">Accueil</button>
                    <button style={primary} onClick={next} type="button">{isLast ? "Terminer" : "Suivant"}</button>
                  </div>

                  {answersById[q.id]?.correct ? (
                    <div style={{ fontWeight: 900, fontSize: 16, textAlign: "center" }}>Bravo !</div>
                  ) : (
                    <div style={{ fontWeight: 900, fontSize: 16, textAlign: "center" }}>Attention !</div>
                  )}

                  <div style={{ marginTop: 6, color: t.muted, textAlign: "center" }}>
                    <em>{feedbackText}</em>
                  </div>
                </div>
              )}

              {/* Modal règles */}
              {rulesOpen && (
                <div
                  role="dialog"
                  aria-modal="true"
                  onClick={() => setRulesOpen(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 16,
                    zIndex: 50,
                  }}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: "min(720px, 100%)",
                      borderRadius: 18,
                      border: "1px solid " + t.cardBorder,
                      background: t.cardBg,
                      boxShadow: t.shadow,
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      padding: 18,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                      <div style={{ fontWeight: 900, fontSize: 18 }}>Règles</div>
                      <button type="button" onClick={() => setRulesOpen(false)} style={{ ...secondary, padding: "8px 12px" }}>
                        Fermer
                      </button>
                    </div>

                    <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                      <div
                        style={{
                          background: theme === "dark" ? "rgba(30,41,59,0.55)" : "rgba(249,250,251,0.9)",
                          border: "1px solid " + t.pillBorder,
                          borderRadius: 12,
                          padding: 12,
                          textAlign: "center",
                        }}
                      >
                        <strong>Si + présent</strong> → conséquence au <strong>présent</strong>.
                      </div>
                      <div
                        style={{
                          background: theme === "dark" ? "rgba(30,41,59,0.55)" : "rgba(249,250,251,0.9)",
                          border: "1px solid " + t.pillBorder,
                          borderRadius: 12,
                          padding: 12,
                          textAlign: "center",
                        }}
                      >
                        <strong>Si + présent</strong> → conséquence à l’<strong>impératif</strong>.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {screen === "results" && (
            <div style={cardStyle}>
              <h2 style={{ margin: 0, fontSize: 22 }}>🏆 Résultats</h2>
              <p style={{ margin: "8px 0 0", color: t.muted }}>
                Score final : <strong>{score}</strong> / {quizQuestions.length} — XP total : <strong>⚡ {xp}</strong>
              </p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                <button style={primary} onClick={() => setReviewOpen((v) => !v)} type="button">
                  {reviewOpen ? "Fermer la révision" : "Revoir mes réponses"}
                </button>
                <button style={secondary} onClick={resetGame} type="button">
                  🔄 Recommencer
                </button>
              </div>

              {reviewOpen && (
                <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                  {quizQuestions.map((qq, i) => {
                    const a = answersById[qq.id];
                    const correctText = qq.options.find((o) => o.correct)?.text;
                    const isCorrect = Boolean(a?.correct);

                    const bgOk = theme === "dark" ? "rgba(34,197,94,0.14)" : "rgba(34,197,94,0.10)";
                    const bgBad = theme === "dark" ? "rgba(239,68,68,0.18)" : "rgba(239,68,68,0.12)";
                    const borderOk = theme === "dark" ? "rgba(34,197,94,0.55)" : "#16a34a";
                    const borderBad = theme === "dark" ? "rgba(239,68,68,0.55)" : "#dc2626";

                    return (
                      <div
                        key={qq.id}
                        style={{
                          border: "1px solid " + (isCorrect ? borderOk : borderBad),
                          borderRadius: 12,
                          padding: 12,
                          background: isCorrect ? bgOk : bgBad,
                        }}
                      >
                        <div style={{ fontWeight: 900 }}>
                          {i + 1}. <span style={{ color: t.muted, fontWeight: 800 }}>({qq.type})</span>
                        </div>

                        <div style={{ marginTop: 6, fontWeight: 900 }}>{qq.sentence}</div>

                        <div style={{ marginTop: 8, color: t.muted }}>
                          Ta réponse :{" "}
                          <strong style={{ color: isCorrect ? "#16a34a" : "#dc2626" }}>{a?.chosen ?? "—"}</strong>
                        </div>

                        <div style={{ marginTop: 4, color: t.muted }}>
                          Réponse correcte : <strong style={{ color: "#16a34a" }}>{correctText ?? "—"}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 14, textAlign: "center", color: t.muted, fontSize: 12 }}>
            © Felipe VL - Produit Grammaire FLE
          </div>
        </div>
      </div>
    </>
  );
}
