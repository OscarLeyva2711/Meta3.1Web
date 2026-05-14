import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/users';
import { ensureTestUser, expectAuthenticated, loginJWT } from './helpers/auth';

test.describe('Flujo principal con JWT', () => {
  test.beforeAll(async () => {
    await ensureTestUser();
  });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
    });
  });

  test('login JWT, creación, modificación y eliminación de una tarea', async ({ page }) => {
    const stamp = Date.now();
    const tituloInicial = `JWT CRUD inicial ${stamp}`;
    const tituloEditado = `JWT CRUD editada ${stamp}`;
    const descripcion = 'Tarea creada desde Playwright usando login con JWT';

    await loginJWT(page, TEST_USER.email, TEST_USER.password);
    await expectAuthenticated(page);

    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token, 'el login JWT debe guardar el token').toBeTruthy();

    await page.locator('[data-test="new-task-button"]').first().click();
    await page.locator('[data-test="form-titulo"] input').fill(tituloInicial);
    await page.locator('[data-test="form-descripcion"] textarea').fill(descripcion);
    await page.locator('[data-test="form-submit"]').click();

    await expect(page.locator('[data-test="app-snackbar"]')).toContainText(/creada/i);
    await expect(page.locator('.v-list-item', { hasText: tituloInicial }).first()).toBeVisible();

    const tarea = page.locator('.v-list-item', { hasText: tituloInicial }).first();
    await tarea.locator('button:has(.mdi-pencil)').click();
    await page.locator('[data-test="form-titulo"] input').fill(tituloEditado);
    await page.locator('[data-test="form-submit"]').click();

    await expect(page.locator('[data-test="app-snackbar"]')).toContainText(/actualizada/i);
    await expect(page.locator('.v-list-item', { hasText: tituloEditado }).first()).toBeVisible();
    await expect(page.locator(`text=${tituloInicial}`)).toHaveCount(0);

    const tareaEditada = page.locator('.v-list-item', { hasText: tituloEditado }).first();
    await tareaEditada.locator('button:has(.mdi-delete)').click();
    await page.locator('[data-test="confirm-delete"]').click();

    await expect(page.locator('[data-test="app-snackbar"]')).toContainText(/eliminada/i);
    await expect(page.locator(`text=${tituloEditado}`)).toHaveCount(0);
  });
});
