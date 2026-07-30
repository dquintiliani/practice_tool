import { Router } from 'express';
import { listScenarios, getScenario } from '../scenarios.js';
import { listAttempts } from '../store.js';
import { computeStatus } from '../scenarioStatus.js';

const router = Router();

router.get('/scenarios', (req, res) => {
  const userId = req.currentUser.user_id;
  const allAttempts = listAttempts();
  const summaries = listScenarios().map((s) => {
    const mine = allAttempts.filter((a) => a.user_id === userId && a.scenario_id === s.scenario_id);
    return {
      scenario_id: s.scenario_id,
      title: s.title,
      premise: s.premise,
      status: computeStatus(mine),
    };
  });
  res.json(summaries);
});

router.get('/scenarios/:id', (req, res) => {
  const scenario = getScenario(req.params.id);
  if (!scenario) return res.status(404).json({ error: 'scenario not found' });
  res.json(scenario);
});

export default router;
