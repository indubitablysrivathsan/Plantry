export function trainFPGrowth(shoppingEvents) {
  const tx = shoppingEvents.map(e => [...new Set(e.items)]);
  const total = tx.length;

  const itemCount = {};
  const pairCount = {};

  tx.forEach(items => {
    for (let i = 0; i < items.length; i++) {
      const a = items[i];
      itemCount[a] = (itemCount[a] || 0) + 1;

      for (let j = i + 1; j < items.length; j++) {
        const b = items[j];
        pairCount[a] ??= {};
        pairCount[b] ??= {};
        pairCount[a][b] = (pairCount[a][b] || 0) + 1;
        pairCount[b][a] = (pairCount[b][a] || 0) + 1;
      }
    }
  });

  const rules = {};

  for (const a in pairCount) {
    const freqA = itemCount[a] / total;
    const rareBoost = freqA < 0.08 ? 0.9 : 1.05;

    for (const b in pairCount[a]) {
      const conf = pairCount[a][b] / itemCount[a];
      const supportB = itemCount[b] / total;
      const lift = conf / supportB;

      if (lift >= rareBoost) {
        rules[a] ??= [];
        rules[a].push({
          item: b,
          confidence: +conf.toFixed(3),
          lift: +lift.toFixed(2)
        });
      }
    }
  }

  return rules;
}

