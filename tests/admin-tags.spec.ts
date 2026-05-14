import { test, expect } from '@playwright/test';
import { TEST_USER, ADMIN_USER } from './fixtures/users';
import { ensureTestUser, loginJWT, expectAuthenticated, loginViaAPI } from './helpers/auth';

test.describe.configure({ mode: 'serial' });

test.describe('Gestión de usuarios por Admin', () => {

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

  test('Admin puede ver el panel de administración', async ({ page }) => {
    await loginJWT(page, ADMIN_USER.email, ADMIN_USER.password);
    await expectAuthenticated(page);

    // El botón de admin debe ser visible
    await expect(page.locator('[data-test="admin-panel-button"]')).toBeVisible();
  });

  test('Admin puede crear un nuevo usuario', async ({ page }) => {
    const nuevoEmail = `nuevo-${Date.now()}@test.local`;
    const nuevoNombre = 'Usuario Nuevo';

    await loginJWT(page, ADMIN_USER.email, ADMIN_USER.password);
    await expectAuthenticated(page);

    // Cambiar a modo admin
    await page.locator('[data-test="admin-panel-button"]').click();
    await expect(page.locator('[data-test="admin-panel"]')).toBeVisible();

    // Crear usuario
    await page.locator('[data-test="admin-user-name"] input').fill(nuevoNombre);
    await page.locator('[data-test="admin-user-email"] input').fill(nuevoEmail);
    await page.locator('[data-test="admin-user-password"] input').fill('Password123');
    // El rol por defecto ya es 'usuario', así que no necesitamos cambiarlo
    await page.locator('[data-test="admin-user-create"]').click();

    // Esperar un momento para que la petición se procese
    await page.waitForTimeout(2000);

    // Verificar que el usuario aparece en la lista (esto confirma que se creó)
    await expect(page.locator(`text=${nuevoEmail}`)).toBeVisible({ timeout: 5_000 });
  });

  test('Admin puede activar/desactivar usuarios', async ({ page }) => {
    await loginJWT(page, ADMIN_USER.email, ADMIN_USER.password);
    await expectAuthenticated(page);

    // Cambiar a modo admin
    await page.locator('[data-test="admin-panel-button"]').click();
    await expect(page.locator('[data-test="admin-panel"]')).toBeVisible();

    // Buscar el usuario de prueba
    const usuarioRow = page.locator('[data-test="admin-user-list"] .v-list-item').filter({ hasText: TEST_USER.email }).first();
    await expect(usuarioRow).toBeVisible();

    // Desactivar
    await usuarioRow.locator('button:has-text("Desactivar")').click();
    const snack = page.locator('[data-test="app-snackbar"]');
    await expect(snack).toBeVisible({ timeout: 5_000 });

    // Reactivar
    await usuarioRow.locator('button:has-text("Activar")').click();
    await expect(snack).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('Búsquedas por etiquetas', () => {

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

  test('Usuario normal puede crear etiquetas', async ({ page }) => {
    const nombreTag = `tag-${Date.now()}`;

    await loginJWT(page, TEST_USER.email, TEST_USER.password);
    await expectAuthenticated(page);

    // Crear etiqueta
    await page.locator('[data-test="new-tag-input"] input').fill(nombreTag);
    await page.locator('[data-test="new-tag-button"]').click();

    // Snackbar de éxito
    const snack = page.locator('[data-test="app-snackbar"]');
    await expect(snack).toBeVisible({ timeout: 5_000 });
    await expect(snack).toContainText(/creada/i);
  });

  test('Usuario normal puede buscar tareas por etiquetas', async ({ page }) => {
    // Primero crear una etiqueta y una tarea con esa etiqueta
    const nombreTag = `tag-search-${Date.now()}`;
    const tituloTarea = `Tarea con tag ${Date.now()}`;

    await loginJWT(page, TEST_USER.email, TEST_USER.password);
    await expectAuthenticated(page);

    // Crear etiqueta
    await page.locator('[data-test="new-tag-input"] input').fill(nombreTag);
    await page.locator('[data-test="new-tag-button"]').click();
    await expect(page.locator('[data-test="app-snackbar"]')).toBeVisible({ timeout: 5_000 });

    // Crear tarea con etiqueta
    await page.locator('[data-test="new-task-button"]').click();
    await page.locator('[data-test="form-titulo"] input').fill(tituloTarea);
    // Seleccionar la etiqueta creada
    await page.locator('[data-test="form-tags"]').click();
    await page.locator(`text=${nombreTag}`).click();
    await page.locator('[data-test="form-submit"]').click();
    await expect(page.locator('[data-test="app-snackbar"]')).toContainText(/creada/i);

    // Buscar por etiqueta
    await page.locator('[data-test="tag-filter"]').click();
    await page.locator(`text=${nombreTag}`).click();

    // La tarea debe aparecer
    await expect(page.locator(`text=${tituloTarea}`)).toBeVisible();
  });

  test('Admin puede buscar usuarios por etiquetas', async ({ page }) => {
    await loginJWT(page, ADMIN_USER.email, ADMIN_USER.password);
    await expectAuthenticated(page);

    // Cambiar a modo admin
    await page.locator('[data-test="admin-panel-button"]').click();
    await expect(page.locator('[data-test="admin-panel"]')).toBeVisible();

    // Seleccionar una etiqueta (si hay alguna)
    const tagFilter = page.locator('[data-test="admin-tag-search"]');
    if (await tagFilter.isVisible()) {
      await tagFilter.click();
      // Seleccionar primera etiqueta disponible
      const firstTag = page.locator('.v-list-item').first();
      if (await firstTag.isVisible()) {
        await firstTag.click();
        await page.locator('[data-test="admin-search-users-tags"]').click();

        // Verificar que se muestran resultados
        const results = page.locator('[data-test="admin-search-results"]');
        await expect(results).toBeVisible({ timeout: 5_000 });
      }
    }
  });

  test('Admin puede buscar tareas por etiquetas (scope all)', async ({ page }) => {
    await loginJWT(page, ADMIN_USER.email, ADMIN_USER.password);
    await expectAuthenticated(page);

    // Cambiar a modo admin
    await page.locator('[data-test="admin-panel-button"]').click();
    await expect(page.locator('[data-test="admin-panel"]')).toBeVisible();

    // Seleccionar una etiqueta (si hay alguna)
    const tagFilter = page.locator('[data-test="admin-tag-search"]');
    if (await tagFilter.isVisible()) {
      await tagFilter.click();
      // Seleccionar primera etiqueta disponible
      const firstTag = page.locator('.v-list-item').first();
      if (await firstTag.isVisible()) {
        await firstTag.click();
        await page.locator('[data-test="admin-search-tasks-tags"]').click();

        // Verificar que se muestran resultados
        const results = page.locator('[data-test="admin-search-results"]');
        await expect(results).toBeVisible({ timeout: 5_000 });
      }
    }
  });

  test('Admin puede buscar etiquetas por usuarios', async ({ page }) => {
    await loginJWT(page, ADMIN_USER.email, ADMIN_USER.password);
    await expectAuthenticated(page);

    // Cambiar a modo admin
    await page.locator('[data-test="admin-panel-button"]').click();
    await expect(page.locator('[data-test="admin-panel"]')).toBeVisible();

    // Seleccionar un usuario
    const userFilter = page.locator('[data-test="admin-user-search"]');
    if (await userFilter.isVisible()) {
      await userFilter.click();
      // Seleccionar primer usuario disponible
      const firstUser = page.locator('.v-list-item').first();
      if (await firstUser.isVisible()) {
        await firstUser.click();
        await page.locator('[data-test="admin-search-tags-users"]').click();

        // Verificar que se muestran resultados
        const results = page.locator('[data-test="admin-search-results"]');
        await expect(results).toBeVisible({ timeout: 5_000 });
      }
    }
  });
});
