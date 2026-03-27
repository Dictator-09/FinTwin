export async function callClaude(systemPrompt, userMessage) {
  console.log("⚠️ AI DISABLED — USING MOCK DATA");

  return {
    archetype: "Disciplined Builder",
    riskScore: 72,
    radarScores: {
      riskTolerance: 68,
      discipline: 85,
      patience: 80,
      optimism: 70,
      liquidity: 60
    },
    summary: "You are consistent, disciplined, and focused on long-term wealth building.",
    traits: ["Disciplined", "Patient", "Strategic"],
    savingsRate: 30,
    monthlyNetWorth: 50000,
    estimatedNetWorth: 1500000
  };
}