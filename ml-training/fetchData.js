import { db } from "./firebaseAdmin.js";

export async function fetchTrainingData(householdId) {
  const shoppingSnap = await db
    .collection("shopping_events")
    .where("householdId", "==", householdId)
    .get();

  const forgottenSnap = await db
    .collection("forgotten_events")
    .where("householdId", "==", householdId)
    .get();

  const shoppingEvents = shoppingSnap.docs.map(d => d.data());
  const forgottenEvents = forgottenSnap.docs.map(d => d.data());

  return { shoppingEvents, forgottenEvents };
}