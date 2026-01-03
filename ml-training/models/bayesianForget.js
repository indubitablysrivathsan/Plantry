export function trainBayesianForget(shoppingEvents, forgottenEvents) {
  const itemSeen = {};
  const forgotten = {};

  shoppingEvents.forEach(e=>{
    e.items.forEach(i=>{
      itemSeen[i]=(itemSeen[i]||0)+1;
    });
  });

  forgottenEvents.forEach(f=>{
    forgotten[f.item]=(forgotten[f.item]||0)+1;
  });

  const scores = {};
  const alpha = 1, beta = 2;

  for (const item in forgotten) {
    const seen = Math.max(itemSeen[item] || 0, forgotten[item]); // exposure guard
    const miss = forgotten[item];

    const prob = (miss + alpha) / (seen + alpha + beta);

    scores[item] = {
      forgetProbability: +Math.min(1, prob).toFixed(3),
      evidenceCount: miss,
      seenCount: seen
    };
  }

  return scores;
}
