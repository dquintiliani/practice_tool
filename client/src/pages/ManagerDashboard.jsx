import { useEffect, useState } from 'react';
import { api } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export default function ManagerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.managerDashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="muted">Error: {error}</p>;
  if (!data) return <p className="muted">Loading…</p>;

  return (
    <div>
      <h1>Manager dashboard</h1>
      <p className="lead">Trainee completion and scores across all scenarios (read-only).</p>
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="dash">
          <thead>
            <tr>
              <th>Trainee</th>
              <th>Scenario</th>
              <th>Status</th>
              <th>Score</th>
              <th>Attempts</th>
              <th>Last attempt</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => {
              const dims = row.rubric_result ? Object.values(row.rubric_result) : null;
              const score = dims ? `${dims.filter(Boolean).length}/${dims.length}` : '—';
              return (
                <tr key={`${row.user_id}-${row.scenario_id}`}>
                  <td>{row.user_name}</td>
                  <td>{row.scenario_title}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td>{score}</td>
                  <td>{row.attempt_count}</td>
                  <td>{formatDate(row.last_attempt_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
