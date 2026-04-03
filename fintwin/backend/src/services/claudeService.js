import axios from 'axios';

const MOCK_MODE = process.env.MOCK_AI === 'true' || !process.env.GROQ_API_KEY;

const MOCK_PROFILE = {
  "archetype": "Balanced Achiever",
  "riskScore": 65,
  "radarScores": {
    "riskTolerance": 60,
    "discipline": 85,
    "patience": 75,
    "optimism": 70,
    "liquidity": 50
  },
  "summary": "You have a disciplined approach to savings but a moderate risk appetite. Your portfolio structure suggests a focus on long-term stability with periodic growth opportunistic plays.",
  "traits": ["Disciplined Saver", "Goal Oriented", "Moderately Risk-Averse"],
  "savingsRate": 37.5,
  "monthlyNetWorth": 45000,
  "estimatedNetWorth": 645000
};

const MOCK_INSIGHT = "Based on your current trajectory, your financial twin is showing strong resilience. Your monthly surplus of ₹45,000 is being utilized efficiently. To reach your 10-year goal faster, consider increasing your equity allocation by 5-10% to capture higher market risk premiums, given your 'Balanced Achiever' archetype.";

const MOCK_SCENARIO = {
  "scenarioName": "Retirement at 45",
  "annualReturnRate": 0.12,
  "inflationRate": 0.06,
  "volatility": 0.15,
  "additionalMonthlyInvestment": 25000,
  "withdrawalStartYear": 17,
  "withdrawalAmount": 200000,
  "years": 20,
  "majorExpenses": [
    { "year": 3, "amount": 8000000, "label": "House Purchase" },
    { "year": 5, "amount": 2000000, "label": "Business Seed" }
  ],
  "salaryGrowthRate": 0.08,
  "scenarioSummary": "A transition to early retirement with significant mid-term capital outlays for housing and entrepreneurship."
};

/**
 * callClaude - unified Groq API caller with Mock Fallback
 */
export async function callClaude(systemPrompt, userMessage, stream = false) {
  if (MOCK_MODE) {
    console.log('⚠️ AI Mock Mode Active');
    if (stream) {
      // Return a fake axios-like response object for streaming
      return {
        data: {
          on: (event, callback) => {
            if (event === 'data') {
              const chunks = MOCK_INSIGHT.split(' ').map(word => `data: ${JSON.stringify({ choices: [{ delta: { content: word + ' ' } }] })}\n`);
              chunks.forEach((c, i) => setTimeout(() => callback(Buffer.from(c)), i * 50));
              setTimeout(() => callback(Buffer.from('data: [DONE]\n')), chunks.length * 50 + 100);
            }
            if (event === 'end') setTimeout(callback, MOCK_INSIGHT.split(' ').length * 50 + 200);
            if (event === 'error') {}
          }
        }
      };
    }

    // Smart Mock Selection
    const promptLower = (systemPrompt || '').toLowerCase();
    const userMessageLower = (typeof userMessage === 'string' ? userMessage : '').toLowerCase();
    
    if (promptLower.includes('scenario parser')) {
      return MOCK_SCENARIO;
    }
    
    if (typeof userMessage !== 'string' || promptLower.includes('personality analyzer')) {
      return MOCK_PROFILE;
    }

    if (userMessageLower.includes('15 words')) {
      return "Sell to reduce risk and realign with your optimal portfolio targets.";
    }

    return MOCK_INSIGHT;
  }

  const apiKey = process.env.GROQ_API_KEY;
  let messages;

  if (stream) {
    messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: typeof userMessage === 'string' ? userMessage : JSON.stringify(userMessage) },
    ];
  } else {
    const userData = userMessage;
    if (typeof userData === 'string') {
      messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userData }
      ];
    } else {
      const savings = userData.income - userData.expenses - userData.variableSpend - userData.emi;
      const savingsRate = userData.income > 0 ? ((savings / userData.income) * 100).toFixed(1) : 0;

      const profilePrompt = `You are a financial personality analyzer for an Indian fintech app called FinTwin. Give the user's financial data below, generate a detailed financial twin personality profile. Respond ONLY with a valid JSON object.
      
DATA: ${JSON.stringify(userData)}
SAVINGS: ₹${savings} (${savingsRate}%)

JSON Schema:
{
  "archetype": "one of: Disciplined Builder | Aggressive Grower | Conservative Saver | Balanced Achiever | Debt Warrior | Impulsive Spender",
  "riskScore": number,
  "radarScores": { "riskTolerance": number, "discipline": number, "patience": number, "optimism": number, "liquidity": number },
  "summary": "string",
  "traits": ["string"],
  "savingsRate": number,
  "monthlyNetWorth": number,
  "estimatedNetWorth": number
}`;
      messages = [{ role: 'user', content: profilePrompt }];
    }
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.5,
        max_tokens: 1024,
        stream,
      },
      {
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 30000,
        responseType: stream ? 'stream' : 'json',
      }
    );

    if (stream) return response;

    const content = response.data.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    try {
      return jsonMatch ? JSON.parse(jsonMatch[0]) : content;
    } catch (e) {
      return content;
    }
  } catch (error) {
    console.error('❌ Groq API error:', error.message);
    throw error;
  }
}

/**
 * callGroqStream - streams Groq response with Mock Fallback
 */
export async function callGroqStream(systemPrompt, userMessage, res) {
  if (MOCK_MODE) {
    console.log('⚠️ AI Stream Mock Mode Active');
    const words = MOCK_INSIGHT.split(' ');
    for (let i = 0; i < words.length; i++) {
       res.write(words[i] + ' ');
       await new Promise(r => setTimeout(r, 50));
    }
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 512,
      temperature: 0.7,
      stream: true
    },
    {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      responseType: 'stream'
    }
  );

  return new Promise((resolve, reject) => {
    let buffer = '';
    response.data.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('data: ')) {
          if (trimmed === 'data: [DONE]') continue;
          try {
            const json = JSON.parse(trimmed.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            if (content) res.write(content);
          } catch (e) {}
        }
      }
    });
    response.data.on('end', resolve);
    response.data.on('error', reject);
  });
}