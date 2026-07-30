import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useUser } from '../context/UserContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function ScenarioList() {
  const { currentUserId } = useUser();
  const [scenarios, setScenarios] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUserId) return;
    api.listScenarios().then(setScenarios).catch((e) => setError(e.message));
  }, [currentUserId]);

  if (error) return <p className="muted">Error: {error}</p>;
  if (!scenarios) return <p className="muted">Loading scenarios…</p>;

  return (
    <div>
      <h1>Scenarios</h1>
      <p className="lead">
        Work through branching decision points as a Data PM. Each scenario ends in a debrief scored
        against a fixed rubric.
      </p>
      {scenarios.map((s) => (
        <Link key={s.scenario_id} to={`/scenarios/${s.scenario_id}`} className="card card-link">
          <div className="scenario-title">{s.title}</div>
          <p className="scenario-premise">{s.premise}</p>
          <StatusBadge status={s.status} />
        </Link>
      ))}
    </div>
  );
}
