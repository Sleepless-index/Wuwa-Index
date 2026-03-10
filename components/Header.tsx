import ThemeToggle from './ThemeToggle';

interface Props {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function Header({ theme, onToggleTheme }: Props) {
  return (
    <header className="flex items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-base font-semibold text-accent tracking-wide leading-none mb-1">
          WuWa Tracker
        </h1>
        <p className="text-xs text-muted font-mono">limited resonator collection</p>
      </div>
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
    </header>
  );
}
