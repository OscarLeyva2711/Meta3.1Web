# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Autenticación con JWT >> Logout limpia el token y vuelve a /login
- Location: tests/auth.spec.ts:71:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/(tareas)?$/
Received string:  "https://localhost:5173/login"
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    24 × unexpected value "https://localhost:5173/login"

```

```yaml
- main:
  - text: Iniciar Sesión Email
  - textbox "Email": playwright@test.local
  - alert
  - text: Contraseña
  - textbox "Contraseña": TestPass1234
  - alert
  - separator
  - text: O
  - separator
  - button "Iniciar con Google"
  - paragraph:
    - text: ¿No tienes cuenta?
    - link "Regístrate aquí":
      - /url: /register
  - button "Iniciar Sesión"
```

# Test source

```ts
  1   | import { Page, expect, APIRequestContext, request } from '@playwright/test';
  2   | import { TEST_USER } from '../fixtures/users';
  3   | 
  4   | const API_URL = 'https://localhost:3000/api';
  5   | const API_KEY = 'mi_api_key_secreta_12345';
  6   | 
  7   | /**
  8   |  * Asegura que el usuario de prueba existe en la base de datos.
  9   |  * Si no existe lo crea via /api/usuarios/registro. Es idempotente.
  10  |  */
  11  | export async function ensureTestUser(): Promise<void> {
  12  |   const ctx = await request.newContext({ ignoreHTTPSErrors: true });
  13  |   try {
  14  |     const res = await ctx.post(`${API_URL}/usuarios/registro`, {
  15  |       data: {
  16  |         nombre: TEST_USER.nombre,
  17  |         email: TEST_USER.email,
  18  |         password: TEST_USER.password,
  19  |         passwordConfirm: TEST_USER.password
  20  |       }
  21  |     });
  22  |     // 201 = creado, 409 = ya existe; ambos son OK.
  23  |     const status = res.status();
  24  |     if (status !== 201 && status !== 409) {
  25  |       const body = await res.text();
  26  |       throw new Error(`No se pudo asegurar el usuario de prueba (status ${status}): ${body}`);
  27  |     }
  28  |   } finally {
  29  |     await ctx.dispose();
  30  |   }
  31  | }
  32  | 
  33  | /**
  34  |  * Ejecuta el flujo de login JWT vía la UI.
  35  |  */
  36  | export async function loginJWT(page: Page, email: string, password: string): Promise<void> {
  37  |   await page.goto('/login');
  38  |   await page.locator('[data-test="login-email"] input').fill(email);
  39  |   await page.locator('[data-test="login-password"] input').fill(password);
  40  |   await page.locator('[data-test="login-submit"]').click();
  41  | }
  42  | 
  43  | /**
  44  |  * Verifica que el usuario está en el dashboard autenticado.
  45  |  */
  46  | export async function expectAuthenticated(page: Page): Promise<void> {
> 47  |   await expect(page).toHaveURL(/\/(tareas)?$/, { timeout: 10_000 });
      |                      ^ Error: expect(page).toHaveURL(expected) failed
  48  |   // Hay header de la app (botón logout es visible cuando isAuthenticated)
  49  |   await expect(page.locator('[data-test="logout-button"]')).toBeVisible();
  50  | }
  51  | 
  52  | /**
  53  |  * Crea una tarea directamente vía API para pruebas que necesitan datos preexistentes.
  54  |  * Devuelve el id de la tarea creada.
  55  |  */
  56  | export async function createTaskViaAPI(token: string, csrf: string, titulo: string): Promise<number> {
  57  |   const ctx = await request.newContext({ ignoreHTTPSErrors: true });
  58  |   try {
  59  |     const res = await ctx.post(`${API_URL}/tareas`, {
  60  |       headers: {
  61  |         'Authorization': `Bearer ${token}`,
  62  |         'Content-Type': 'application/json'
  63  |       },
  64  |       data: { titulo, persona_id: 1, estado: 'pendiente' }
  65  |     });
  66  |     if (!res.ok()) {
  67  |       throw new Error(`Error creando tarea via API: ${res.status()} ${await res.text()}`);
  68  |     }
  69  |     const json = await res.json();
  70  |     return json.data.id;
  71  |   } finally {
  72  |     await ctx.dispose();
  73  |   }
  74  | }
  75  | 
  76  | /**
  77  |  * Hace login vía API y devuelve el JWT y los headers necesarios.
  78  |  */
  79  | export async function loginViaAPI(email: string, password: string): Promise<{ token: string; csrf: string }> {
  80  |   const ctx = await request.newContext({ ignoreHTTPSErrors: true });
  81  |   try {
  82  |     const res = await ctx.post(`${API_URL}/auth/login`, {
  83  |       headers: {
  84  |         'x-api-key': API_KEY,
  85  |         'Content-Type': 'application/json'
  86  |       },
  87  |       data: { email, password }
  88  |     });
  89  |     if (!res.ok()) {
  90  |       throw new Error(`Login API falló: ${res.status()} ${await res.text()}`);
  91  |     }
  92  |     const json = await res.json();
  93  |     return { token: json.token, csrf: json.data.csrfToken };
  94  |   } finally {
  95  |     await ctx.dispose();
  96  |   }
  97  | }
  98  | 
  99  | /**
  100 |  * Inyecta un token directamente en localStorage del navegador, simulando que el
  101 |  * usuario ya está autenticado. Útil para tests que no necesitan reproducir
  102 |  * el flujo UI completo de login en cada caso.
  103 |  */
  104 | export async function injectTokenInBrowser(page: Page, token: string): Promise<void> {
  105 |   await page.goto('/login'); // necesitamos un origen para acceder a localStorage
  106 |   await page.evaluate((t) => {
  107 |     localStorage.setItem('authToken', t);
  108 |   }, token);
  109 | }
  110 | 
```