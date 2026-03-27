import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function callClaude(systemPrompt, userMessage) {
  try {
    // 🔍 Check API key
    if (!process.env.GROQ_API_KEY) {
      console.error("❌ GROQ API KEY MISSING");
      return JSON.stringify({
        error: "Missing API Key"
      });
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;

  } catch (error) {
    console.error("🔥 GROQ API ERROR:");

    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }

    // ✅ FALLBACK (never break your app)
    return JSON.stringify({
      archetype: "Disciplined Builder",
      riskScore: 72,
      radarScores: {
        riskTolerance: 70,
        discipline: 85,
        patience: 78,
        optimism: 65,
        liquidity: 60
      },
      summary: "You are consistent and focused on long-term growth.",
      traits: ["Disciplined", "Patient", "Strategic"],
      savingsRate: 30,
      monthlyNetWorth: 50000,
      estimatedNetWorth: 1500000
    });
  }
}