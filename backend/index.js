import express from "express";
import cors from "cors";
import suggestionsRouter from "./routes/suggestions.js";
import insightsRouter from "./routes/insights.js";
import parseItemsRouter from "./routes/parseItems.js";
import shoppingEventsRouter from "./routes/shoppingEvents.js";
import activityRouter from "./routes/activity.js";
import forgottenRouter from "./routes/forgotten.js";

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

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});