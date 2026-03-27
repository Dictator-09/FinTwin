import { Router } from 'express';
import { callClaude } from '../services/claudeService.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { simulationResult, userProfile, twinState } = req.body;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');

    const systemPrompt = `Analyze the simulation and provide exactly 4 paragraphs:
    1. The single biggest red flag in this simulation (1-2 sentences)
    2. What their financial archetype means for this scenario
    3. Three numbered bullet-point recommended actions
    4. One sentence of encouragement`;

    const userMessage = JSON.stringify({ simulationResult, userProfile, twinState });

    const claudeResponse = await callClaude(systemPrompt, userMessage, true);
    const stream = claudeResponse.data;

    stream.on('data', (chunk) => {
      res.write(chunk);
    });

    stream.on('end', () => {
      res.end();
    });
    
    stream.on('error', (err) => {
      console.error(err);
      if (!res.headersSent) res.status(500);
      res.end();
    });
  } catch (error) {
    if (!res.headersSent) {
      next(error);
    } else {
      res.end();
    }
  }
});

export default router;
