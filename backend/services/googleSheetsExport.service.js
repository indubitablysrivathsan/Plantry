import { google } from "googleapis";
import path from "path";

const auth = new google.auth.GoogleAuth({
  keyFile: path.resolve(
    process.cwd(),
    "credentials",
    "sheets-service-account.json"
  ),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = "1X1MlN-zuZil2OMpA-Y37_FtcSsHPnveodiNqTRorcQo";
const RANGE = "shopping_rhythm!A2:D";

/**
 * Write shopping rhythm data to Google Sheets
 */
export async function writeShoppingRhythmToSheet(rows) {
  const values = rows.map(r => [
    r.date,
    r.total_items,
    r.source,
    r.days_gap
  ]);

  // Clear old data
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE
  });

  // Write new data
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
    valueInputOption: "RAW",
    requestBody: {
      values
    }
  });
}
