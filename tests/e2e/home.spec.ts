import { expect, test } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Service Catalog/);
});

test('shows service count', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: '6 Services' })).toBeVisible();
});

test('navigates to services list', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'View all →' }).click();
  await expect(page).toHaveURL('/services');
  await expect(page.getByText('Browse all 6 services')).toBeVisible();
});

test('displays all services on services page', async ({ page }) => {
  await page.goto('/services');
  await expect(page.getByText('Auth Service')).toBeVisible();
  await expect(page.getByText('Billing Service')).toBeVisible();
  await expect(page.getByText('Orders Service')).toBeVisible();
});

test('navigates to service detail', async ({ page }) => {
  await page.goto('/services');
  await page.getByRole('link', { name: 'Auth Service' }).click();
  await expect(page).toHaveURL('/services/auth-service');
  await expect(page.getByRole('heading', { name: 'Auth Service' })).toBeVisible();
  await expect(page.getByText('OIDC identity provider')).toBeVisible();
});

test('service detail shows back link', async ({ page }) => {
  await page.goto('/services/auth-service');
  await page.getByRole('link', { name: '← Back to Services' }).click();
  await expect(page).toHaveURL('/services');
});
