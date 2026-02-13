import { expect, test } from '@playwright/test';

test.describe('responsive layout', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('shows hamburger menu on mobile', async ({ page }) => {
    await page.goto('/');

    // Hamburger should be visible
    const hamburger = page.getByRole('button', { name: 'Toggle menu' });
    await expect(hamburger).toBeVisible();

    // Desktop nav should be hidden
    const desktopNav = page.locator('nav.sm\\:flex');
    await expect(desktopNav).toBeHidden();
  });

  test('hamburger opens mobile menu', async ({ page }) => {
    await page.goto('/');

    const hamburger = page.getByRole('button', { name: 'Toggle menu' });

    // Menu should be closed initially
    const mobileNav = page.locator('nav.sm\\:hidden');
    await expect(mobileNav).toBeHidden();

    // Open menu
    await hamburger.click();
    await expect(mobileNav).toBeVisible();

    // Should show nav links in mobile menu
    await expect(mobileNav.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: 'Services' })).toBeVisible();
  });

  test('hamburger closes mobile menu', async ({ page }) => {
    await page.goto('/');

    const hamburger = page.getByRole('button', { name: 'Toggle menu' });

    // Open menu
    await hamburger.click();
    const mobileNav = page.locator('nav.sm\\:hidden');
    await expect(mobileNav).toBeVisible();

    // Close menu
    await hamburger.click();
    await expect(mobileNav).toBeHidden();
  });

  test('mobile menu closes after navigation', async ({ page }) => {
    await page.goto('/');

    const hamburger = page.getByRole('button', { name: 'Toggle menu' });
    const mobileNav = page.locator('nav.sm\\:hidden');

    // Open menu and click Services in mobile nav
    await hamburger.click();
    await mobileNav.getByRole('link', { name: 'Services' }).click();

    // Should navigate and close menu
    await expect(page).toHaveURL('/services');
    await expect(mobileNav).toBeHidden();
  });
});

test.describe('desktop layout', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('shows desktop nav on large screens', async ({ page }) => {
    await page.goto('/');

    // Desktop nav should be visible
    const desktopNav = page.locator('nav.sm\\:flex');
    await expect(desktopNav).toBeVisible();

    // Hamburger should be hidden
    const hamburger = page.getByRole('button', { name: 'Toggle menu' });
    await expect(hamburger).toBeHidden();
  });
});
