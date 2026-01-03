export function trainBayesianForget(shoppingEvents, forgottenEvents) {
  const totalEvents = shoppingEvents.length;
  const stats = {};

  forgottenEvents.forEach(f => {
    stats[f.item] ??= { forgotten: 0 };
    stats[f.item].forgotten++;
  });

  const alpha = 1;
  const beta = 1;
  const scores = {};

  for (const item in stats) {
    const forgotten = stats[item].forgotten;

    const prob =
      (forgotten + alpha) /
      (totalEvents + alpha + beta);

    scores[item] = {
      forgetProbability: Number(prob.toFixed(3)),
      evidenceCount: forgotten
    };
  }

  return scores;
}