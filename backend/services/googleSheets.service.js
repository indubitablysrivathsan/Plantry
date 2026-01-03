import { google } from "googleapis";
import path from "path";

const credentialsPath = path.resolve(
  process.cwd(),
  "credentials",
  "sheets-service-account.json"
);

const auth = new google.auth.GoogleAuth({
  keyFile: credentialsPath,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = "1X1MlN-zuZil2OMpA-Y37_FtcSsHPnveodiNqTRorcQo";

/* =========================
   SHOPPING RHYTHM (WORKING)
   ========================= */
export async function writeShoppingRhythmToSheet(rows) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: "shopping_rhythm!A1",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        ["household_id", "shopping_date", "event_count", "total_items", "online_used"],
        ...rows.map(r => [
          r.household_id,
          r.shopping_date,
          r.event_count,
          r.total_items,
          r.online_used
        ])
      ]
    }
  });
}

/* =========================
   ITEM PURCHASE FREQUENCY
   ========================= */
export async function writeItemPurchaseFrequencyToSheet(rows) {
  if (!rows || rows.length === 0) return;

  const spreadsheetId = "1X1MlN-zuZil2OMpA-Y37_FtcSsHPnveodiNqTRorcQo";

  // Clear only once (full rebuild)
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "item_purchase_frequency!A2:D"
  });

  const values = rows.map(r => [
    r.household_id,
    r.item,
    r.shopping_date,
    r.count
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "item_purchase_frequency!A:D",
    valueInputOption: "RAW",
    requestBody: { values }
  });

  console.log("Item purchase frequency sheet rebuilt");
}
