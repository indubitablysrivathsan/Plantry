import express from "express";
import { db } from "../firebaseAdmin.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  const { householdId, shoppingEventId, items } = req.body;

  if (
    !householdId ||
    !shoppingEventId ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({ success: false });
  }

  const batch = db.batch();
  const now = new Date();

  items.forEach(rawItem => {
    const item = rawItem.toLowerCase().trim();
    if (!item) return;

    const docId = `${shoppingEventId}:${item}`;
    const ref = db.collection("forgotten_events").doc(docId);

    batch.set(
      ref,
      {
        householdId,
        shoppingEventId,
        item,
        eventDate: now,
        boughtLater: true,
        reason: "forgot_to_add",
        updatedAt: now,
        createdAt: now
      },
      { merge: true } // 👈 IMPORTANT
    );
  });

  await batch.commit();
  res.json({ success: true });
});

export default router;