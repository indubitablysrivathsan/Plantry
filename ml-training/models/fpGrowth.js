export function trainFPGrowth(shoppingEvents, minSupport = 0.05, minConfidence = 0.35) {
  const transactions = shoppingEvents.map(e =>
    [...new Set(e.items)]
  );

  const itemCount = {};
  const pairCount = {};
  const totalTx = transactions.length;

  // Count items and pairs
  transactions.forEach(items => {
    items.forEach(a => {
      itemCount[a] = (itemCount[a] || 0) + 1;
      items.forEach(b => {
        if (a !== b) {
          pairCount[a] ??= {};
          pairCount[a][b] = (pairCount[a][b] || 0) + 1;
        }
      });
    });
  });

  const associations = {};
  for (const a in pairCount) {
    for (const b in pairCount[a]) {
      const support = pairCount[a][b] / totalTx;
      const confidence = pairCount[a][b] / itemCount[a];

      if (support >= minSupport && confidence >= minConfidence) {
        associations[a] ??= [];
        associations[a].push({
          item: b,
          support: Number(support.toFixed(3)),
          confidence: Number(confidence.toFixed(3))
        });
      }
    }
  }

  return associations;
}