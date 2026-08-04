const ACCENT = {
  orange: 'border-l-brand-orange text-brand-orange',
  blue: 'border-l-info text-info',
  green: 'border-l-good text-good',
  red: 'border-l-bad text-bad'
};

export default function StatCard({ label, value, foot, accent = 'orange', icon }) {
  const accentClasses = ACCENT[accent].split(' ');
  return (
    <div className={`flex flex-col gap-1 rounded-[10px] border border-border border-l-4 bg-surface p-4 px-[18px] ${accentClasses[0]}`}>
      <div className="flex items-center gap-2">
        {icon && <span className={accentClasses[1]}>{icon}</span>}
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      </div>
      <span className="font-mono text-[30px] font-extrabold">{value}</span>
      <span className="text-xs text-muted">{foot}</span>
    </div>
  );
}
