const BASE = '/api';

function currentUserId() {
  return localStorage.getItem('pmsim.currentUserId') || '';
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': currentUserId(),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  listUsers: () => request('/users', { headers: {} }),
  me: () => request('/me'),
  listScenarios: () => request('/scenarios'),
  getScenario: (id) => request(`/scenarios/${id}`),
  startAttempt: (scenarioId) =>
    request('/attempts/start', { method: 'POST', body: JSON.stringify({ scenario_id: scenarioId }) }),
  completeAttempt: (attemptId, steps) =>
    request(`/attempts/${attemptId}/complete`, { method: 'POST', body: JSON.stringify({ steps }) }),
  listAttempts: (userId) => request(`/attempts?user_id=${encodeURIComponent(userId)}`),
  managerDashboard: () => request('/manager/dashboard'),
};
