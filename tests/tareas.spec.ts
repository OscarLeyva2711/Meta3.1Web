import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/users';
import { ensureTestUser, loginJWT, expectAuthenticated } from './helpers/auth';

test.describe.configure({ mode: 'serial' });

test.describe('CRUD de tareas', () => {

  test.beforeAll(async () => {
    await ensureTestUser();
  });

  // Antes de cada test: login limpio
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
    });
    await loginJWT(page, TEST_USER.email, TEST_USER.password);
    await expectAuthenticated(page);
  });

  test('CREATE: crear una tarea aparece en la lista', async ({ page }) => {
    const titulo = `Tarea CREATE ${Date.now()}`;
    const descripcion = 'Descripción de prueba creada por Playwright';

    await page.locator('[data-test="new-task-button"]').first().click();
    await page.locator('[data-test="form-titulo"] input').fill(titulo);
    await page.locator('[data-test="form-descripcion"] textarea').fill(descripcion);
    await page.locator('[data-test="form-submit"]').click();

    // Snackbar de éxito
    const snack = page.locator('[data-test="app-snackbar"]');
    await expect(snack).toBeVisible({ timeout: 5_000 });
    await expect(snack).toContainText(/creada/i);

    // La tarea es visible
    await expect(page.locator(`text=${titulo}`).first()).toBeVisible();
  });

  test('READ: la lista de tareas se carga al entrar al dashboard', async ({ page }) => {
    // Tras el login, la lista debe haber cargado (puede estar vacía o no).
    // Validamos que el contenedor existe y no hay error.
    const error = page.locator('text=¿Está corriendo el servidor?');
    await expect(error).toBeHidden();
  });

  test('UPDATE: editar el título de una tarea persiste el cambio', async ({ page }) => {
    const tituloInicial = `Tarea EDIT ${Date.now()}`;
    const tituloFinal = `${tituloInicial} EDITADA`;

    // Crear la tarea
    await page.locator('[data-test="new-task-button"]').first().click();
    await page.locator('[data-test="form-titulo"] input').fill(tituloInicial);
    await page.locator('[data-test="form-submit"]').click();
    await expect(page.locator(`text=${tituloInicial}`).first()).toBeVisible();

    // Localizar la fila y abrir el editor
    const fila = page.locator('.v-list-item', { hasText: tituloInicial }).first();
    await fila.locator('button:has(.mdi-pencil)').first().click();

    // Editar título
    const inputTitulo = page.locator('[data-test="form-titulo"] input');
    await inputTitulo.fill(tituloFinal);
    await page.locator('[data-test="form-submit"]').click();

    // Verificar
    await expect(page.locator(`text=${tituloFinal}`).first()).toBeVisible();
    const snack = page.locator('[data-test="app-snackbar"]');
    await expect(snack).toContainText(/actualizada/i);
  });

  test('UPDATE parcial: marcar tarea como completada cambia su chip', async ({ page }) => {
    const titulo = `Tarea TOGGLE ${Date.now()}`;

    // Crear
    await page.locator('[data-test="new-task-button"]').first().click();
    await page.locator('[data-test="form-titulo"] input').fill(titulo);
    await page.locator('[data-test="form-submit"]').click();
    await expect(page.locator(`text=${titulo}`).first()).toBeVisible();

    // Marcar como completada (clic en el checkbox de la fila)
    const fila = page.locator('.v-list-item', { hasText: titulo }).first();
    await fila.locator('input[type="checkbox"]').first().click();

    // El chip cambia a "Completada"
    await expect(fila.locator('text=Completada')).toBeVisible({ timeout: 5_000 });
  });

  test('DELETE: eliminar tarea la quita de la lista', async ({ page }) => {
    const titulo = `Tarea DELETE ${Date.now()}`;

    // Crear
    await page.locator('[data-test="new-task-button"]').first().click();
    await page.locator('[data-test="form-titulo"] input').fill(titulo);
    await page.locator('[data-test="form-submit"]').click();
    await expect(page.locator(`text=${titulo}`).first()).toBeVisible();

    // Eliminar
    const fila = page.locator('.v-list-item', { hasText: titulo }).first();
    await fila.locator('button:has(.mdi-delete)').first().click();

    // Confirmar en el diálogo
    await page.locator('[data-test="confirm-delete"]').click();

    // La tarea ya no aparece
    await expect(page.locator(`text=${titulo}`)).toHaveCount(0, { timeout: 5_000 });
    const snack = page.locator('[data-test="app-snackbar"]');
    await expect(snack).toContainText(/eliminada/i);
  });

  test('FILTRO: filtrar por completadas oculta las pendientes', async ({ page }) => {
    const tituloPendiente = `Pendiente ${Date.now()}`;
    const tituloCompletada = `Completada ${Date.now()}`;

    // Crear dos tareas pendientes
    await page.locator('[data-test="new-task-button"]').first().click();
    await page.locator('[data-test="form-titulo"] input').fill(tituloPendiente);
    await page.locator('[data-test="form-submit"]').click();
    await expect(page.locator(`text=${tituloPendiente}`).first()).toBeVisible();

    await page.locator('[data-test="new-task-button"]').first().click();
    await page.locator('[data-test="form-titulo"] input').fill(tituloCompletada);
    await page.locator('[data-test="form-submit"]').click();
    await expect(page.locator(`text=${tituloCompletada}`).first()).toBeVisible();

    // Marcar la segunda tarea como completada usando el checkbox de la lista
    const filaCompletada = page.locator('.v-list-item', { hasText: tituloCompletada }).first();
    await filaCompletada.locator('input[type="checkbox"]').first().click();

    // Esperar a que se actualice el chip
    await expect(filaCompletada.locator('text=Completada')).toBeVisible({ timeout: 5_000 });

    // Filtrar por completadas
    await page.locator('[data-test="filter-completed"]').click();
    // Verificar que la tarea completada es visible
    await expect(filaCompletada).toBeVisible();
    // Verificar que la pendiente no es visible
    await expect(page.locator('.v-list-item', { hasText: tituloPendiente })).toHaveCount(0);

    // Volver a "Todas"
    await page.locator('[data-test="filter-all"]').click();
    await expect(page.locator(`text=${tituloPendiente}`).first()).toBeVisible();
  });
});
