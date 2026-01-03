import express from "express";
import cors from "cors";

import suggestionsRouter from "./routes/suggestions.js";
import insightsRouter from "./routes/insights.js";
import parseItemsRouter from "./routes/parseItems.js";
import shoppingEventsRouter from "./routes/shoppingEvents.js";
import activityRouter from "./routes/activity.js";
import forgottenRouter from "./routes/forgotten.js";

import { generateShoppingRhythmAnalytics } from "./services/shoppingRhythmExport.service.js";
import { generateItemFrequency } from "./services/itemFrequencyExport.service.js";

import {
  writeShoppingRhythmToSheet,
  writeItemPurchaseFrequencyToSheet
} from "./services/googleSheets.service.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/suggestions", suggestionsRouter);
app.use("/api/insights", insightsRouter);
app.use("/api/items", parseItemsRouter);
app.use("/api/shopping", shoppingEventsRouter);
app.use("/api/activity", activityRouter);
app.use("/api/forgotten", forgottenRouter);

app.get("/", (_, res) => {
  res.send("Plantry backend running");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

/* ===============================
   ANALYTICS EXPORTS (ON STARTUP)
   =============================== */
// (async () => {
//   const rhythm = await generateShoppingRhythmAnalytics();
//   await writeShoppingRhythmToSheet(rhythm);

//   const itemFreq = await generateItemFrequency("household_001");
//   await writeItemPurchaseFrequencyToSheet(itemFreq);

//   console.log("All analytics exported to Google Sheets");
// })();
