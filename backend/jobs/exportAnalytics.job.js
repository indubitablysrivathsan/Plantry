import { exportItemFrequency } from "./exportItemFrequency.job.js";
import { exportShoppingRhythm } from "./exportShoppingRhythm.job.js";

export async function exportAnalytics() {
  console.log(">>> exportAnalytics CALLED");

  await exportShoppingRhythm();
  await exportItemFrequency();

  console.log(">>> exportAnalytics FINISHED");
}
