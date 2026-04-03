import { Router } from 'express';
import { runMonteCarlo } from '../engine/monteCarlo.js';
import { getScenarioDelta } from '../engine/scenarioDeltas.js';

const router = Router();

// ── Standalone Box-Muller for new Monte Carlo ──────────────────────────────
function boxMullerRandom() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// ── New Monte Carlo supporting full scenario objects ───────────────────────
function runNewMonteCarlo(params) {
  const {
    initialPortfolio,
    monthlyContribution,
    annualReturnRate,
    inflationRate,
    volatility,
    years,
    simulations = 1000,
    majorExpenses = [],
    withdrawalStartYear = null,
    withdrawalAmount = 0,
  } = params;

  const months = years * 12;
  const monthlyReturn = annualReturnRate / 12;
  const monthlyVolatility = volatility / Math.sqrt(12);
  const monthlyInflation = inflationRate / 12;

  const results = [];

  for (let sim = 0; sim < simulations; sim++) {
    let portfolio = initialPortfolio;
    const trajectory = [portfolio];

    for (let m = 1; m <= months; m++) {
      const shock = boxMullerRandom();
      const monthReturn = monthlyReturn + monthlyVolatility * shock;
      portfolio *= (1 + monthReturn);

      // Add monthly contribution (inflation-adjusted)
      portfolio += monthlyContribution * Math.pow(1 + monthlyInflation, m / 12);

      // Major expense at this year
      const yearNum = Math.floor(m / 12);
      majorExpenses.forEach(exp => {
        if (exp.year === yearNum && m % 12 === 0) {
          portfolio = Math.max(0, portfolio - exp.amount);
        }
      });

      // Withdrawals
      if (withdrawalStartYear && yearNum >= withdrawalStartYear && m % 12 === 0) {
        portfolio = Math.max(0, portfolio - withdrawalAmount);
      }

      if (m % 12 === 0) trajectory.push(portfolio);
    }
    results.push(trajectory);
  }

  // Compute percentiles at each year
  const yearlyPercentiles = [];
  for (let y = 0; y <= years; y++) {
    const vals = results.map(r => r[y]).sort((a, b) => a - b);
    yearlyPercentiles.push({
      year: y,
      p10: vals[Math.floor(simulations * 0.1)],
      p25: vals[Math.floor(simulations * 0.25)],
      p50: vals[Math.floor(simulations * 0.5)],
      p75: vals[Math.floor(simulations * 0.75)],
      p90: vals[Math.floor(simulations * 0.9)],
    });
  }

  const finalVals = results.map(r => r[years]).sort((a, b) => a - b);
  const successRate = finalVals.filter(v => v > 0).length / simulations;

  return {
    yearlyPercentiles,
    successRate,
    median: finalVals[Math.floor(simulations * 0.5)],
    worstCase: finalVals[Math.floor(simulations * 0.1)],
    bestCase: finalVals[Math.floor(simulations * 0.9)],
    simulations,
  };
}

router.post('/', async (req, res, next) => {
  try {
    // Accept both 'scenario' and 'scenarioKey' — prefer 'scenario' (B1 fix)
    const { userProfile, scenario, scenarioKey, years = 15, iterations = 5000, portfolio, profile } = req.body;
    const resolvedScenario = scenario || scenarioKey;

    // ── NEW PATH: Full scenario object from AI parser ─────────────────────
    if (resolvedScenario && typeof resolvedScenario === 'object') {
      const initialPortfolio = portfolio?.totalValue ||
        (portfolio?.assets ? Object.values(portfolio.assets).reduce((s, a) => s + (a.value || 0), 0) : 0) ||
        Number(userProfile?.portfolioValue) || 100000;

      const params = {
        initialPortfolio,
        monthlyContribution: profile?.monthlyInvestment || resolvedScenario.additionalMonthlyInvestment || 10000,
        annualReturnRate: resolvedScenario.annualReturnRate || 0.12,
        inflationRate: resolvedScenario.inflationRate || 0.06,
        volatility: resolvedScenario.volatility || 0.18,
        years: resolvedScenario.years || years || 20,
        simulations: 1000,
        majorExpenses: resolvedScenario.majorExpenses || [],
        withdrawalStartYear: resolvedScenario.withdrawalStartYear || null,
        withdrawalAmount: resolvedScenario.withdrawalAmount || 0,
      };

      const result = runNewMonteCarlo(params);
      return res.json({ success: true, ...result, scenarioName: resolvedScenario.scenarioName || 'Custom' });
    }

    // ── LEGACY PATH: String scenarioKey with predefined deltas ────────────
    const profileData = {
      income: Number(userProfile?.income) || 0,
      expenses: Number(userProfile?.expenses) || 0,
      variableSpend: Number(userProfile?.variableSpend) || 0,
      emi: Number(userProfile?.emi) || 0,
      portfolioValue: Number(userProfile?.portfolioValue) || 100000
    };

    const scenarioDelta = getScenarioDelta(resolvedScenario);
    const monteCarloResult = runMonteCarlo(profileData, scenarioDelta, years, iterations);
    
    let dangerZoneMonths = 0;
    for (const val of monteCarloResult.p10) {
      if (val < 500000) dangerZoneMonths += 12;
    }

    res.json({
      ...monteCarloResult,
      scenarioKey: resolvedScenario,
      scenarioName: scenarioDelta.name,
      dangerZoneMonths
    });
  } catch (error) {
    next(error);
  }
});

export default router;
