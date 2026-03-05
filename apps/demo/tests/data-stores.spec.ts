import { expect, test } from '@playwright/test';

test('data store list page loads', async ({ page }) => {
  await page.goto('/data-stores');
  await expect(page.getByRole('heading', { name: 'Data Stores', level: 1 })).toBeVisible();
  await expect(page.getByText('Browse all 4 data stores')).toBeVisible();
});

test('shows correct data store count', async ({ page }) => {
  await page.goto('/data-stores');
  const cards = page.locator('a[href^="/data-stores/"]');
  await expect(cards).toHaveCount(4);
});

test('navigates to data store detail', async ({ page }) => {
  await page.goto('/data-stores');
  await page.getByRole('link', { name: 'Orders Database' }).click();
  await expect(page).toHaveURL('/data-stores/orders-db');
  await expect(page.getByRole('heading', { name: 'Orders Database' })).toBeVisible();
});

test('detail shows type badge', async ({ page }) => {
  await page.goto('/data-stores/orders-db');
  await expect(page.getByText('database', { exact: true })).toBeVisible();
});

test('detail shows technology', async ({ page }) => {
  await page.goto('/data-stores/orders-db');
  await expect(page.getByText('PostgreSQL')).toBeVisible();
});

test('detail shows owner service link', async ({ page }) => {
  await page.goto('/data-stores/orders-db');
  await expect(page.getByText('Owner Service')).toBeVisible();
  await page.getByRole('link', { name: 'Orders Service' }).click();
  await expect(page).toHaveURL('/services/orders-service');
});

test('service detail shows owned data stores', async ({ page }) => {
  await page.goto('/services/orders-service');
  await expect(page.getByText('Data Stores (2)')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Orders Database' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Events Queue' })).toBeVisible();
});

test('domain detail shows data stores', async ({ page }) => {
  await page.goto('/domains/commerce');
  await expect(page.getByText('Data Stores (3)')).toBeVisible();
});

test('home page shows data store count', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /4.*Data Stores/i })).toBeVisible();
});

test('navigation has Data Stores link', async ({ page }) => {
  await page.goto('/');
  const desktopNav = page.locator('nav.hidden.sm\\:flex');
  await expect(desktopNav.getByRole('link', { name: 'Data Stores' })).toBeVisible();
});
