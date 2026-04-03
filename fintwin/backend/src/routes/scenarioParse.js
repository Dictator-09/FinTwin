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

CRITICAL INSTRUCTIONS:
- Be AGGRESSIVE and DRAMATIC with your parameters based on the prompt. Do not be conservative.
- If the prompt is negative (e.g., "lost my job", "medical emergency"), set 'additionalMonthlyInvestment' to a large negative number (to negate their current SIPs) and add massive 'majorExpenses'. Increase 'volatility'.
- If the prompt is positive (e.g., "got a promotion", "startup exit", "bull market"), set 'additionalMonthlyInvestment' to a huge positive number, increase 'annualReturnRate' significantly (e.g. 0.15 or 0.18), and lower 'volatility'.
- 'additionalMonthlyInvestment' is an absolute INR amount added to or subtracted from their baseline SIP. It CAN be negative!

Return ONLY valid JSON with this shape:
{
  "scenarioName": "string (Creative, short title)",
  "annualReturnRate": number (decimal, baseline is 0.10. Shift to 0.05 for bear markets, 0.18 for bull markets),
  "inflationRate": number (e.g. 0.06),
  "volatility": number (baseline 0.15. Shift to 0.25 for risky scenarios),
  "additionalMonthlyInvestment": number (INR, CAN BE NEGATIVE if they lose income),
  "withdrawalStartYear": number or null,
  "withdrawalAmount": number or null,
  "years": number (simulation horizon, default 20),
  "majorExpenses": [{ "year": number, "amount": number, "label": "string" }],
  "salaryGrowthRate": number,
  "scenarioSummary": "One sentence plain English summary of what you changed"
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
