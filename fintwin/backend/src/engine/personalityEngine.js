export function buildPersonalityPrompt(userProfile) {
  const {
    income = 0,
    expenses = 0,
    variableSpend = 0,
    emi = 0,
    portfolioValue = 0,
    emotionalChoice = 'None'
  } = userProfile;

  const totalExpenses = expenses + variableSpend + emi;
  const savingsRate = income > 0 ? ((income - totalExpenses) / income) * 100 : 0;
  const monthlyNetWorth = income - totalExpenses;

  return `- Analyze: income ₹${income}, expenses ₹${totalExpenses}, savings rate ${savingsRate.toFixed(1)}%, portfolio ₹${portfolioValue}, emotional choice: [${emotionalChoice}]
- Return ONLY a valid JSON object with NO markdown, NO backticks, NO explanation
- JSON shape:
  {
    "archetype": "string (one of: 'The Calculated Risk-Taker', 'The Anxious Accumulator', 'The Disciplined Builder', 'The Impulsive Optimist')",
    "riskScore": "number 0-100",
    "radarScores": { "riskTolerance": "0-100", "discipline": "0-100", "patience": "0-100", "optimism": "0-100", "liquidity": "0-100" },
    "summary": "string (exactly 2 sentences, plain English, no jargon)",
    "traits": ["string", "string", "string"],
    "savingsRate": ${savingsRate.toFixed(2)},
    "monthlyNetWorth": ${monthlyNetWorth},
    "estimatedNetWorth": ${portfolioValue}
  }`;
}
