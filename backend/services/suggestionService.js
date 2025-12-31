export function generateSuggestions({
  currentList,
  associations,
  forgetScores,
  temporal
}) {
  const currentSet = new Set(
    currentList.map(i => i.toLowerCase())
  );

  const frequent = [];
  const forgotten = [];
  const seasonal = [];

  /* =========================
     1️⃣ ASSOCIATIONS → FREQUENT
     ========================= */
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

  /* =========================
     2️⃣ FORGETFULNESS → FORGOTTEN
     ========================= */
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

  /* =========================
     3️⃣ TEMPORAL → SEASONAL
     ========================= */
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

  /* =========================
     4️⃣ DEDUP + LIMIT PER BUCKET
     ========================= */
  const take = (arr, n) =>
    [...new Map(arr.map(a => [a.item, a])).values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, n);

  const results = [
    ...take(frequent, 2).map(toSuggestion("frequent")),
    ...take(forgotten, 2).map(toSuggestion("forgotten")),
    ...take(seasonal, 1).map(toSuggestion("seasonal"))
  ];

  return results;
}

/* =========================
   Helpers
   ========================= */

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