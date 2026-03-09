export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

function getStoredTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;

  const resolved = theme === 'system' ? getSystemTheme() : theme;
  const root = document.documentElement;

  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// Simple reactive state using $state rune at module level
let currentTheme = $state<Theme>('system');

export const theme = {
  get current(): Theme {
    return currentTheme;
  },

  get resolved(): 'light' | 'dark' {
    return currentTheme === 'system' ? getSystemTheme() : currentTheme;
  },

  init(): void {
    if (typeof window === 'undefined') return;

    // Load stored theme
    currentTheme = getStoredTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (currentTheme === 'system') {
        applyTheme('system');
      }
    });
  },

  set(newTheme: Theme): void {
    currentTheme = newTheme;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newTheme);
    }
    applyTheme(newTheme);
  },

  toggle(): void {
    const next = this.resolved === 'dark' ? 'light' : 'dark';
    this.set(next);
  },
};
