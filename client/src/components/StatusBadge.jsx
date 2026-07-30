const LABELS = {
  not_started: 'Not started',
  in_progress: 'In progress',
  passed: 'Passed',
  failed_retry: 'Failed — retry',
};

export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{LABELS[status] || status}</span>;
}
