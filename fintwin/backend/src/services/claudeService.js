import axios from 'axios';

/**
 * callClaude - unified Groq API caller
 * @param {string} systemPrompt  - system-level instruction (used as context)
 * @param {any}    userMessage   - user data (object for profile, string for insight)
 * @param {boolean} stream       - if true, returns a streaming axios response
 */
export async function callClaude(systemPrompt, userMessage, stream = false) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is missing from environment variables.');
  }

  // ── Build messages ─────────────────────────────────────────────────────────
  let messages;

  if (stream) {
    // Insight mode: systemPrompt is an instruction, userMessage is a JSON string
    messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: typeof userMessage === 'string' ? userMessage : JSON.stringify(userMessage) },
    ];
  } else {
    // Profile mode: build a rich structured prompt from userData object
    const userData = userMessage;

    // If userMessage is a string (e.g. rebalance tip prompt), use it directly
    if (typeof userData === 'string') {
      messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userData }
      ];
    } else {
      const savings = userData.income - userData.expenses - userData.variableSpend - userData.emi;
      const savingsRate = userData.income > 0 ? ((savings / userData.income) * 100).toFixed(1) : 0;

      const profilePrompt = `You are a financial personality analyzer for an Indian fintech app called FinTwin.

Given the user's financial data below, generate a detailed financial twin personality profile.

USER FINANCIAL DATA:
- Monthly Income: ₹${userData.income}
- Fixed Expenses: ₹${userData.expenses}
- Variable Spend: ₹${userData.variableSpend}
- Monthly EMI: ₹${userData.emi}
- Current Portfolio Value: ₹${userData.portfolioValue}
- Primary Financial Drive: ${userData.emotionalChoice}
- Calculated Monthly Savings: ₹${savings} (${savingsRate}% savings rate)

Respond ONLY with a valid JSON object. No markdown, no code fences, no explanation. Just raw JSON:

{
  "archetype": "one of: Disciplined Builder | Aggressive Grower | Conservative Saver | Balanced Achiever | Debt Warrior | Impulsive Spender",
  "riskScore": <number 0-100>,
  "radarScores": {
    "riskTolerance": <number 0-100>,
    "discipline": <number 0-100>,
    "patience": <number 0-100>,
    "optimism": <number 0-100>,
    "liquidity": <number 0-100>
  },
  "summary": "<2-3 sentence personality summary based on spending behavior and goals>",
  "traits": ["<trait1>", "<trait2>", "<trait3>"],
  "savingsRate": <number percentage>,
  "monthlyNetWorth": <monthly net savings as number in rupees>,
  "estimatedNetWorth": <estimated total net worth as number in rupees>
}`;

      messages = [{ role: 'user', content: profilePrompt }];
    }
  }

  // ── Make Groq API request ──────────────────────────────────────────────────
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
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
        responseType: stream ? 'stream' : 'json',
      }
    );

    if (stream) {
      // Return raw axios response so insight.js can pipe the stream
      return response;
    }

    // Non-stream: parse JSON from text response
    const content = response.data.choices[0].message.content.trim();
    console.log('✅ Groq raw response:', content);

    // Extract JSON even if the model wraps it in markdown fences
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // If no JSON found, return the raw string (for rebalance tips etc.)
      return content;
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      // If JSON parse fails, return raw string
      return content;
    }
  } catch (error) {
    if (error.response) {
      console.error('❌ Groq API error status:', error.response.status);
      console.error('❌ Groq API error body:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Groq call failed:', error.message);
    }
    throw error;
  }
}

/**
 * callGroqStream - streams Groq response, parses SSE, writes plain text to res
 */
export async function callGroqStream(systemPrompt, userMessage, res) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is missing from environment variables.');
  }

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
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
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
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            if (content) res.write(content);
          } catch (e) { /* skip malformed SSE lines */ }
        }
      }
    });
    response.data.on('end', resolve);
    response.data.on('error', reject);
  });
}