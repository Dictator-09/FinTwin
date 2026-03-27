import { Router } from 'express';
import { runMonteCarlo } from '../engine/monteCarlo.js';
import { getScenarioDelta } from '../engine/scenarioDeltas.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { userProfile, scenarioKey } = req.body;
    
    const scenarioDelta = getScenarioDelta(scenarioKey);
    const monteCarloResult = runMonteCarlo(userProfile, scenarioDelta, 15, 10000);
    
    let dangerZoneMonths = 0;
    for (const val of monteCarloResult.p10) {
      if (val < 500000) dangerZoneMonths += 12;
    }

    res.json({
      ...monteCarloResult,
      scenarioKey,
      scenarioName: scenarioDelta.name,
      dangerZoneMonths
    });
  } catch (error) {
    next(error);
  }
});

export default router;
