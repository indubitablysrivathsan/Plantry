import { db } from "../firebaseAdmin.js";

/* =========================
   SEASONAL PRIORS
   ========================= */

const SEASONAL_PRIORS = {
  summer: {
    mango: 0.45,
    watermelon: 0.4,
    muskmelon: 0.38,
    "ice apple (nungu)": 0.42,      // nungu
    kokum: 0.35,
    buttermilk: 0.32,
    cucumber: 0.28
  },
  winter: {
    jaggery: 0.4,
    "sesame seeds": 0.38,
    peanuts: 0.35,
    dates: 0.32,
    "dry ginger": 0.3,
    ghee: 0.28
  },
  monsoon: {
    ginger: 0.38,
    corn: 0.4,
    "pakoda mix": 0.35,
    "green chilli": 0.32,
    lemon: 0.3,
    "tea leaves": 0.28
  }

};

function getSeason() {
  const m = new Date().getMonth() + 1;
  if (m <= 2 || m >= 11) return "winter";
  if (m <= 6) return "summer";
  return "monsoon";
}

/* =========================
   FEEDBACK QUERIES (unchanged)
   ========================= */

async function getBlockedItems(householdId) {
  const snap = await db
    .collection("suggestion_feedback")
    .where("householdId", "==", householdId)
    .where("action", "==", "block")
    .get();
  return new Set(snap.docs.map(d => d.data().item));
}

async function isRejectedRecently(householdId, item) {
  const now = new Date();
  const snap = await db
    .collection("suggestion_feedback")
    .where("householdId", "==", householdId)
    .where("item", "==", item)
    .where("action", "==", "reject")
    .where("expiresAt", ">", now)
    .limit(1)
    .get();
  return !snap.empty;
}

async function getFeedbackPenalty(householdId, item) {
  const snap = await db
    .collection("suggestion_feedback")
    .where("householdId", "==", householdId)
    .where("item", "==", item)
    .where("action", "==", "penalize")
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();
  return snap.empty ? 1.0 : snap.docs[0].data().penalty ?? 1.0;
}

/* =========================
   SUGGESTION ENGINE
   ========================= */

export async function generateSuggestions({
  householdId,
  currentList,
  associations,
  forgetScores,
  temporal
}) {

  const blockedItems = await getBlockedItems(householdId);
  const currentSet = new Set(currentList.map(i => i.toLowerCase()));

  const scores = {};
  const meta = {};

  /* ---------- FUSED SCORING ---------- */
  currentList.forEach(raw => {
    const baseItem = raw.toLowerCase();

    (associations[baseItem] || []).forEach(r => {
      if (currentSet.has(r.item)) return;

      const forget = forgetScores[r.item]?.forgetProbability || 0;
      const temp = temporal[r.item] || {};
      const urgency = temp.urgency || 0;
      const daysSince = temp.daysSinceLast || 0;

      const decay = Math.exp(-daysSince / 180);

      const score =
        (0.55 * r.confidence) +
        (0.30 * forget) +
        (0.15 * urgency);

      const finalScore = score * decay;

      scores[r.item] = (scores[r.item] || 0) + finalScore;

      meta[r.item] = {
        association: r.confidence,
        forget,
        urgency
      };
    });
  });

  /* ---------- SEASONAL PRIORS (ONCE) ---------- */
  const season = getSeason();
  const priors = SEASONAL_PRIORS[season] || {};
  const randomPriors = Object.entries(priors)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);


  randomPriors.forEach(([item, prior]) => {
    if (currentSet.has(item)) return;

    scores[item] = Math.max(scores[item] || 0, prior);
    meta[item] = { ...(meta[item] || {}), seasonal: true };
  });

  /* ---------- RANKING ---------- */
  const ranked = Object.entries(scores)
    .map(([item, score]) => ({ item, score, meta: meta[item] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 7);

  /* ---------- FINAL + FEEDBACK FILTER ---------- */
  const final = [];
  for (const r of ranked) {
    const item = r.item;

    if (blockedItems.has(item)) continue;
    if (await isRejectedRecently(householdId, item)) continue;

    const penalty = await getFeedbackPenalty(householdId, item);

    final.push({
      id: item,
      name: capitalize(item),
      score: r.score * penalty,
      confidence: r.score >= 0.6 ? "high" : r.score >= 0.4 ? "medium" : "low",
      type: r.meta?.seasonal
      ? "seasonal"
      : r.meta?.forget > 0.3
      ? "forgotten"
      : "frequent",
      reason: buildReason(r.meta)
    });
  }

  return final.sort((a, b) => b.score - a.score);
}

/* =========================
   EXPLAINABILITY
   ========================= */

function buildReason(meta = {}) {
  const forgetPct =
    typeof meta.forget === "number"
      ? Math.round(meta.forget * 100)
      : null;

  // Seasonal prior only (no behavioral evidence yet)
  if (meta.seasonal) {
    return "Commonly bought during this season.";
  }

  // Strong association + forgetfulness
  if (meta.association && forgetPct !== null && forgetPct >= 10 && forgetPct <= 40) {
    return `Often bought together and missed in ${forgetPct}% of trips.`;
  }
  else if (meta.association && forgetPct > 40) {
    return `Often bought together and frequently missed when usually needed.`;
  }

  // Pure forgetfulness
  if (forgetPct >= 10 && forgetPct <= 40) {
    return `Missed in ${forgetPct}% of trips.`;
  }
  else if (forgetPct > 40) {
    return `Frequently missed when usually needed.`;
  }

  // Pure association
  if (meta.association) {
    return `Often bought with items in your list.`;
  }

  return `Based on your household’s buying patterns.`;
}

//helper

function capitalize(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}