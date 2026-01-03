import express from "express";
import { db } from "../firebaseAdmin.js";

const router = express.Router();

router.post("/complete", async (req, res) => {
  try {
    const { householdId, items, totalAmount } = req.body;

    if (!householdId || !Array.isArray(items)) {
      return res.status(400).json({ ok: false });
    }

    const normalizedItems = items.map(i =>
      typeof i === "string" ? i : i.name.toLowerCase()
    );

    await db.collection("shopping_events").add({
      householdId,
      items: normalizedItems,
      shoppingDate: new Date(),
      shoppingSource: "manual",
      createdAt: new Date()
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Shopping event write failed:", err);
    res.status(500).json({ ok: false });
  }
});

export default router;
