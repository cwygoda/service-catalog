import { expect, test } from '@playwright/test';

test('search button opens search modal', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Search catalog' }).click();
  await expect(page.getByRole('dialog', { name: 'Search catalog' })).toBeVisible();
});

test('Ctrl+K opens search modal', async ({ page }) => {
  await page.goto('/');
  // Ensure page has focus before keyboard shortcut
  await page.locator('body').click();
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog', { name: 'Search catalog' })).toBeVisible();
});

test('Escape closes search modal', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Search catalog' }).click();
  await expect(page.getByRole('dialog', { name: 'Search catalog' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Search catalog' })).not.toBeVisible();
});

test('search for "Orders" returns results', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Search catalog' }).click();
  const dialog = page.getByRole('dialog', { name: 'Search catalog' });
  await dialog.getByRole('textbox').fill('Orders');
  // Wait for search results to appear in the listbox
  await expect(dialog.getByRole('listbox')).toBeVisible({ timeout: 5000 });
  await expect(dialog.getByText('Orders Service', { exact: true })).toBeVisible();
});

test('clicking search result navigates', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Search catalog' }).click();
  const dialog = page.getByRole('dialog', { name: 'Search catalog' });
  await dialog.getByRole('textbox').fill('Orders');
  await expect(dialog.getByRole('listbox')).toBeVisible({ timeout: 5000 });
  await dialog.getByText('Orders Service', { exact: true }).click();
  await expect(page).toHaveURL(/\/services\/orders-service/);
});

test('empty search shows no results message', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Search catalog' }).click();
  const dialog = page.getByRole('dialog', { name: 'Search catalog' });
  await dialog.getByRole('textbox').fill('xyznonexistent');
  await expect(dialog.getByText('No results for "xyznonexistent"')).toBeVisible({ timeout: 5000 });
});
