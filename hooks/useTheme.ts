import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');

  // On mount: read saved preference or system preference
  useEffect(() => {
    const saved = localStorage.getItem('wuwa-theme') as Theme | null;
    const preferred = saved
      ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(preferred);
    setThemeState(preferred);
  }, []);

  function applyTheme(t: Theme) {
    document.documentElement.classList.toggle('dark', t === 'dark');
    localStorage.setItem('wuwa-theme', t);
  }

  function toggleTheme() {
    setThemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  }

  return { theme, toggleTheme };
}
