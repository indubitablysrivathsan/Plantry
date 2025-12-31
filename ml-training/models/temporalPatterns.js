export function trainTemporalPatterns(shoppingEvents) {
  const history = {};

  shoppingEvents.forEach(e => {
    const date = new Date(e.shoppingDate);
    e.items.forEach(item => {
      history[item] = history[item] || [];
      history[item].push(date);
    });
  });

  const patterns = {};

  for (const item in history) {
    const dates = history[item].sort((a, b) => a - b);
    if (dates.length < 3) continue;

    let gaps = [];
    for (let i = 1; i < dates.length; i++) {
      gaps.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
    }

    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;

    let pattern = "irregular";
    if (avgGap < 10) pattern = "frequent";
    else if (avgGap < 25) pattern = "occasional";
    else if (avgGap < 35) pattern = "monthly";
    else if (avgGap < 65) pattern = "bi_monthly";

    patterns[item] = {
      pattern,
      avgGapDays: Math.round(avgGap),
      confidence: Math.min(1, dates.length / 12)
    };
  }

  return patterns;
}