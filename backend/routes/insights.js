import express from "express";
import { db } from "../firebaseAdmin.js";
import { generateRandomFact } from "../services/factService.js";


const router = express.Router();

router.get("/household", async (req, res) => {
  try {
    const { householdId } = req.query;
    if (!householdId) {
      return res.status(400).json({ error: "householdId required" });
    }

    /* =========================
       1. Shopping Rhythm
       ========================= */
    const temporalSnap = await db
      .collection("model_outputs_temporal")
      .doc(householdId)
      .get();

    let rhythm = null;

    if (temporalSnap.exists) {
      // pick the strongest confident item pattern as household rhythm proxy
      const items = Object.values(temporalSnap.data().items || {});
      const strongest = items.sort((a, b) => b.confidence - a.confidence)[0];

      if (strongest) {
        rhythm = {
          avgDaysBetweenTrips: Math.round(strongest.avgGapDays),
          preferredDay: strongest.pattern
            ? strongest.pattern.replace("_", " ")
            : null,
          preferredTime: "Evening"
        };
      }
    }

    /* =========================
       2. Frequently Forgotten
       ========================= */
    const forgetSnap = await db
      .collection("model_outputs_forgetfulness")
      .doc(householdId)
      .get();

    const forgotten = forgetSnap.exists
      ? Object.entries(forgetSnap.data().scores || {})
          .map(([item, meta]) => ({
            name: capitalize(item),
            percent: Math.round(meta.forgetProbability * 100),
            evidence: meta.evidenceCount
          }))
          .filter(f => f.evidence >= 5)
          .sort((a, b) => b.percent - a.percent)
          .slice(0, 3)
      : [];

    /* =========================
       3. Smart Pairs
       ========================= */
    const assocSnap = await db
      .collection("model_outputs_associations")
      .doc(householdId)
      .get();

    const pairs = [];

    if (assocSnap.exists) {
      Object.entries(assocSnap.data().rules || {}).forEach(
        ([lhs, rules]) => {
          rules.forEach(r => {
            if (r.confidence >= 0.6) {
              pairs.push([
                capitalize(lhs),
                capitalize(r.item)
              ]);
            }
          });
        }
      );
    }

    res.json({
      rhythm,
      forgotten,
      pairs: pairs.slice(0, 5).reverse()
    });

  } catch (err) {
    console.error("Insights error:", err);
    res.status(500).json({ error: "Failed to load insights" });
  }
});

//facts
router.get("/fact", async (req, res) => {
  const { householdId } = req.query;

  if (!householdId) {
    return res.json({ fact: null });
  }

  const temporalSnap = await db
    .collection("model_outputs_temporal")
    .doc(householdId)
    .get();

  const forgetSnap = await db
    .collection("model_outputs_forgetfulness")
    .doc(householdId)
    .get();

  const temporal = temporalSnap.exists
    ? temporalSnap.data().items
    : {};

  const forgetScores = forgetSnap.exists
    ? forgetSnap.data().scores
    : {};

  const fact = generateRandomFact({
    temporal,
    forgetScores
  });

  res.json({ fact });
});


function capitalize(str) {
  return String(str).replace(/\b\w/g, c => c.toUpperCase());
}

export default router;