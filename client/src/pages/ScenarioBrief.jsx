import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function ScenarioBrief() {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState(null);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    api.getScenario(scenarioId).then(setScenario).catch((e) => setError(e.message));
  }, [scenarioId]);

  async function begin() {
    setStarting(true);
    try {
      const attempt = await api.startAttempt(scenarioId);
      navigate(`/scenarios/${scenarioId}/run`, { state: { attemptId: attempt.attempt_id } });
    } catch (e) {
      setError(e.message);
      setStarting(false);
    }
  }

  if (error) return <p className="muted">Error: {error}</p>;
  if (!scenario) return <p className="muted">Loading…</p>;

  return (
    <div>
      <Link to="/" className="back-link">← All scenarios</Link>
      <h1>{scenario.title}</h1>
      <p className="lead">{scenario.premise}</p>
      <div className="card">
        <div className="persona-box">
          <span className="persona-name">{scenario.persona.name}</span>
          <span>{scenario.persona.role}</span>
          <span>Tone: {scenario.persona.tone}</span>
        </div>
      </div>
      <button className="btn" onClick={begin} disabled={starting}>
        {starting ? 'Starting…' : 'Begin scenario'}
      </button>
    </div>
  );
}
