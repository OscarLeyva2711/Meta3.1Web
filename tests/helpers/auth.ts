import { Page, expect, APIRequestContext, request } from '@playwright/test';
import { TEST_USER } from '../fixtures/users';

const API_URL = 'https://localhost:3000/api';
const API_KEY = 'mi_api_key_secreta_12345';

/**
 * Asegura que el usuario de prueba existe en la base de datos.
 * Si no existe lo crea via /api/usuarios/registro. Es idempotente.
 */
export async function ensureTestUser(): Promise<void> {
  const ctx = await request.newContext({ ignoreHTTPSErrors: true });
  try {
    const res = await ctx.post(`${API_URL}/usuarios/registro`, {
      data: {
        nombre: TEST_USER.nombre,
        email: TEST_USER.email,
        password: TEST_USER.password,
        passwordConfirm: TEST_USER.password
      }
    });
    // 201 = creado, 409 = ya existe; ambos son OK.
    const status = res.status();
    if (status !== 201 && status !== 409) {
      const body = await res.text();
      throw new Error(`No se pudo asegurar el usuario de prueba (status ${status}): ${body}`);
    }
  } finally {
    await ctx.dispose();
  }
}

/**
 * Ejecuta el flujo de login JWT vía la UI.
 */
export async function loginJWT(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.locator('[data-test="login-email"] input').fill(email);
  await page.locator('[data-test="login-password"] input').fill(password);
  await page.locator('[data-test="login-submit"]').click();
}

/**
 * Verifica que el usuario está en el dashboard autenticado.
 */
export async function expectAuthenticated(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/(tareas)?$/, { timeout: 10_000 });
  // Hay header de la app (botón logout es visible cuando isAuthenticated)
  await expect(page.locator('[data-test="logout-button"]')).toBeVisible();
}

/**
 * Crea una tarea directamente vía API para pruebas que necesitan datos preexistentes.
 * Devuelve el id de la tarea creada.
 */
export async function createTaskViaAPI(token: string, csrf: string, titulo: string): Promise<number> {
  const ctx = await request.newContext({ ignoreHTTPSErrors: true });
  try {
    const res = await ctx.post(`${API_URL}/tareas`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: { titulo, persona_id: 1, estado: 'pendiente' }
    });
    if (!res.ok()) {
      throw new Error(`Error creando tarea via API: ${res.status()} ${await res.text()}`);
    }
    const json = await res.json();
    return json.data.id;
  } finally {
    await ctx.dispose();
  }
}

/**
 * Hace login vía API y devuelve el JWT y los headers necesarios.
 */
export async function loginViaAPI(email: string, password: string): Promise<{ token: string; csrf: string }> {
  const ctx = await request.newContext({ ignoreHTTPSErrors: true });
  try {
    const res = await ctx.post(`${API_URL}/auth/login`, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      data: { email, password }
    });
    if (!res.ok()) {
      throw new Error(`Login API falló: ${res.status()} ${await res.text()}`);
    }
    const json = await res.json();
    return { token: json.token, csrf: json.data.csrfToken };
  } finally {
    await ctx.dispose();
  }
}

/**
 * Inyecta un token directamente en localStorage del navegador, simulando que el
 * usuario ya está autenticado. Útil para tests que no necesitan reproducir
 * el flujo UI completo de login en cada caso.
 */
export async function injectTokenInBrowser(page: Page, token: string): Promise<void> {
  await page.goto('/login'); // necesitamos un origen para acceder a localStorage
  await page.evaluate((t) => {
    localStorage.setItem('authToken', t);
  }, token);
}
