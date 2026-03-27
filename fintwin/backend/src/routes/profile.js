import { Router } from 'express';
import { buildPersonalityPrompt } from '../engine/personalityEngine.js';
import { callClaude } from '../services/claudeService.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { income, expenses, variableSpend, emi, portfolioValue, emotionalChoice } = req.body;
    
    const systemPrompt = buildPersonalityPrompt({
      income, expenses, variableSpend, emi, portfolioValue, emotionalChoice
    });
    
    const userMessage = JSON.stringify(req.body);
    
    const claudeResponse = await callClaude(systemPrompt, userMessage, false);
    
    const cleanJson = claudeResponse.replace(/```json|```/g, '').trim();
    let result;
    try {
      result = JSON.parse(cleanJson);
    } catch (err) {
      console.error('Claude JSON Parse Error. Output:', cleanJson);
      result = {
        archetype: 'The Calculated Risk-Taker',
        riskScore: 75,
        radarScores: { riskTolerance: 80, discipline: 60, patience: 70, optimism: 85, liquidity: 60 },
        summary: 'You blend high-growth aspirations with systemic structural safeguards.',
        traits: ['Analytical', 'Aggressive', 'Long-term'],
        savingsRate: 0,
        monthlyNetWorth: 0,
        estimatedNetWorth: 0
      };
    }
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
