import { expect, test } from '@playwright/test';

test('use case list page loads', async ({ page }) => {
  await page.goto('/use-cases');
  await expect(page.getByRole('heading', { name: 'Use Cases', level: 1 })).toBeVisible();
  await expect(page.getByText('Browse all 3 business use cases')).toBeVisible();
});

test('shows correct use case count', async ({ page }) => {
  await page.goto('/use-cases');
  // Check that we have 3 use case cards
  const cards = page.locator('a[href^="/use-cases/"]');
  await expect(cards).toHaveCount(3);
});

test('navigates to use case detail', async ({ page }) => {
  await page.goto('/use-cases');
  await page.getByRole('link', { name: 'Customer Checkout' }).click();
  await expect(page).toHaveURL('/use-cases/checkout');
  await expect(page.getByRole('heading', { name: 'Customer Checkout' })).toBeVisible();
});

test('use case detail shows steps', async ({ page }) => {
  await page.goto('/use-cases/checkout');
  // Check for step table
  await expect(page.getByRole('table')).toBeVisible();
  // Check for step content
  await expect(page.getByText('Initiates checkout')).toBeVisible();
  await expect(page.getByText('Creates pending order')).toBeVisible();
});

test('use case detail shows participating services', async ({ page }) => {
  await page.goto('/use-cases/checkout');
  await expect(page.getByText('Participating Services')).toBeVisible();
  // Check service links exist
  await expect(page.getByRole('link', { name: /Orders Service/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Billing Service/i })).toBeVisible();
});

test('use case detail breadcrumb navigation works', async ({ page }) => {
  await page.goto('/use-cases/checkout');
  // Breadcrumbs: Commerce / Use Cases / Customer Checkout
  await page
    .getByRole('navigation', { name: 'Breadcrumb' })
    .getByRole('link', { name: 'Use Cases' })
    .click();
  await expect(page).toHaveURL('/use-cases');
});

test('service detail shows use cases', async ({ page }) => {
  // Orders service participates in checkout
  await page.goto('/services/orders-service');
  await expect(page.getByText('Participates in Use Cases')).toBeVisible();
  await expect(page.getByRole('link', { name: /Customer Checkout/i })).toBeVisible();
});

test('home page shows featured use cases', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Featured Use Cases')).toBeVisible();
  // Check use case count stat
  await expect(page.getByRole('link', { name: /3.*Use Cases/i })).toBeVisible();
});

test('navigation has Use Cases link', async ({ page }) => {
  await page.goto('/');
  // Desktop nav
  const desktopNav = page.locator('nav.hidden.sm\\:flex');
  await expect(desktopNav.getByRole('link', { name: 'Use Cases' })).toBeVisible();
});

test('use case with BPMN shows diagram', async ({ page }) => {
  await page.goto('/use-cases/checkout');
  // Check for BPMN badge
  await expect(page.getByText('BPMN', { exact: true })).toBeVisible();
  // Check for Process Diagram section
  await expect(page.getByText('Process Diagram')).toBeVisible();
  // Wait for BPMN container to render (bpmn-js creates a .djs-container inside)
  await expect(page.locator('.bpmn-container')).toBeVisible();
  // Wait for actual diagram content (djs-container is created by bpmn-js)
  await expect(page.locator('.djs-container')).toBeVisible({ timeout: 5000 });
});
