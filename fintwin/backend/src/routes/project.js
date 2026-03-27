import { Router } from 'express';
import { percentile } from '../engine/monteCarlo.js';

const router = Router();

function forecaster(portfolioAmount, equityPct, debtPct, goldPct, cryptoPct = 0) {
  const years = 20;
  const iterations = 5000;
  
  const mean = (equityPct * 0.12) + (debtPct * 0.07) + (goldPct * 0.085) + (cryptoPct * 0.60);
  const variance = Math.pow(equityPct * 0.18, 2) + Math.pow(debtPct * 0.03, 2) + Math.pow(goldPct * 0.12, 2) + Math.pow(cryptoPct * 0.60, 2);
  const std = Math.sqrt(variance);
  
  const resultsByYear = Array.from({ length: years }, () => new Float64Array(iterations));

  for (let i = 0; i < iterations; i++) {
    let wealth = portfolioAmount;
    for (let y = 0; y < years; y++) {
      let u1 = Math.random(); while(u1 === 0) u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const annualReturn = mean + std * z;
      
      wealth = wealth * (1 + annualReturn);
      resultsByYear[y][i] = Math.max(wealth, 0);
    }
  }

  const p10 = new Array(years);
  const p50 = new Array(years);
  const p90 = new Array(years);
  const yearLabels = new Array(years);

  for (let y = 0; y < years; y++) {
    yearLabels[y] = y + 1;
    const yearData = resultsByYear[y];
    yearData.sort();
    p10[y] = percentile(yearData, 0.10);
    p50[y] = percentile(yearData, 0.50);
    p90[y] = percentile(yearData, 0.90);
  }

  return { p10, p50, p90, years: yearLabels, rawData: resultsByYear };
}

function getPcts(portfolio) {
  const total = portfolio.reduce((s, i) => s + i.currentValue, 0);
  if (total === 0) return { e:0, d:0, g:0, c:0 };
  let e=0, d=0, g=0, c=0;
  portfolio.forEach(i => {
    const w = i.currentValue / total;
    if (i.type === 'Equity') e += w;
    else if (i.type === 'Debt') d += w;
    else if (i.type === 'Gold') g += w;
    else if (i.type === 'Crypto') c += w;
  });
  return { e, d, g, c, total };
}

function prob(rawYearData, target) {
  let count = 0;
  for (let i=0; i < rawYearData.length; i++) {
    if (rawYearData[i] >= target) count++;
  }
  return (count / rawYearData.length) * 100;
}

router.post('/', async (req, res, next) => {
  try {
    const { currentPortfolio, rebalancedPortfolio } = req.body;
    
    const curr = getPcts(currentPortfolio);
    const reb = getPcts(rebalancedPortfolio);

    const currentReq = forecaster(curr.total, curr.e, curr.d, curr.g, curr.c);
    const rebalancedReq = forecaster(reb.total, reb.e, reb.d, reb.g, reb.c);

    const milestones = [
      { label: '₹50 Lakhs', targetValue: 5000000, probCurrent: prob(currentReq.rawData[4], 5000000), probRebalanced: prob(rebalancedReq.rawData[4], 5000000) },
      { label: '₹1 Crore', targetValue: 10000000, probCurrent: prob(currentReq.rawData[7], 10000000), probRebalanced: prob(rebalancedReq.rawData[7], 10000000) },
      { label: '₹2 Crores', targetValue: 20000000, probCurrent: prob(currentReq.rawData[12], 20000000), probRebalanced: prob(rebalancedReq.rawData[12], 20000000) },
      { label: '₹5 Crores', targetValue: 50000000, probCurrent: prob(currentReq.rawData[17], 50000000), probRebalanced: prob(rebalancedReq.rawData[17], 50000000) }
    ];

    delete currentReq.rawData;
    delete rebalancedReq.rawData;

    res.json({
      current: currentReq,
      rebalanced: rebalancedReq,
      milestones
    });

  } catch (error) {
    next(error);
  }
});

export default router;
