# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-tags.spec.ts >> Gestión de usuarios por Admin >> Admin puede activar/desactivar usuarios
- Location: tests/admin-tags.spec.ts:55:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-test="app-snackbar"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-test="app-snackbar"]')

```

```yaml
- banner:
  - text: Gestión de Tareas
  - button "Tareas"
  - button "Cerrar Sesión"
- main:
  - heading "Administración" [level=1]
  - text: Usuarios Nombre
  - textbox "Nombre"
  - alert
  - text: Email
  - textbox "Email"
  - alert
  - text: Contraseña
  - textbox "Contraseña"
  - alert
  - combobox:
    - text: Rol usuario
    - combobox "Rol": usuario
  - alert
  - button "Crear usuario"
  - text: Lista de usuarios
  - list:
    - listitem:
      - text: Usuario Nuevo - nuevo-1779378254174@test.local usuario · activo
      - button "Desactivar"
    - listitem:
      - text: Prueba - PruebaVisual@prueba.local visualizador · activo
      - button "Desactivar"
    - listitem:
      - text: Usuario Nuevo - nuevo-1778735224624@test.local usuario · activo
      - button "Desactivar"
    - listitem:
      - text: Usuario Nuevo - nuevo-1778735077325@test.local usuario · activo
      - button "Desactivar"
    - listitem:
      - text: Usuario Nuevo - nuevo-1778734754056@test.local usuario · activo
      - button "Desactivar"
    - listitem:
      - text: Administrador - admin@test.local admin · activo
      - button "Desactivar"
    - listitem:
      - text: Usuario Playwright - playwright@test.local usuario · inactivo
      - button "Activar"
    - listitem:
      - text: Nora - prueba2@gmail.com usuario · activo
      - button "Desactivar"
    - listitem:
      - text: Oscar - prueba@gmail.com usuario · activo
      - button "Desactivar"
    - listitem:
      - text: Oscar Leyva Herrera - oscar.leyva@uabc.edu.mx usuario · activo
      - button "Desactivar"
  - text: Búsquedas administrativas
  - combobox:
    - text: Etiquetas
    - combobox "Etiquetas"
  - alert
  - combobox:
    - text: Usuarios
    - combobox "Usuarios"
  - alert
  - button "Usuarios por etiquetas"
  - button "Tareas por etiquetas"
  - button "Etiquetas por usuarios"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { TEST_USER, ADMIN_USER } from './fixtures/users';
  3   | import { ensureTestUser, loginJWT, expectAuthenticated, loginViaAPI } from './helpers/auth';
  4   | 
  5   | test.describe.configure({ mode: 'serial' });
  6   | 
  7   | test.describe('Gestión de usuarios por Admin', () => {
  8   | 
  9   |   test.beforeAll(async () => {
  10  |     await ensureTestUser();
  11  |   });
  12  | 
  13  |   test.beforeEach(async ({ page }) => {
  14  |     await page.context().clearCookies();
  15  |     await page.goto('/login');
  16  |     await page.evaluate(() => {
  17  |       localStorage.removeItem('authToken');
  18  |       localStorage.removeItem('userEmail');
  19  |     });
  20  |   });
  21  | 
  22  |   test('Admin puede ver el panel de administración', async ({ page }) => {
  23  |     await loginJWT(page, ADMIN_USER.email, ADMIN_USER.password);
  24  |     await expectAuthenticated(page);
  25  | 
  26  |     // El botón de admin debe ser visible
  27  |     await expect(page.locator('[data-test="admin-panel-button"]')).toBeVisible();
  28  |   });
  29  | 
  30  |   test('Admin puede crear un nuevo usuario', async ({ page }) => {
  31  |     const nuevoEmail = `nuevo-${Date.now()}@test.local`;
  32  |     const nuevoNombre = 'Usuario Nuevo';
  33  | 
  34  |     await loginJWT(page, ADMIN_USER.email, ADMIN_USER.password);
  35  |     await expectAuthenticated(page);
  36  | 
  37  |     // Cambiar a modo admin
  38  |     await page.locator('[data-test="admin-panel-button"]').click();
  39  |     await expect(page.locator('[data-test="admin-panel"]')).toBeVisible();
  40  | 
  41  |     // Crear usuario
  42  |     await page.locator('[data-test="admin-user-name"] input').fill(nuevoNombre);
  43  |     await page.locator('[data-test="admin-user-email"] input').fill(nuevoEmail);
  44  |     await page.locator('[data-test="admin-user-password"] input').fill('Password123');
  45  |     // El rol por defecto ya es 'usuario', así que no necesitamos cambiarlo
  46  |     await page.locator('[data-test="admin-user-create"]').click();
  47  | 
  48  |     // Esperar un momento para que la petición se procese
  49  |     await page.waitForTimeout(2000);
  50  | 
  51  |     // Verificar que el usuario aparece en la lista (esto confirma que se creó)
  52  |     await expect(page.locator(`text=${nuevoEmail}`)).toBeVisible({ timeout: 5_000 });
  53  |   });
  54  | 
  55  |   test('Admin puede activar/desactivar usuarios', async ({ page }) => {
  56  |     await loginJWT(page, ADMIN_USER.email, ADMIN_USER.password);
  57  |     await expectAuthenticated(page);
  58  | 
  59  |     // Cambiar a modo admin
  60  |     await page.locator('[data-test="admin-panel-button"]').click();
  61  |     await expect(page.locator('[data-test="admin-panel"]')).toBeVisible();
  62  | 
  63  |     // Buscar el usuario de prueba
  64  |     const usuarioRow = page.locator('[data-test="admin-user-list"] .v-list-item').filter({ hasText: TEST_USER.email }).first();
  65  |     await expect(usuarioRow).toBeVisible();
  66  | 
  67  |     // Desactivar
  68  |     await usuarioRow.locator('button:has-text("Desactivar")').click();
  69  |     const snack = page.locator('[data-test="app-snackbar"]');
> 70  |     await expect(snack).toBeVisible({ timeout: 5_000 });
      |                         ^ Error: expect(locator).toBeVisible() failed
  71  | 
  72  |     // Reactivar
  73  |     await usuarioRow.locator('button:has-text("Activar")').click();
  74  |     await expect(snack).toBeVisible({ timeout: 5_000 });
  75  |   });
  76  | });
  77  | 
  78  | test.describe('Búsquedas por etiquetas', () => {
  79  | 
  80  |   test.beforeAll(async () => {
  81  |     await ensureTestUser();
  82  |   });
  83  | 
  84  |   test.beforeEach(async ({ page }) => {
  85  |     await page.context().clearCookies();
  86  |     await page.goto('/login');
  87  |     await page.evaluate(() => {
  88  |       localStorage.removeItem('authToken');
  89  |       localStorage.removeItem('userEmail');
  90  |     });
  91  |   });
  92  | 
  93  |   test('Usuario normal puede crear etiquetas', async ({ page }) => {
  94  |     const nombreTag = `tag-${Date.now()}`;
  95  | 
  96  |     await loginJWT(page, TEST_USER.email, TEST_USER.password);
  97  |     await expectAuthenticated(page);
  98  | 
  99  |     // Crear etiqueta
  100 |     await page.locator('[data-test="new-tag-input"] input').fill(nombreTag);
  101 |     await page.locator('[data-test="new-tag-button"]').click();
  102 | 
  103 |     // Snackbar de éxito
  104 |     const snack = page.locator('[data-test="app-snackbar"]');
  105 |     await expect(snack).toBeVisible({ timeout: 5_000 });
  106 |     await expect(snack).toContainText(/creada/i);
  107 |   });
  108 | 
  109 |   test('Usuario normal puede buscar tareas por etiquetas', async ({ page }) => {
  110 |     // Primero crear una etiqueta y una tarea con esa etiqueta
  111 |     const nombreTag = `tag-search-${Date.now()}`;
  112 |     const tituloTarea = `Tarea con tag ${Date.now()}`;
  113 | 
  114 |     await loginJWT(page, TEST_USER.email, TEST_USER.password);
  115 |     await expectAuthenticated(page);
  116 | 
  117 |     // Crear etiqueta
  118 |     await page.locator('[data-test="new-tag-input"] input').fill(nombreTag);
  119 |     await page.locator('[data-test="new-tag-button"]').click();
  120 |     await expect(page.locator('[data-test="app-snackbar"]')).toBeVisible({ timeout: 5_000 });
  121 | 
  122 |     // Crear tarea con etiqueta
  123 |     await page.locator('[data-test="new-task-button"]').click();
  124 |     await page.locator('[data-test="form-titulo"] input').fill(tituloTarea);
  125 |     // Seleccionar la etiqueta creada
  126 |     await page.locator('[data-test="form-tags"]').click();
  127 |     await page.locator(`text=${nombreTag}`).click();
  128 |     await page.locator('[data-test="form-submit"]').click();
  129 |     await expect(page.locator('[data-test="app-snackbar"]')).toContainText(/creada/i);
  130 | 
  131 |     // Buscar por etiqueta
  132 |     await page.locator('[data-test="tag-filter"]').click();
  133 |     await page.locator(`text=${nombreTag}`).click();
  134 | 
  135 |     // La tarea debe aparecer
  136 |     await expect(page.locator(`text=${tituloTarea}`)).toBeVisible();
  137 |   });
  138 | 
  139 |   test('Admin puede buscar usuarios por etiquetas', async ({ page }) => {
  140 |     await loginJWT(page, ADMIN_USER.email, ADMIN_USER.password);
  141 |     await expectAuthenticated(page);
  142 | 
  143 |     // Cambiar a modo admin
  144 |     await page.locator('[data-test="admin-panel-button"]').click();
  145 |     await expect(page.locator('[data-test="admin-panel"]')).toBeVisible();
  146 | 
  147 |     // Seleccionar una etiqueta (si hay alguna)
  148 |     const tagFilter = page.locator('[data-test="admin-tag-search"]');
  149 |     if (await tagFilter.isVisible()) {
  150 |       await tagFilter.click();
  151 |       // Seleccionar primera etiqueta disponible
  152 |       const firstTag = page.locator('.v-list-item').first();
  153 |       if (await firstTag.isVisible()) {
  154 |         await firstTag.click();
  155 |         await page.locator('[data-test="admin-search-users-tags"]').click();
  156 | 
  157 |         // Verificar que se muestran resultados
  158 |         const results = page.locator('[data-test="admin-search-results"]');
  159 |         await expect(results).toBeVisible({ timeout: 5_000 });
  160 |       }
  161 |     }
  162 |   });
  163 | 
  164 |   test('Admin puede buscar tareas por etiquetas (scope all)', async ({ page }) => {
  165 |     await loginJWT(page, ADMIN_USER.email, ADMIN_USER.password);
  166 |     await expectAuthenticated(page);
  167 | 
  168 |     // Cambiar a modo admin
  169 |     await page.locator('[data-test="admin-panel-button"]').click();
  170 |     await expect(page.locator('[data-test="admin-panel"]')).toBeVisible();
```