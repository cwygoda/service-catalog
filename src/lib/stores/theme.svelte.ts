import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

function getStoredTheme(): Theme {
  if (!browser) return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

function getSystemTheme(): 'light' | 'dark' {
  if (!browser) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  if (!browser) return;

  const resolved = theme === 'system' ? getSystemTheme() : theme;
  const root = document.documentElement;

  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

class ThemeState {
  #theme = $state<Theme>(getStoredTheme());

  constructor() {
    if (browser) {
      // Apply initial theme
      applyTheme(this.#theme);

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.#theme === 'system') {
          applyTheme('system');
        }
      });
    }
  }

  get current(): Theme {
    return this.#theme;
  }

  get resolved(): 'light' | 'dark' {
    return this.#theme === 'system' ? getSystemTheme() : this.#theme;
  }

  set(theme: Theme): void {
    this.#theme = theme;
    if (browser) {
      localStorage.setItem(STORAGE_KEY, theme);
      applyTheme(theme);
    }
  }

  toggle(): void {
    const next = this.resolved === 'dark' ? 'light' : 'dark';
    this.set(next);
  }
}

export const theme = new ThemeState();
