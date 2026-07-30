import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function ScenarioRun() {
  const { scenarioId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const attemptId = location.state?.attemptId;

  const [scenario, setScenario] = useState(null);
  const [error, setError] = useState(null);
  const [nodeId, setNodeId] = useState('start');
  const [steps, setSteps] = useState([]);
  const [selected, setSelected] = useState(null); // { option, isTerminal }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!attemptId) {
      navigate(`/scenarios/${scenarioId}`, { replace: true });
      return;
    }
    api.getScenario(scenarioId).then(setScenario).catch((e) => setError(e.message));
  }, [scenarioId, attemptId, navigate]);

  if (error) return <p className="muted">Error: {error}</p>;
  if (!scenario) return <p className="muted">Loading…</p>;

  const node = scenario.nodes[nodeId];

  function choose(option, index) {
    setSelected({ option, index });
  }

  async function continueOn() {
    const nextSteps = [...steps, { node_id: nodeId, option_index: selected.index }];
    if (selected.option.next_node) {
      setSteps(nextSteps);
      setNodeId(selected.option.next_node);
      setSelected(null);
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.completeAttempt(attemptId, nextSteps);
      navigate(`/scenarios/${scenarioId}/debrief`, { state: { result, scenarioTitle: scenario.title } });
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="progress-hint">{scenario.title} · decision point {steps.length + 1}</div>
      {!selected ? (
        <>
          <div className="situation">{node.situation_text}</div>
          <div className="options">
            {node.options.map((opt, i) => (
              <button key={i} className="option-btn" onClick={() => choose(opt, i)}>
                {opt.option_text}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="situation">{node.situation_text}</div>
          <div className="reaction-box">
            <div className="reaction-label">{scenario.persona.name}'s response</div>
            {selected.option.reaction_text}
          </div>
          <button className="btn" onClick={continueOn} disabled={submitting}>
            {submitting ? 'Submitting…' : selected.option.next_node ? 'Continue' : 'See debrief'}
          </button>
        </>
      )}
    </div>
  );
}
