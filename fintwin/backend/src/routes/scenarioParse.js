import { Router } from 'express';
import { callClaude } from '../services/claudeService.js';

const router = Router();

router.post('/', async (req, res) => {
  const { userInput, portfolio, profile } = req.body;

  if (!userInput || !userInput.trim()) {
    return res.status(400).json({ success: false, error: 'userInput is required' });
  }

  const systemPrompt = `You are a financial scenario parser for Indian users.
Given a user's free-form description of their financial future, extract structured scenario parameters.
Return ONLY valid JSON with this shape:
{
  "scenarioName": "string",
  "annualReturnRate": number (decimal, e.g. 0.12),
  "inflationRate": number (e.g. 0.06),
  "volatility": number (e.g. 0.15),
  "additionalMonthlyInvestment": number (INR),
  "withdrawalStartYear": number or null,
  "withdrawalAmount": number or null,
  "years": number (simulation horizon, default 20),
  "majorExpenses": [{ "year": number, "amount": number, "label": "string" }],
  "salaryGrowthRate": number,
  "scenarioSummary": "One sentence plain English summary"
}
No explanation. Only JSON.`;

  const userMessage = `User profile: ${JSON.stringify(profile || {})}
Portfolio: ${JSON.stringify(portfolio || {})}
User's scenario description: "${userInput}"

Parse this into simulation parameters.`;

  try {
    const result = await callClaude(systemPrompt, userMessage, false);

    // callClaude returns parsed JSON object or string
    let parsed;
    if (typeof result === 'object') {
      parsed = result;
    } else {
      const cleaned = result.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    res.json({ success: true, scenario: parsed });
  } catch (err) {
    console.error('Scenario parse error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
