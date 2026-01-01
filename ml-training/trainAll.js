import { db } from "./firebaseAdmin.js";
import { fetchTrainingData } from "./fetchData.js";
import { trainFPGrowth } from "./models/fpGrowth.js";
import { trainBayesianForget } from "./models/bayesianForget.js";
import { trainTemporalPatterns } from "./models/temporalPatterns.js";

const HOUSEHOLD_ID = "household_001";

async function trainAll() {
  const { shoppingEvents, forgottenEvents } =
    await fetchTrainingData(HOUSEHOLD_ID);

  
console.log("Shopping events:", shoppingEvents.length);
console.log("Forgotten events:", forgottenEvents.length);

  const associations = trainFPGrowth(shoppingEvents);
  const forgetScores = trainBayesianForget(shoppingEvents, forgottenEvents);
  const temporal = trainTemporalPatterns(shoppingEvents);

  await db.collection("model_outputs_associations")
    .doc(HOUSEHOLD_ID)
    .set({ generatedAt: new Date(), rules: associations });

  await db.collection("model_outputs_forgetfulness")
    .doc(HOUSEHOLD_ID)
    .set({ generatedAt: new Date(), scores: forgetScores });

  await db.collection("model_outputs_temporal")
    .doc(HOUSEHOLD_ID)
    .set({ generatedAt: new Date(), items: temporal });

  console.log("Training completed successfully");
}

trainAll();