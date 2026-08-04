import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      className="flex w-full items-center gap-2.5 rounded-[10px] border border-border bg-surface2 px-3 py-2.5 text-[12.5px] font-semibold text-muted transition hover:text-ink"
    >
      {isDark ? <Moon size={16} className="text-brand-yellow" /> : <Sun size={16} className="text-brand-orange" />}
      <span>{isDark ? 'Mode Gelap' : 'Mode Terang'}</span>
      <span className="ml-auto text-[10.5px] opacity-70">Ganti</span>
    </button>
  );
}
