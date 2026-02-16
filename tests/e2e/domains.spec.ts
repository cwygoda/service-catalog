import { expect, test } from '@playwright/test';

test('domain list page loads', async ({ page }) => {
  await page.goto('/domains');
  await expect(page.getByRole('heading', { name: 'Domains', level: 1 })).toBeVisible();
  await expect(page.getByText('Browse all 2 business domains')).toBeVisible();
});

test('shows correct domain count', async ({ page }) => {
  await page.goto('/domains');
  const cards = page.locator('a[href^="/domains/"]');
  await expect(cards).toHaveCount(2);
});

test('domain card shows use case and service counts', async ({ page }) => {
  await page.goto('/domains');
  // Commerce domain has 1 use case and 3 services
  const commerceCard = page.locator('a[href="/domains/commerce"]');
  await expect(commerceCard.getByText('1 use case')).toBeVisible();
  await expect(commerceCard.getByText('3 services')).toBeVisible();
});

test('navigates to domain detail', async ({ page }) => {
  await page.goto('/domains');
  await page.getByRole('link', { name: 'Commerce' }).click();
  await expect(page).toHaveURL('/domains/commerce');
  await expect(page.getByRole('heading', { name: 'Commerce' })).toBeVisible();
});

test('domain detail shows use cases first', async ({ page }) => {
  await page.goto('/domains/commerce');
  await expect(page.getByText('Use Cases (1)')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Customer Checkout' })).toBeVisible();
});

test('domain detail shows services', async ({ page }) => {
  await page.goto('/domains/commerce');
  await expect(page.getByText('Services (3)')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Orders Service' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Billing Service' })).toBeVisible();
});

test('domain detail breadcrumb navigation works', async ({ page }) => {
  await page.goto('/domains/commerce');
  // Breadcrumbs: Domains / Commerce
  await page
    .getByRole('navigation', { name: 'Breadcrumb' })
    .getByRole('link', { name: 'Domains' })
    .click();
  await expect(page).toHaveURL('/domains');
});

test('home page shows domain count', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /2.*Domains/i })).toBeVisible();
});

test('navigation has Domains link', async ({ page }) => {
  await page.goto('/');
  const desktopNav = page.locator('nav.hidden.sm\\:flex');
  await expect(desktopNav.getByRole('link', { name: 'Domains' })).toBeVisible();
});

test('can navigate from domain to use case to service', async ({ page }) => {
  // Start at domain
  await page.goto('/domains/commerce');

  // Click use case
  await page.getByRole('link', { name: 'Customer Checkout' }).click();
  await expect(page).toHaveURL('/use-cases/checkout');

  // Click participating service
  await page
    .getByRole('link', { name: /Orders Service/i })
    .first()
    .click();
  await expect(page).toHaveURL('/services/orders-service');
});
