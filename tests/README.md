# Tests Playwright — Sistema de Gestión de Tareas

Suite de tests E2E que valida los flujos de autenticación (JWT y OAuth) y el CRUD de tareas.

## Pre-requisitos

1. **Backend corriendo** en `https://localhost:3000`:
   ```bash
   cd backend
   npm install
   npm run db:migrate
   npm run db:seed:all   # crea personas, tags y tareas iniciales
   npm run dev
   ```

2. **Frontend corriendo** en `https://localhost:5173`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Dependencias de Playwright** (sólo la primera vez):
   ```bash
   # En la raíz del proyecto (junto a frontend/ y backend/)
   npm init -y
   npm install -D @playwright/test
   npx playwright install chromium
   ```

   > El usuario de prueba `playwright@test.local` se crea automáticamente al inicio de cada suite mediante `ensureTestUser()`. No es necesario crearlo manualmente.

## Ejecución

```bash
# Todos los tests
npx playwright test

# Solo autenticación
npx playwright test tests/auth.spec.ts

# Solo CRUD
npx playwright test tests/tareas.spec.ts

# Modo headed (con navegador visible)
npx playwright test --headed

# Modo UI interactivo (recomendado durante desarrollo)
npx playwright test --ui

# Ver el reporte HTML después
npx playwright show-report
```

## Estructura

```
tests/
├── auth.spec.ts              # Login JWT (válido/inválido), OAuth callback, logout
├── tareas.spec.ts            # CRUD completo + filtros
├── fixtures/
│   └── users.ts              # Datos de usuarios de prueba
└── helpers/
    └── auth.ts               # Helpers reutilizables (login, ensureUser, API calls)
```

## Notas sobre OAuth

El flujo OAuth real con Google **no se automatiza** porque requiere interacción con `accounts.google.com`. Los tests cubren:

- Que el botón "Iniciar con Google" navega al endpoint del backend.
- Que el componente `OAuthCallback.vue` procesa correctamente un token recibido en la query string (simulando el redirect que hace el backend tras autenticar al usuario).
- Que los casos de error (`?error=...`) y token ausente vuelvan al login.

El JWT usado en el test del callback es real: se obtiene haciendo login JWT vía API contra el backend, lo que simula el JWT que generaría `googleAuth.controller.googleCallback` tras una autenticación exitosa en Google.

## Troubleshooting

- **`net::ERR_CERT_AUTHORITY_INVALID`**: los certificados son autofirmados. La config ya incluye `ignoreHTTPSErrors: true`.
- **Tests fallan en `loginJWT`**: verificar que el usuario fue creado correctamente. Revisar que `ensureTestUser()` en `helpers/auth.ts` apunta al endpoint correcto.
- **Tests CRUD se interfieren entre sí**: la config tiene `fullyParallel: false` y `workers: 1` precisamente para evitarlo, pero si limpias la DB entre runs los tests deben ser independientes.
- **Backend cae con `Unknown column 'googleId'`**: ejecuta `npm run db:migrate` para aplicar la migración `20260427000006-add-google-oauth-to-usuario.js`.
