import { db } from "../firebaseAdmin.js";

/* =========================
   SEASONAL PRIORS
   ========================= */

const SEASONAL_PRIORS = {
  summer: {
    mango: 0.45,
    watermelon: 0.4,
    muskmelon: 0.38,
    "ice apple (nungu)": 0.42,
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
   FEEDBACK QUERIES
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

  const frequent = [];
  const forgotten = [];
  const seasonalTemporal = [];
  const seasonalManual = [];

  /* =========================
     1. ASSOCIATIONS
     ========================= */
  currentList.forEach(raw => {
    const base = raw.toLowerCase();
    (associations[base] || []).forEach(r => {
      if (currentSet.has(r.item)) return;
      frequent.push({
        item: r.item,
        score: r.confidence,
        reason: `Often bought together with ${base}.`
      });
    });
  });

  /* =========================
     2. FORGETFULNESS (FIXED)
     ========================= */
  Object.entries(forgetScores || {}).forEach(([item, meta]) => {
    if (currentSet.has(item)) return;
    if (meta.evidenceCount < 5) return;

    if (
      meta.forgetProbability >= 0.12 &&
      meta.forgetProbability <= 0.45
    ) {
      forgotten.push({
        item,
        score: meta.forgetProbability,
        reason: `Missed in ${Math.round(
          meta.forgetProbability * 100
        )}% of trips.`
      });
    }
  });

  /* =========================
     3. TEMPORAL → RUN-OUT
     ========================= */
  Object.entries(temporal || {}).forEach(([item, meta]) => {
    if (currentSet.has(item)) return;
    if (meta.confidence < 0.5) return;

    seasonalTemporal.push({
      item,
      score: meta.confidence,
      reason: "You’re likely about to run out."
    });
  });

  /* =========================
     4. MANUAL SEASONAL PRIORS
     ========================= */
  const season = getSeason();
  const priors = SEASONAL_PRIORS[season] || {};

  Object.entries(priors).forEach(([item, score]) => {
    const norm = item.toLowerCase();
    if (currentSet.has(norm)) return;

    seasonalManual.push({
      item: norm,
      score,
      reason: "Commonly bought during this season."
    });
  });

  /* =========================
     5. TAKE PER BUCKET
     ========================= */
  const take = (arr, n) =>
    [...new Map(arr.map(a => [a.item, a])).values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, n);

  const combined = [
    ...take(frequent, 2).map(toSuggestion("frequent")),
    ...take(forgotten, 2).map(toSuggestion("forgotten")),
    ...take(seasonalTemporal, 1).map(toSuggestion("seasonal")),
    ...take(seasonalManual, 1).map(toSuggestion("seasonal"))
  ];

  /* =========================
     6. FEEDBACK FILTER
     ========================= */
  const final = [];
  for (const s of combined) {
    const item = s.id.toLowerCase();
    if (blockedItems.has(item)) continue;
    if (await isRejectedRecently(householdId, item)) continue;

    const penalty = await getFeedbackPenalty(householdId, item);
    final.push({ ...s, score: s.score * penalty });
  }

  return final.sort((a, b) => b.score - a.score);
}

/* =========================
   HELPERS
   ========================= */

//helpers

function toSuggestion(type) {
  return s => ({
    id: s.item,
    name: capitalize(s.item),
    type,
    confidence:
      s.score >= 0.6
        ? "high"
        : s.score >= 0.4
        ? "medium"
        : "low",
    score: s.score,
    reason: s.reason
  });
}

function capitalize(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}