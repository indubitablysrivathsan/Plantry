export function trainTemporalPatterns(shoppingEvents) {
  const history = {};

  shoppingEvents.forEach(e=>{
    const d = new Date(e.shoppingDate);
    e.items.forEach(i=>{
      history[i] ??= [];
      history[i].push(d);
    });
  });

  const now = Date.now();
  const temporal = {};

  for (const item in history) {
    const dates = history[item].sort((a,b)=>a-b);
    if (dates.length < 2) continue;

    const gaps = [];
    for (let i=1;i<dates.length;i++){
      gaps.push((dates[i]-dates[i-1])/(1000*60*60*24));
    }

    const avg = gaps.reduce((a,b)=>a+b,0)/gaps.length;
    const last = dates[dates.length-1];
    const daysSince = (now-last)/(1000*60*60*24);

    // urgency sigmoid
    const urgency = 1/(1+Math.exp(-(daysSince-avg)/avg));

    temporal[item] = {
      avgGapDays: Math.round(avg),
      daysSinceLast: Math.round(daysSince),
      urgency: +urgency.toFixed(3)
    };
  }

  return temporal;
}
