/** Derives a trainee-facing status string from that user's attempt history for one scenario. */
export function computeStatus(attempts) {
  if (attempts.length === 0) return 'not_started';
  const latest = [...attempts].sort((a, b) => new Date(b.started_at) - new Date(a.started_at))[0];
  if (!latest.completed_at) return 'in_progress';
  return latest.passed ? 'passed' : 'failed_retry';
}

export function latestAttemptFor(attempts) {
  if (attempts.length === 0) return null;
  return [...attempts].sort((a, b) => new Date(b.started_at) - new Date(a.started_at))[0];
}
