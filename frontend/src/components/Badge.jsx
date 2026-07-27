import { toneOf } from '../config/modules.jsx';

const TONE_CLASSES = {
  good: 'bg-good/15 text-good',
  warn: 'bg-warn/20 text-warn',
  bad: 'bg-bad/20 text-bad',
  neutral: 'bg-surface2 text-muted'
};

export default function Badge({ kind, value }) {
  const cls = kind === 'type' ? TONE_CLASSES.neutral : TONE_CLASSES[toneOf(value)];
  return <span className={`badge ${cls}`}>{value || '-'}</span>;
}
