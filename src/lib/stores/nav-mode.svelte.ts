import { browser } from '$app/environment';

type NavMode = 'flat' | 'tree';

const STORAGE_KEY = 'nav-mode';

function getInitialMode(): NavMode {
  if (browser) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'tree' || stored === 'flat') {
      return stored;
    }
  }
  return 'flat';
}

function createNavModeStore() {
  let mode = $state<NavMode>(getInitialMode());

  return {
    get mode() {
      return mode;
    },
    toggle() {
      mode = mode === 'flat' ? 'tree' : 'flat';
      if (browser) {
        localStorage.setItem(STORAGE_KEY, mode);
      }
    },
    setMode(newMode: NavMode) {
      mode = newMode;
      if (browser) {
        localStorage.setItem(STORAGE_KEY, mode);
      }
    },
  };
}

export const navModeStore = createNavModeStore();
