export function useTheme() {
  // Always dark — no toggle
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark');
  }
  return { theme: 'dark' as const, toggleTheme: () => {} };
}
