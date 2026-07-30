import { Link, useLocation, useParams } from 'react-router-dom';

const DIM_LABELS = {
  asked_clarifying_questions: 'Asked clarifying questions before proposing a solution',
  distinguished_reusable_vs_oneoff: 'Distinguished reusable/interoperable design from a one-off fix',
  named_tradeoff_explicitly: 'Named the trade-off explicitly to stakeholders',
  recovered_from_new_info: 'Recovered gracefully when new information contradicted their plan',
};

export default function Debrief() {
  const { scenarioId } = useParams();
  const location = useLocation();
  const result = location.state?.result;
  const scenarioTitle = location.state?.scenarioTitle;

  if (!result) {
    return (
      <div>
        <p className="muted">No debrief to show — start a scenario to see results here.</p>
        <Link to="/" className="back-link">← All scenarios</Link>
      </div>
    );
  }

  const { attempt, rubric_dimensions, rubric_reference, passed_count, threshold } = result;

  return (
    <div>
      <Link to="/" className="back-link">← All scenarios</Link>
      <h1>Debrief — {scenarioTitle}</h1>
      <div className={`overall-banner ${attempt.passed ? 'pass' : 'fail'}`}>
        {attempt.passed ? 'Passed' : 'Failed — retry'} · {passed_count} of {rubric_dimensions.length} rubric
        dimensions met (need {threshold})
      </div>

      <div className="card">
        {rubric_dimensions.map((dim) => {
          const met = attempt.rubric_result[dim];
          return (
            <div className="rubric-row" key={dim}>
              <span className={`rubric-dot ${met ? 'pass' : 'fail'}`}>{met ? '✓' : '✕'}</span>
              <div>
                <div className="rubric-dim">{DIM_LABELS[dim] || dim}</div>
                {!met && rubric_reference?.[dim] && (
                  <div className="rubric-ref">What a strong PM would probe: {rubric_reference[dim]}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="muted" style={{ marginBottom: 4 }}>Path taken</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{attempt.path_taken.join(' → ')}</div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Link to="/" className="btn secondary">Back to scenarios</Link>
        {!attempt.passed && (
          <Link to={`/scenarios/${scenarioId}`} className="btn">Retry scenario</Link>
        )}
      </div>
    </div>
  );
}
