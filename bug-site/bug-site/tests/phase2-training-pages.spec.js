import { test, expect } from '@playwright/test';

test.describe('Phase 2 training pages', () => {
    test('should render the analytics training page at /analytics', async ({ page }) => {
        await page.goto('/analytics');
        await expect(page.getByRole('heading', { name: /analytics training/i })).toBeVisible();
    });

    test('should render the user management training page at /users', async ({ page }) => {
        await page.goto('/users');
        await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible();
    });

    test('should expose role-management controls on the users page', async ({ page }) => {
        await page.goto('/users');
        await expect(page.getByText(/role management/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /promote/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /reset token/i })).toBeVisible();
    });
});
