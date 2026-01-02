import * as functions from "firebase-functions";
import admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const cleanupExpiredRejectsJob = functions.pubsub
  .schedule("every 24 hours")  // you can use cron too, e.g., "0 3 * * *"
  .timeZone("UTC")
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();

    const q = db.collection("userActions")
      .where("action", "==", "reject")
      .where("expiresAt", "<", now);

    const snapshot = await q.get();

    if (snapshot.empty) return null;

    const batch = db.batch();
    snapshot.forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();

    console.log(`Deleted ${snapshot.size} expired rejects`);
    return null;
  });
