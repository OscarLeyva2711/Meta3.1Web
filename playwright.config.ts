import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para tests E2E.
 *
 * Pre-requisitos:
 *   - Backend corriendo en https://localhost:3000
 *   - Frontend corriendo en https://localhost:5173
 *   - Usuario de prueba creado (ver tests/README.md)
 *
 * Ejecución:
 *   npx playwright test
 *   npx playwright test --headed   # con navegador visible
 *   npx playwright test --ui       # modo UI interactivo
 *   npx playwright show-report     # ver reporte HTML
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false, // los tests CRUD comparten estado, conviene serializar
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }]
  ],
  use: {
    baseURL: 'https://localhost:5173',
    ignoreHTTPSErrors: true, // certificados autofirmados
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' }
    }
  ]
});
