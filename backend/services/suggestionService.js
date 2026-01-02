import { db } from "../firebaseAdmin.js";

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

  if (snap.empty) return 1.0;

  return snap.docs[0].data().penalty ?? 1.0;
}

export async function generateSuggestions({
  householdId,
  currentList,
  associations,
  forgetScores,
  temporal
}) {

  const blockedItems = await getBlockedItems(householdId);

  const currentSet = new Set(
    currentList.map(i => i.toLowerCase())
  );

  const frequent = [];
  const forgotten = [];
  const seasonal = [];

  // associations
  currentList.forEach(rawItem => {
    const item = rawItem.toLowerCase();

    // Forward
    (associations[item] || []).forEach(r => {
      if (!currentSet.has(r.item)) {
        frequent.push({
          item: r.item,
          score: r.confidence,
          reason: `Often bought together with ${item}.`
        });
      }
    });

    // Reverse
    Object.entries(associations).forEach(([lhs, rules]) => {
      rules.forEach(r => {
        if (r.item === item && !currentSet.has(lhs)) {
          frequent.push({
            item: lhs,
            score: r.confidence,
            reason: `Often bought together with ${item}.`
          });
        }
      });
    });
  });

  // forgetfulness
  Object.entries(forgetScores || {}).forEach(([item, meta]) => {
    if (currentSet.has(item)) return;

    if (meta.forgetProbability >= 0.1 && meta.evidenceCount >= 5) {
      forgotten.push({
        item,
        score: meta.forgetProbability,
        reason: `Missed in ${Math.round(
          meta.forgetProbability * 100
        )}% of trips.`
      });
    }
  });

  // temporal
  Object.entries(temporal || {}).forEach(([item, meta]) => {
    if (currentSet.has(item)) return;

    if (meta.confidence >= 0.5) {
      seasonal.push({
        item,
        score: meta.confidence,
        reason: `Usually bought ${meta.pattern.replace(
          "_",
          " "
        )}.`
      });
    }
  });

  // limit helper
  const take = (arr, n) =>
    [...new Map(arr.map(a => [a.item, a])).values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, n);

  const results = [
    ...take(frequent, 2).map(toSuggestion("frequent")),
    ...take(forgotten, 2).map(toSuggestion("forgotten")),
    ...take(seasonal, 1).map(toSuggestion("seasonal"))
  ];

  const filtered = [];

  for (const s of results) {
    const item = s.id.toLowerCase();

    // blocked - remove completely
    if (blockedItems.has(item)) continue;

    // recently rejected - skip
    if (await isRejectedRecently(householdId, item)) continue;

    // Apply penalty
    const penalty = await getFeedbackPenalty(householdId, item);

    filtered.push({
      ...s,
      score: s.score * penalty
    });
  }

  // re-sort after penalties
  filtered.sort((a, b) => b.score - a.score);

  return filtered;
}

// helpers
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
