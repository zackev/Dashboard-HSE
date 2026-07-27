const ACCENT = {
  orange: 'border-l-brand-orange',
  blue: 'border-l-info',
  green: 'border-l-good',
  red: 'border-l-bad'
};

export default function StatCard({ label, value, foot, accent = 'orange' }) {
  return (
    <div className={`flex flex-col gap-1 rounded-[10px] border border-border border-l-4 bg-surface p-4 px-[18px] ${ACCENT[accent]}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      <span className="font-mono text-[30px] font-extrabold">{value}</span>
      <span className="text-xs text-muted">{foot}</span>
    </div>
  );
}
