export function generateRandomFact({
  temporal,
  forgetScores
}) {
  const facts = [];

  // Temporal facts
  Object.entries(temporal || {}).forEach(([item, meta]) => {
    if (meta.confidence >= 0.5 && meta.avgGapDays) {
      facts.push({
        type: "temporal",
        text: `You tend to buy ${capitalize(item)} every ${Math.round(
          meta.avgGapDays
        )} days.`
      });
    }
  });

  // Forgetfulness facts
  Object.entries(forgetScores || {}).forEach(([item, meta]) => {
    if (meta.forgetProbability >= 0.3 && meta.evidenceCount >= 5) {
      facts.push({
        type: "forgotten",
        text: `You usually forget ${capitalize(item)}.`
      });
    }
  });

  if (facts.length === 0) return null;

  return facts[Math.floor(Math.random() * facts.length)];
}

function capitalize(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}