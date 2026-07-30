import { Router } from 'express';
import { listUsers } from '../users.js';
import { listScenarios } from '../scenarios.js';
import { listAttempts } from '../store.js';
import { computeStatus, latestAttemptFor } from '../scenarioStatus.js';

const router = Router();

router.get('/manager/dashboard', (req, res) => {
  if (req.currentUser.role !== 'manager') {
    return res.status(403).json({ error: 'manager role required' });
  }

  const trainees = listUsers().filter((u) => u.role === 'trainee');
  const scenarios = listScenarios();
  const allAttempts = listAttempts();

  const rows = [];
  for (const trainee of trainees) {
    for (const scenario of scenarios) {
      const attempts = allAttempts.filter(
        (a) => a.user_id === trainee.user_id && a.scenario_id === scenario.scenario_id
      );
      const latest = latestAttemptFor(attempts);
      rows.push({
        user_id: trainee.user_id,
        user_name: trainee.name,
        scenario_id: scenario.scenario_id,
        scenario_title: scenario.title,
        status: computeStatus(attempts),
        passed: latest ? latest.passed : null,
        rubric_result: latest ? latest.rubric_result : null,
        last_attempt_at: latest ? latest.started_at : null,
        attempt_count: attempts.length,
      });
    }
  }

  res.json({ rows });
});

export default router;
