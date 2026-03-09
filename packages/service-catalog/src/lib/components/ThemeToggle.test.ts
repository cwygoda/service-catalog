/// <reference types="@testing-library/jest-dom" />
import { render, screen, cleanup } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import ThemeToggle from './ThemeToggle.svelte';

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Clear localStorage and reset document
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    cleanup();
  });

  it('renders toggle button', () => {
    render(ThemeToggle);
    expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeInTheDocument();
  });

  it('toggles theme on click', async () => {
    const user = userEvent.setup();
    render(ThemeToggle);

    const button = screen.getByRole('button', { name: 'Toggle theme' });
    const initialDark = document.documentElement.classList.contains('dark');

    await user.click(button);

    // Theme should be toggled from initial state
    const afterClick = document.documentElement.classList.contains('dark');
    expect(afterClick).not.toBe(initialDark);
  });

  it('toggles theme back on second click', async () => {
    const user = userEvent.setup();
    render(ThemeToggle);

    const button = screen.getByRole('button', { name: 'Toggle theme' });

    // Get state after first click
    await user.click(button);
    const afterFirstClick = document.documentElement.classList.contains('dark');

    // Click again
    await user.click(button);
    const afterSecondClick = document.documentElement.classList.contains('dark');

    // Should be opposite of after first click
    expect(afterSecondClick).not.toBe(afterFirstClick);
  });

  it('persists theme to localStorage', async () => {
    const user = userEvent.setup();
    render(ThemeToggle);

    const button = screen.getByRole('button', { name: 'Toggle theme' });
    await user.click(button);

    // Should have persisted something to localStorage
    const stored = localStorage.getItem('theme');
    expect(stored).toBeTruthy();
    expect(['light', 'dark']).toContain(stored);
  });
});
