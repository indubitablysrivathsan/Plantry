import admin from "firebase-admin";

const db = admin.firestore();

/**
 * Generate item purchase frequency per day
 * (AGGREGATED, not per-event)
 */
export async function generateItemFrequency(householdId) {
  if (!householdId) {
    throw new Error("householdId is required");
  }

  const snapshot = await db
    .collection("shopping_events")
    .where("householdId", "==", householdId)
    .get();

  // key = item|date
  const frequencyMap = new Map();

  snapshot.docs.forEach(doc => {
    const event = doc.data();

    const date =
      event.shoppingDate?.toDate
        ? event.shoppingDate.toDate().toISOString().split("T")[0]
        : new Date(event.shoppingDate).toISOString().split("T")[0];

    for (const item of event.items) {
      const key = `${item}|${date}`;

      if (!frequencyMap.has(key)) {
        frequencyMap.set(key, {
          household_id: householdId,
          item,
          shopping_date: date,
          count: 0
        });
      }

      frequencyMap.get(key).count += 1;
    }
  });

  return Array.from(frequencyMap.values());
}
