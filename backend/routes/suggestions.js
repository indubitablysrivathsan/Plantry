import express from "express";
import { db } from "../firebaseAdmin.js";
import { generateSuggestions } from "../services/suggestionService.js";
import { Timestamp } from "firebase-admin/firestore";

const router = express.Router();

router.post("/infer", async (req, res) => {
  try {
    const { householdId, currentList } = req.body;

    if (!householdId || !Array.isArray(currentList)) {
      return res.status(400).json({ suggestions: [] });
    }

//fetch weights
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

//normalize
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

//debugging
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

//suggestions
    const suggestions = await generateSuggestions({
      householdId,
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

router.post("/feedback", async (req, res) => {
  const { item, action, householdId } = req.body;
  const normItem = normalizeItem(item);

  if (!item || !action || !householdId) {
    return res.status(400).json({ ok: false });
  }

  if (action === "reject") {
    await db.collection("suggestion_feedback").add({
      householdId,
      item: normItem,
      action: "reject",
      expiresAt: Timestamp.fromDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ),
      createdAt: new Date()
    });

    return res.json({ ok: true });
  }

  if (action === "block") {
    await db.collection("suggestion_feedback").add({
      householdId,
      item: normItem,
      action: "block",
      createdAt: new Date()
    });

    return res.json({ ok: true });
  }

  if (action === "penalize") {
    const snap = await db
      .collection("suggestion_feedback")
      .where("householdId", "==", householdId)
      .where("item", "==", normItem)
      .where("action", "==", "penalize")
      .limit(1)
      .get();

    const BASE_PENALTY = 0.85;
    const MIN_PENALTY = 0.3;

    if (snap.empty) {
      await db.collection("suggestion_feedback").add({
        householdId,
        item: normItem,
        action: "penalize",
        penalty: BASE_PENALTY,
        createdAt: new Date()
      });
    } else {
      const doc = snap.docs[0];
      const currentPenalty = doc.data().penalty ?? 1.0;

      await doc.ref.update({
        penalty: Math.max(currentPenalty * BASE_PENALTY, MIN_PENALTY),
        updatedAt: new Date()
      });
    }

    return res.json({ ok: true });
  }

  res.status(400).json({ ok: false });
});


function normalizeItem(item) {
  return item.trim().toLowerCase();
}


export default router;