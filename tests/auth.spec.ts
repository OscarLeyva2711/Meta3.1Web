import { test, expect } from '@playwright/test';
import { TEST_USER, INVALID_USER, MALFORMED_USER } from './fixtures/users';
import {
  ensureTestUser,
  loginJWT,
  expectAuthenticated,
  loginViaAPI
} from './helpers/auth';

test.describe('Autenticación con JWT', () => {

  // Garantizar que el usuario existe antes de los tests del describe.
  test.beforeAll(async () => {
    await ensureTestUser();
  });

  test.beforeEach(async ({ page }) => {
    // Limpiar cualquier sesión previa
    await page.context().clearCookies();
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
    });
  });

  test('Login con credenciales VÁLIDAS redirige al dashboard y guarda el token', async ({ page }) => {
    await loginJWT(page, TEST_USER.email, TEST_USER.password);
    await expectAuthenticated(page);

    // Token guardado en localStorage
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token, 'el JWT debe quedar persistido en localStorage').toBeTruthy();
    expect(token!.startsWith('eyJ'), 'debe verse como un JWT codificado en Base64').toBe(true);
  });

  test('Login con credenciales INVÁLIDAS muestra error y permanece en /login', async ({ page }) => {
    await loginJWT(page, INVALID_USER.email, INVALID_USER.password);
    await expect(page).toHaveURL(/\/login/);
    // Snackbar o error visible
    const snackbar = page.locator('[data-test="login-snackbar"]');
    await expect(snackbar).toBeVisible({ timeout: 5_000 });
    await expect(snackbar).toContainText(/incorrectos|error|inválid/i);

    // No se debe haber guardado token
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeNull();
  });

  test('Login con email MALFORMADO muestra validación local sin llamar al backend', async ({ page }) => {
    await page.goto('/login');
    await page.locator('[data-test="login-email"] input').fill(MALFORMED_USER.email);
    await page.locator('[data-test="login-password"] input').fill(MALFORMED_USER.password);
    // El botón submit puede estar deshabilitado mientras la validación falla.
    // Forzamos blur para disparar la validación de Vuetify.
    await page.locator('[data-test="login-password"] input').blur();
    // Mensaje de validación visible
    await expect(page.locator('text=El email debe ser válido')).toBeVisible();
  });

  test('Acceso directo a / sin autenticación redirige a /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Acceso directo a /tareas sin autenticación redirige a /login', async ({ page }) => {
    await page.goto('/tareas');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Logout limpia el token y vuelve a /login', async ({ page }) => {
    await loginJWT(page, TEST_USER.email, TEST_USER.password);
    await expectAuthenticated(page);

    await page.locator('[data-test="logout-button"]').click();
    await expect(page).toHaveURL(/\/login/);

    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeNull();
  });

  test('API: login devuelve JWT firmado con datos reales del usuario', async () => {
    // Test directo a la API: validar que el backend valida realmente contra DB
    const { token, csrf } = await loginViaAPI(TEST_USER.email, TEST_USER.password);
    expect(token).toBeTruthy();
    expect(csrf).toBeTruthy();

    // Decodificar payload (parte central del JWT)
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString('utf-8')
    );
    expect(payload.email).toBe(TEST_USER.email);
    expect(payload.id).toBeGreaterThan(0);
  });

  test('API: login con credenciales inválidas devuelve 401', async ({ request }) => {
    const res = await request.post('https://localhost:3000/api/auth/login', {
      headers: {
        'x-api-key': 'mi_api_key_secreta_12345',
        'Content-Type': 'application/json'
      },
      data: { email: INVALID_USER.email, password: INVALID_USER.password }
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('API: login sin x-api-key devuelve 401', async ({ request }) => {
    const res = await request.post('https://localhost:3000/api/auth/login', {
      headers: { 'Content-Type': 'application/json' },
      data: { email: TEST_USER.email, password: TEST_USER.password }
    });
    expect(res.status()).toBe(401);
  });
});

test.describe('OAuth Google (flujo simulado)', () => {

  // El flujo OAuth real con Google no se automatiza desde Playwright sin OAuth
  // app dedicada de tests. Validamos lo que SÍ está bajo control del frontend:
  // que el callback procese correctamente el token devuelto por el backend.

  test('Botón "Iniciar con Google" navega al endpoint del backend', async ({ page }) => {
    await page.goto('/login');

    // Interceptamos la navegación para no salir hacia accounts.google.com
    let navigationURL = '';
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        navigationURL = frame.url();
      }
    });

    // Bloqueamos el endpoint del backend para no iniciar el flujo real
    await page.route('https://localhost:3000/api/auth/google/login', (route) =>
      route.fulfill({ status: 200, body: 'mocked' })
    );

    await page.locator('[data-test="login-google"]').click();
    await page.waitForLoadState('networkidle').catch(() => { /* OK si no responde */ });

    expect(navigationURL).toContain('/api/auth/google/login');
  });

  test('Callback OAuth con token válido guarda el token y redirige al dashboard', async ({ page }) => {
    // Generamos un JWT real haciendo login en el backend (simulando lo que haría
    // googleAuth.controller tras autenticar al usuario en Google).
    await ensureTestUser();
    const { token } = await loginViaAPI(TEST_USER.email, TEST_USER.password);

    // Visitamos la URL exacta que el backend usaría como redirect
    await page.goto(`/oauth-callback?token=${encodeURIComponent(token)}&email=${encodeURIComponent(TEST_USER.email)}`);

    // El componente debe procesar el token y eventualmente llevarnos al dashboard
    await page.waitForURL(/\/(tareas)?$/, { timeout: 10_000 });

    // Token persistido
    const stored = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(stored).toBe(token);

    // Email persistido
    const email = await page.evaluate(() => localStorage.getItem('userEmail'));
    expect(email).toBe(TEST_USER.email);

    // Header autenticado
    await expect(page.locator('[data-test="logout-button"]')).toBeVisible();
  });

  test('Callback OAuth con error en query redirige al login mostrando el error', async ({ page }) => {
    await page.goto('/oauth-callback?error=auth_error');
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    // El mensaje de error es visible
    await expect(page.locator('[data-test="login-snackbar"]')).toBeVisible({ timeout: 5_000 });
  });

  test('Callback OAuth sin token redirige a login', async ({ page }) => {
    await page.goto('/oauth-callback');
    await page.waitForURL(/\/login/, { timeout: 10_000 });
  });
});
