import { expect, test } from '@playwright/test';

test.describe('dark mode', () => {
  test('toggle switches to dark mode', async ({ page }) => {
    await page.goto('/');

    // Should start in light mode (no dark class)
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);

    // Click theme toggle
    await page.getByRole('button', { name: 'Toggle theme' }).click();

    // Should now have dark class
    await expect(html).toHaveClass(/dark/);
  });

  test('toggle switches back to light mode', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const toggle = page.getByRole('button', { name: 'Toggle theme' });

    // Toggle to dark
    await toggle.click();
    await expect(html).toHaveClass(/dark/);

    // Toggle back to light
    await toggle.click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test('persists theme after reload', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const toggle = page.getByRole('button', { name: 'Toggle theme' });

    // Toggle to dark
    await toggle.click();
    await expect(html).toHaveClass(/dark/);

    // Reload page
    await page.reload();

    // Should still be dark
    await expect(html).toHaveClass(/dark/);
  });

  test('respects system preference when set to system', async ({ page }) => {
    // Emulate dark color scheme
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    const html = page.locator('html');

    // Should be dark due to system preference
    await expect(html).toHaveClass(/dark/);
  });
});
