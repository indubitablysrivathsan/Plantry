import express from "express";
import { db } from "../firebaseAdmin.js";
import { generateSuggestions } from "../services/suggestionService.js";

const router = express.Router();

router.post("/infer", async (req, res) => {
  try {
    const { householdId, currentList } = req.body;

    if (!householdId || !Array.isArray(currentList)) {
      return res.status(400).json({ suggestions: [] });
    }

    /* =========================
       Fetch model outputs
       ========================= */
    const assocSnap = await db
      .collection("model_outputs_associations")
      .doc(householdId)
      .get();

    const forgetSnap = await db
      .collection("model_outputs_forgetfulness")
      .doc(householdId)
      .get();

    const temporalSnap = await db
      .collection("model_outputs_temporal")
      .doc(householdId)
      .get();

    if (!assocSnap.exists && !forgetSnap.exists && !temporalSnap.exists) {
      return res.json({ suggestions: [] });
    }

    /* =========================
       Normalize data
       ========================= */
    const associationsRaw = assocSnap.exists
      ? assocSnap.data().rules
      : {};

    const forgetScores = forgetSnap.exists
      ? forgetSnap.data().scores
      : {};

    const temporal = temporalSnap.exists
      ? temporalSnap.data().items
      : {};

    // Normalize association keys to lowercase
    const associations = {};
    Object.entries(associationsRaw).forEach(([k, v]) => {
      associations[k.toLowerCase()] = v.map(r => ({
        ...r,
        item: r.item.toLowerCase()
      }));
    });

    /* =========================
       DEBUG (optional)
       ========================= */
    console.log("=== DEBUG: FIRESTORE DATA ===");
    console.log("Current list from UI:", currentList);
    console.log("Association keys:", Object.keys(associations));
    console.log(
      "Sample association entry:",
      Object.entries(associations)[0]
    );
    console.log(
      "Sample forget score:",
      Object.entries(forgetScores)[0]
    );
    console.log(
      "Sample temporal entry:",
      Object.entries(temporal)[0]
    );

    /* =========================
       Generate suggestions
       ========================= */
    const suggestions = generateSuggestions({
      currentList,
      associations,
      forgetScores,
      temporal
    });

    res.json({ suggestions });
  } catch (err) {
    console.error("Suggestion inference error:", err);
    res.status(500).json({ suggestions: [] });
  }
});

export default router;
