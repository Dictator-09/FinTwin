import { Router } from 'express';
import { callClaude } from '../services/claudeService.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { profile, portfolio } = req.body;

    if (!profile) {
      return res.status(400).json({ error: 'profile is required' });
    }

    // Rule-based score — no hallucination risk
    let score = 0;
    const breakdown = [];

    // 1. Emergency Fund (20 pts)
    const monthlyExpenses = (Number(profile.monthlyExpenses) || Number(profile.expenses) || 0) +
      (Number(profile.monthlyEMI) || Number(profile.emi) || 0);
    const currentSavings = Number(profile.currentSavings) || 0;
    const emergencyMonths = monthlyExpenses > 0 ? currentSavings / monthlyExpenses : 0;
    const efScore = Math.min(20, (emergencyMonths / 6) * 20);
    score += efScore;
    breakdown.push({
      category: 'Emergency Fund',
      score: Math.round(efScore),
      max: 20,
      message: emergencyMonths >= 6
        ? '✅ 6+ months covered'
        : `⚠️ Only ${emergencyMonths.toFixed(1)} months — target 6`,
    });

    // 2. Savings Rate (20 pts)
    const monthlyIncome = Number(profile.monthlyIncome) || Number(profile.income) || 0;
    const monthlyInvestment = Number(profile.monthlyInvestment) || 0;
    const savingsRate = monthlyIncome > 0 ? monthlyInvestment / monthlyIncome : 0;
    const srScore = Math.min(20, (savingsRate / 0.3) * 20);
    score += srScore;
    breakdown.push({
      category: 'Savings Rate',
      score: Math.round(srScore),
      max: 20,
      message: `${(savingsRate * 100).toFixed(1)}% of income — ${savingsRate >= 0.2 ? '✅ Good' : '⚠️ Target 20%+'}`,
    });

    // 3. Debt-to-Income (20 pts)
    const monthlyEMI = Number(profile.monthlyEMI) || Number(profile.emi) || 0;
    const dti = monthlyIncome > 0 ? monthlyEMI / monthlyIncome : 0;
    const dtiScore = Math.max(0, 20 - (dti / 0.4) * 20);
    score += dtiScore;
    breakdown.push({
      category: 'Debt Load',
      score: Math.round(dtiScore),
      max: 20,
      message: `EMIs = ${(dti * 100).toFixed(1)}% of income — ${dti <= 0.3 ? '✅ Healthy' : '⚠️ High debt'}`,
    });

    // 4. Insurance Coverage (20 pts)
    const insScore = (profile.hasHealthInsurance ? 10 : 0) + (profile.hasTermInsurance ? 10 : 0);
    score += insScore;
    breakdown.push({
      category: 'Insurance',
      score: insScore,
      max: 20,
      message: `Health: ${profile.hasHealthInsurance ? '✅' : '❌'} | Term: ${profile.hasTermInsurance ? '✅' : '❌'}`,
    });

    // 5. Diversification (20 pts)
    const holdings = Array.isArray(portfolio) ? portfolio : (portfolio?.holdings || []);
    const assetTypes = new Set(holdings.map(h => h.type));
    const assetCount = assetTypes.size;
    const divScore = Math.min(20, assetCount * 5);
    score += divScore;
    breakdown.push({
      category: 'Diversification',
      score: Math.round(divScore),
      max: 20,
      message: `${assetCount} asset classes — ${assetCount >= 4 ? '✅ Well diversified' : '⚠️ Add more assets'}`,
    });

    // Get AI commentary
    let aiAdvice = '';
    try {
      const aiPrompt = `Financial health score: ${Math.round(score)}/100. Breakdown: ${JSON.stringify(breakdown)}. Profile: age ${profile.age || 'unknown'}, income ₹${monthlyIncome}/month. Give 2-3 sentence personalized advice. Be specific, direct, Indian context. Do not use markdown.`;
      const aiResult = await callClaude('You are a caring Indian financial advisor. Give brief, actionable advice.', aiPrompt, false);
      aiAdvice = typeof aiResult === 'string' ? aiResult : (aiResult?.summary || JSON.stringify(aiResult));
    } catch (aiErr) {
      console.error('AI advice generation failed:', aiErr.message);
      aiAdvice = 'Focus on building your emergency fund and increasing your savings rate to 20%+ of income.';
    }

    res.json({
      totalScore: Math.round(score),
      grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
      breakdown,
      aiAdvice,
    });
  } catch (err) {
    console.error('Health score error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
