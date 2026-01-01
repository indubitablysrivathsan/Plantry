import { db } from "./firebaseAdmin.js";

const HOUSEHOLD_ID = "household_001";

// Simulate user input
const inputList = ["Vermicelli", "ragi"];

async function testInference() {
  // Fetch model outputs
  const assocSnap = await db
    .collection("model_outputs_associations")
    .doc(HOUSEHOLD_ID)
    .get();

  const forgetSnap = await db
    .collection("model_outputs_forgetfulness")
    .doc(HOUSEHOLD_ID)
    .get();

  if (!assocSnap.exists || !forgetSnap.exists) {
    throw new Error("Model outputs not found");
  }

  const associations = assocSnap.data().rules;
  const forgetScores = forgetSnap.data().scores;

  const candidateScores = {};

  inputList.forEach(item => {
    const related = associations[item] || [];

    related.forEach(r => {
      const forgetBoost = forgetScores[r.item]?.forgetProbability || 0;

      candidateScores[r.item] =
        (candidateScores[r.item] || 0) +
        0.6 * r.confidence +
        0.4 * forgetBoost;
    });
  });

  // Remove items already in list
  inputList.forEach(i => delete candidateScores[i]);

  // Sort suggestions
  const suggestions = Object.entries(candidateScores)
    .map(([item, score]) => ({ item, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  console.log("Input list:", inputList);
  console.log("Suggestions:");
  suggestions.forEach(s =>
    console.log(`- ${s.item} (score: ${s.score.toFixed(3)})`)
  );
}

testInference();
