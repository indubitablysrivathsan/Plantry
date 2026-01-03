import admin from "firebase-admin";

const db = admin.firestore();

/**
 * Normalize shoppingDate into YYYY-MM-DD
 */
function normalizeDate(shoppingDate) {
  // Firestore Timestamp
  if (shoppingDate?.toDate) {
    return shoppingDate.toDate().toISOString().split("T")[0];
  }

  // JS Date object
  if (shoppingDate instanceof Date) {
    return shoppingDate.toISOString().split("T")[0];
  }

  // ISO string
  if (typeof shoppingDate === "string") {
    return shoppingDate.split("T")[0];
  }

  throw new Error("Invalid shoppingDate format");
}

/**
 * Fetch shopping events from Firestore
 */
async function fetchShoppingEvents() {
  const snapshot = await db
    .collection("shopping_events")
    .get();

  return snapshot.docs.map(doc => doc.data());
}

/**
 * Generate shopping rhythm analytics
 */
function generateShoppingRhythm(events) {
  const rows = [];

  // ✅ SORT EVENTS BY DATE (CRITICAL)
  events.sort((a, b) => {
    const da = new Date(normalizeDate(a.shoppingDate));
    const db = new Date(normalizeDate(b.shoppingDate));
    return da - db;
  });

  let previousDate = null;

  for (const event of events) {
    const dateStr = normalizeDate(event.shoppingDate);
    const currentDate = new Date(dateStr);

    const total_items = Array.isArray(event.items)
      ? event.items.length
      : 0;

    const source =
      event.shoppingSource === "online_grocery_app"
        ? "online"
        : "offline";

    let days_gap = null;

    if (previousDate) {
      const diffMs = currentDate - previousDate;
      days_gap = diffMs / (1000 * 60 * 60 * 24);
    }

    rows.push({
      date: dateStr,
      total_items,
      source,
      days_gap
    });

    previousDate = currentDate;
  }

  return rows;
}

/**
 * Main export function
 */
export async function generateShoppingRhythmAnalytics() {
  const events = await fetchShoppingEvents();
  return generateShoppingRhythm(events);
}
