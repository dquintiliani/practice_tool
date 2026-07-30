import { Router } from 'express';
import { nanoid } from 'nanoid';
import { getScenario } from '../scenarios.js';
import { createAttempt, updateAttempt, getAttempt, listAttempts } from '../store.js';
import { gradeRun, GradingError } from '../grading.js';

const router = Router();

router.post('/attempts/start', async (req, res) => {
  const { scenario_id } = req.body || {};
  const scenario = getScenario(scenario_id);
  if (!scenario) return res.status(404).json({ error: 'scenario not found' });

  const attempt = {
    attempt_id: nanoid(),
    user_id: req.currentUser.user_id,
    scenario_id,
    started_at: new Date().toISOString(),
    completed_at: null,
    path_taken: [],
    rubric_result: null,
    passed: null,
  };
  await createAttempt(attempt);
  res.status(201).json(attempt);
});

router.post('/attempts/:attemptId/complete', async (req, res) => {
  const attempt = getAttempt(req.params.attemptId);
  if (!attempt) return res.status(404).json({ error: 'attempt not found' });
  if (attempt.user_id !== req.currentUser.user_id) {
    return res.status(403).json({ error: 'not your attempt' });
  }
  if (attempt.completed_at) {
    return res.status(409).json({ error: 'attempt already completed' });
  }

  const scenario = getScenario(attempt.scenario_id);
  const steps = (req.body && req.body.steps) || [];

  let result;
  try {
    result = gradeRun(scenario, steps);
  } catch (err) {
    if (err instanceof GradingError) return res.status(400).json({ error: err.message });
    throw err;
  }

  const updated = await updateAttempt(attempt.attempt_id, {
    completed_at: new Date().toISOString(),
    path_taken: result.path_taken,
    rubric_result: result.rubric_result,
    passed: result.passed,
  });

  res.json({
    attempt: updated,
    rubric_dimensions: scenario.rubric_dimensions,
    rubric_reference: scenario.rubric_reference || {},
    passed_count: result.passed_count,
    threshold: result.threshold,
  });
});

router.get('/attempts', (req, res) => {
  const requestedUserId = req.query.user_id || req.currentUser.user_id;
  if (requestedUserId !== req.currentUser.user_id && req.currentUser.role !== 'manager') {
    return res.status(403).json({ error: 'not authorized to view this history' });
  }
  const attempts = listAttempts()
    .filter((a) => a.user_id === requestedUserId)
    .sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
  res.json(attempts);
});

export default router;
