# Arquitectura y Flujo del Sistema — Meta3.1

## Descripción General

El Sistema de Gestión de Tareas es una **aplicación web de dos capas**:
- **Frontend:** Vue 3 + Vuetify (Puerto 5173)
- **Backend:** Express + Sequelize (Puerto 3000)

Se comunican a través de **HTTPS con cookies HTTP-Only, JWT y protección CSRF**.

---

## Flujo General de la Aplicación

```
Usuario abre navegador
          ↓
    https://localhost:5173/
          ↓
    Vue app se carga (main.ts)
          ↓
    Router verifica autenticación
          ↓
    SI: Token existe → Muestra TareasView
    NO: Redirige a /login
          ↓
    Usuario se autentica (Login o Google OAuth)
          ↓
    Frontend envía credenciales al backend
          ↓
    Backend valida y devuelve JWT
          ↓
    Frontend guarda token en localStorage
          ↓
    Frontend puede usar token para requests posteriores
```

---

## 1. INICIACIÓN DE LA APLICACIÓN (Frontend)

### Punto de Entrada: `main.ts`

```typescript
import { createApp } from 'vue'
import { registerPlugins } from '@/plugins'
import router from '@/router'
import App from './App.vue'

const app = createApp(App)
registerPlugins(app)  // Vuetify, plugins, etc.
router.isReady().then(() => {
  app.mount('#app')  // Monta en <div id="app">
})
```

**Lo que sucede:**
1. Se crea la aplicación Vue
2. Se registran plugins (Vuetify para UI, etc.)
3. Se espera a que el router esté listo
4. Se monta en el DOM

---

## 2. ENRUTAMIENTO Y PROTECCIÓN DE RUTAS

### Archivo: `router/index.ts`

El router define las rutas de la aplicación:

```typescript
const routes = [
  {
    path: '/',
    component: TareasView,
    meta: { requiresAuth: true }  // Protegida
  },
  {
    path: '/login',
    component: LoginView,
    meta: { requiresGuest: true }  // Solo para no autenticados
  },
  {
    path: '/oauth-callback',
    component: OAuthCallback,
    meta: { requiresAuth: false }  // Pública (necesaria para OAuth)
  }
]
```

### Guard de Router: `router.beforeEach()`

Antes de cada navegación, se verifica:

```
1. ¿Es /oauth-callback?
   → Permitir (necesaria para OAuth)

2. ¿Es ruta de invitados (requiresGuest)?
   → SI usuario autenticado: redirigir a home (/)
   → NO: permitir acceso

3. ¿Es ruta pública (requiresAuth = false)?
   → Permitir

4. ¿Es ruta protegida (requiresAuth = true)?
   → SI tiene token: permitir
   → NO: redirigir a /login
```

**Función auxiliar:**
```typescript
authService.isAuthenticated()  // Verifica si existe token en localStorage
```

---

## 3. AUTENTICACIÓN - Flujo de Login

### Vista: `components/LoginView.vue`

El usuario ingresa email y contraseña:

```html
<input v-model="email" type="email" />
<input v-model="password" type="password" />
<button @click="handleLogin">Iniciar Sesión</button>
```

### Servicio: `authService.login(email, password)`

**Frontend realiza:**

```javascript
const response = await apiClient.post(
  'https://localhost:3000/api/auth/login',
  { email, password },
  { headers: { 'x-api-key': 'mi_api_key_secreta_12345' } }
)
```

**Backend (Express) recibe la solicitud:**

1. Valida que email y password vengan en el body
2. Busca el usuario en BD por email
3. Compara contraseña con bcryptjs
4. Si es válido: genera JWT
5. Devuelve JWT al frontend

**Interceptor de Axios agrega credenciales:**
```javascript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  const csrfToken = getCsrfTokenFromCookie()
  if (csrfToken) {
    config.headers['x-csrf-token'] = csrfToken
  }
  return config
})
```

**Frontend guarda datos:**

```javascript
authService.setAuthData(token, email)
// Guarda en localStorage:
// - authToken (el JWT)
// - userEmail
// - userRole
// - userId
// Emite evento 'login-success'
```

---

## 4. AUTENTICACIÓN - Flujo de Google OAuth

### Vista: `components/GoogleLogin.vue`

```html
<button @click="handleGoogleLogin">
  Inicia sesión con Google
</button>
```

**Flujo OAuth 2.0:**

```
1. Frontend abre Google login popup
           ↓
2. Usuario autoriza la app en Google
           ↓
3. Google redirige a callback URL
   https://localhost:3000/api/auth/google/callback?code=XXX
           ↓
4. Backend intercambia code por token de Google
           ↓
5. Backend busca/crea usuario en BD
           ↓
6. Backend genera JWT propio
           ↓
7. Backend redirige a frontend con JWT en URL/cookie
           ↓
8. Frontend extrae JWT y lo guarda
```

### Componente: `OAuthCallback.vue`

```javascript
// En OAuthCallback.vue
mounted() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  
  if (token) {
    authService.setAuthData(token)
    router.push('/')  // Redirige a home
  }
}
```

---

## 5. SOLICITUDES HTTP CON AUTENTICACIÓN

### Flujo de una Solicitud Típica

```
Component solicita datos (ej: getTareas)
          ↓
Service (tareaService) hace apiClient.get('/tareas')
          ↓
Interceptor de Request agrega:
  - Authorization: Bearer <token>
  - x-csrf-token: <token>
  - x-api-key: <api_key>
          ↓
Request llega al backend
          ↓
Middleware de Backend verifica:
  - ¿Tiene Authorization Bearer?
  - ¿Es válido el JWT?
  - ¿No está expirado?
          ↓
SI válido: Ejecuta el endpoint
NO válido: Responde 401 Unauthorized
          ↓
Frontend recibe respuesta
          ↓
SI 401: Interceptor de Response:
  - Limpia authToken
  - Redirige a /login
SI 200: Devuelve datos al component
```

---

## 6. SERVICIOS DEL BACKEND AL FRONTEND

El backend proporciona múltiples servicios (APIs REST) organizados por funcionalidad:

### A. SERVICIO DE AUTENTICACIÓN

**Endpoints:**

```
POST /api/auth/login
  Request: { email, password }
  Response: { success, token, data: { id, email, nombre, rol } }

POST /api/auth/register
  Request: { nombre, email, password, passwordConfirm }
  Response: { success, data: { id, email, nombre } }

GET /api/auth/verify
  Headers: Authorization: Bearer <token>
  Response: { success, user: { id, email, nombre, rol } }

POST /api/auth/logout
  Headers: Authorization: Bearer <token>
  Response: { success, message }

GET /api/auth/google
  Inicia flujo de OAuth con Google

GET /api/auth/google/callback?code=XXX
  Callback de Google, devuelve token JWT
```

---

### B. SERVICIO DE TAREAS

**Endpoints:**

```
GET /api/tareas
  Query: ?estado=pendiente&personaId=1
  Response: { success, data: [], total }

GET /api/tareas/:id
  Response: { success, data: { id, titulo, descripcion, estado, ... } }

POST /api/tareas
  Body: { titulo, descripcion, estado, persona_id, tagIds[] }
  Response: { success, data: { ... } }

PUT /api/tareas/:id
  Body: { titulo, descripcion, estado, ... }
  Response: { success, data: { ... } }

PATCH /api/tareas/:id
  Body: { estado: "completada" } // Solo actualiza campos enviados
  Response: { success, data: { ... } }

DELETE /api/tareas/:id
  Response: { success, message }

GET /api/tareas/:id/tags
  Response: { success, data: [ { id, nombre }, ... ] }

POST /api/tareas/:id/tags/:tagId
  Response: { success, data: { ... } }

DELETE /api/tareas/:id/tags/:tagId
  Response: { success, data: { ... } }
```

**Lo que hace el Backend:**
- Valida que el usuario esté autenticado (JWT)
- Busca la tarea en BD
- Si es CRUD: valida permisos
- Ejecuta la operación
- Devuelve el resultado

**Lo que hace el Frontend:**
- Llama al servicio (`tareaService.getAll()`)
- Transforma la respuesta (ej: `estado` → `completada`)
- Actualiza el estado reactivo de Vue
- Re-renderiza los componentes

---

### C. SERVICIO DE TAGS

**Endpoints:**

```
GET /api/tags
  Response: { success, data: [ { id, nombre }, ... ] }

GET /api/tags/:id
  Response: { success, data: { id, nombre } }

POST /api/tags
  Body: { nombre }
  Response: { success, data: { id, nombre } }

PUT /api/tags/:id
  Body: { nombre }
  Response: { success, data: { ... } }

DELETE /api/tags/:id
  Response: { success, message }

GET /api/tags/:id/tareas
  Response: { success, data: [ tareas con este tag ] }
```

---

### D. SERVICIO DE PERSONAS

**Endpoints:**

```
GET /api/personas
  Response: { success, data: [ personas ], total }

GET /api/personas/:id
  Response: { success, data: { id, nombre, email } }

POST /api/personas
  Body: { nombre, email }
  Response: { success, data: { ... } }

PUT /api/personas/:id
  Body: { nombre, email }
  Response: { success, data: { ... } }

DELETE /api/personas/:id
  Response: { success, message }

GET /api/personas/:id/tareas
  Response: { success, data: [ tareas de persona ] }
```

---

### E. SERVICIO DE USUARIOS

**Endpoints:**

```
GET /api/usuarios
  Response: { success, data: [ usuarios ], total }

GET /api/usuarios/:id
  Response: { success, data: { id, email, nombre, rol, activo } }

PATCH /api/usuarios/:id
  Body: { rol: "admin", activo: false }
  Response: { success, data: { ... } }

DELETE /api/usuarios/:id
  Response: { success, message }
```

---

## 7. CICLO DE VIDA DE UNA ACCIÓN (Ejemplo: Crear Tarea)

### Paso 1: Usuario hace clic en "Crear Tarea"

```vue
<!-- TareasView.vue -->
<TareaForm @submit="crearTarea" />
```

### Paso 2: Componente emite evento con datos

```javascript
const crearTarea = async (datos) => {
  // datos = { titulo: "...", descripcion: "...", estado: "pendiente" }
  try {
    const resultado = await tareaService.crear(datos)
    tareas.value.push(resultado.data)
  } catch (error) {
    mostrarError(error.message)
  }
}
```

### Paso 3: Servicio adapta datos y hace request

```javascript
// tareaService.crear(datos)
export const crear = (datos) =>
  apiClient.post('/tareas', toBackend(datos))
    .then(r => unwrapOne(r.data))

// toBackend() transforma:
// { completada: false } → { estado: "pendiente" }
```

### Paso 4: Interceptor agrega autenticación

```javascript
// Axios agrega automáticamente:
headers: {
  'Authorization': 'Bearer eyJhbGc...',
  'x-csrf-token': 'token_aqui',
  'x-api-key': 'mi_api_key_secreta_12345'
}
```

### Paso 5: Backend recibe request

```javascript
// api-tareas-mvc/src/routes/tarea.routes.js
router.post('/tareas', authMiddleware, tareaController.crear)
```

### Paso 6: Middleware valida JWT

```javascript
// Extrae token del header Authorization
// Verifica firma del JWT
// Si es válido: agrega user al request (req.user)
// Si no: devuelve 401 Unauthorized
```

### Paso 7: Controlador ejecuta lógica

```javascript
// controllers/tarea.controller.js
const crear = async (req, res) => {
  const { titulo, descripcion, estado } = req.body
  const usuarioId = req.user.id  // Del JWT

  // Valida campos
  // Inserta en BD con usuario_id
  // Devuelve tarea creada
}
```

### Paso 8: Base de datos persiste datos

```sql
INSERT INTO tareas (titulo, descripcion, estado, usuario_id, createdAt)
VALUES ('...', '...', 'pendiente', 1, NOW())
```

### Paso 9: Backend devuelve respuesta

```json
{
  "success": true,
  "data": {
    "id": 42,
    "titulo": "...",
    "descripcion": "...",
    "estado": "pendiente",
    "usuario_id": 1,
    "createdAt": "2026-05-14T10:30:00Z"
  }
}
```

### Paso 10: Frontend actualiza UI

```javascript
// En el catch/then del try anterior
const resultado = await tareaService.crear(datos)
tareas.value.push(resultado.data)  // Agrega a la lista local

// Vue detecta cambio reactivo
// Re-renderiza el componente
// Muestra la nueva tarea en pantalla
```

---

## 8. PROTECCIÓN DE SEGURIDAD

### A. JWT (JSON Web Token)

```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbCI6ImFkbWluIiwiaWF0IjoxNjI2Nzg5NjAwLCJleHAiOjE2MjY4NzYwMDB9.signature
```

**Estructura:**
- Header: algoritmo (HS256)
- Payload: datos del usuario (id, email, rol, expiración)
- Signature: validación criptográfica

**Validación en Backend:**
```javascript
jwt.verify(token, JWT_SECRET)
// Si es inválido o expirado: lanza error
// Si es válido: devuelve payload
```

### B. CSRF Protection (Cross-Site Request Forgery)

**Token CSRF en Cookie:**
```
Set-Cookie: csrf_token=xyz123; HttpOnly; Secure; SameSite=Strict
```

**Frontend lo envía en headers:**
```javascript
'x-csrf-token': getCsrfTokenFromCookie()
```

**Backend valida:**
```javascript
// Verifica que el token CSRF del header coincida con el de la cookie
```

### C. HTTP-Only Cookies

```
Set-Cookie: jwt_token=...; HttpOnly; Secure; SameSite=Strict
```

**Ventajas:**
- JavaScript NO puede acceder (previene XSS)
- Se envían automáticamente en cada request
- Solo sobre HTTPS

### D. CORS (Cross-Origin Resource Sharing)

**Backend configura:**
```javascript
const corsOptions = {
  origin: ['https://localhost:5173', ...],  // Solo estos orígenes
  credentials: true,  // Permitir cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}
```

**Lo que previene:**
- Solicitudes desde otros dominios maliciosos
- Protege contra ataques de terceros

---

## 9. FLUJO DE LOGOUT

### Frontend

```javascript
await authService.logout()

// Esto hace:
// 1. POST /api/auth/logout (con JWT en header)
// 2. Backend invalida sesión
// 3. Frontend limpia localStorage
// 4. Frontend limpia cookies
// 5. Frontend redirige a /login
```

### Backend

```javascript
// POST /api/auth/logout
// 1. Valida JWT
// 2. (Opcional) agrega token a blacklist
// 3. Devuelve success
```

---

## 10. MANEJO DE ERRORES Y 401

### Interceptor de Response

```javascript
apiClient.interceptors.response.use(
  (response) => response,  // Request OK, devuelve respuesta
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      // En rutas seguras: redirige a /login
      // En rutas de login: permite que falle (para mostrar error)
      const path = window.location.pathname
      if (!SAFE_PATHS.includes(path)) {
        localStorage.removeItem('authToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
```

---

## 11. FLUJO VISUAL COMPLETO

```
┌─────────────────────────────────────────────────────────────┐
│                     NAVEGADOR (Frontend)                      │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Vue 3 App (TareasView, LoginView, etc.)            │   │
│  │                                                     │   │
│  │  componentes/                                       │   │
│  │  ├─ TareasView.vue   (vista principal)             │   │
│  │  ├─ LoginView.vue    (login local)                 │   │
│  │  └─ GoogleLogin.vue  (OAuth)                       │   │
│  │                                                     │   │
│  │  servicios/                                         │   │
│  │  ├─ authService.js   (login, logout, verify)       │   │
│  │  ├─ tareaService.js  (CRUD tareas)                 │   │
│  │  ├─ tagService.js    (CRUD tags)                   │   │
│  │  └─ personaService.js (CRUD personas)              │   │
│  │                                                     │   │
│  │  router/                                            │   │
│  │  └─ index.ts (rutas protegidas)                    │   │
│  │                                                     │   │
│  │  localStorage:                                      │   │
│  │  ├─ authToken (JWT)                                │   │
│  │  ├─ userEmail                                       │   │
│  │  └─ userRole                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                       PUERTO 5173                           │
└─────────────────────────────────────────────────────────────┘
                           ↕ HTTPS ↕
                    (Axios + Interceptores)
                           ↕ ↕ ↕
┌─────────────────────────────────────────────────────────────┐
│                    SERVIDOR (Backend)                        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Express + Sequelize                                │   │
│  │                                                     │   │
│  │  routes/                                            │   │
│  │  ├─ auth.routes.js        (login, verify, logout) │   │
│  │  ├─ tarea.routes.js       (CRUD tareas)           │   │
│  │  ├─ tag.routes.js         (CRUD tags)             │   │
│  │  ├─ persona.routes.js     (CRUD personas)         │   │
│  │  ├─ usuario.routes.js     (gestión usuarios)      │   │
│  │  └─ googleAuth.routes.js  (OAuth Google)          │   │
│  │                                                     │   │
│  │  controllers/                                       │   │
│  │  └─ Lógica de negocio para cada ruta               │   │
│  │                                                     │   │
│  │  middleware/                                        │   │
│  │  ├─ authMiddleware (valida JWT)                    │   │
│  │  ├─ csrfMiddleware                                 │   │
│  │  └─ errorHandler                                   │   │
│  │                                                     │   │
│  │  models/ (Sequelize)                               │   │
│  │  ├─ Usuario                                         │   │
│  │  ├─ Tarea                                           │   │
│  │  ├─ Tag                                             │   │
│  │  ├─ Persona                                         │   │
│  │  └─ TareaTag (relación M:M)                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                       PUERTO 3000                           │
└─────────────────────────────────────────────────────────────┘
                           ↕ HTTPS ↕
                   (SQL / MariaDB Protocol)
                           ↕ ↕ ↕
┌─────────────────────────────────────────────────────────────┐
│                   BASE DE DATOS                              │
│                                                              │
│  MySQL/MariaDB (tareas_db)                                  │
│                                                              │
│  Tablas:                                                     │
│  ├─ usuarios (id, email, password_hash, rol, activo)      │
│  ├─ tareas (id, titulo, descripcion, estado, usuario_id)  │
│  ├─ tags (id, nombre)                                       │
│  ├─ tarea_tags (tarea_id, tag_id)  [relación M:M]         │
│  └─ personas (id, nombre, email)                            │
│                                                              │
│                    PUERTO 3306                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 12. RESUMEN DE SERVICIOS DEL BACKEND

| Servicio | Endpoints | Funcionalidad |
|----------|-----------|---------------|
| **Auth** | login, register, verify, logout, google | Autenticación y sesiones |
| **Tareas** | GET/POST/PUT/PATCH/DELETE | CRUD de tareas del usuario |
| **Tags** | GET/POST/PUT/DELETE | Gestión de etiquetas |
| **Personas** | GET/POST/PUT/DELETE | Gestión de personas/contactos |
| **Usuarios** | GET/POST/PATCH/DELETE | Gestión de usuarios y roles |
| **Swagger** | /api-docs | Documentación interactiva |

---

## 13. SECUENCIA DE EVENTOS TÍPICA

```
1. Usuario abre https://localhost:5173/
   ↓
2. Vue carga, router verifica isAuthenticated()
   ↓
3. SI SIN TOKEN: muestra /login
   SI CON TOKEN: carga TareasView
   ↓
4. TareasView monta y llama tareaService.getAll()
   ↓
5. Axios intercepta: agrega Authorization Bearer + CSRF
   ↓
6. Backend middleware valida JWT
   ↓
7. Controlador ejecuta SELECT * FROM tareas WHERE usuario_id = ?
   ↓
8. Devuelve JSON con tareas
   ↓
9. Frontend transforma respuesta (estado → completada)
   ↓
10. Actualiza estado reactivo
    ↓
11. Vue re-renderiza lista de tareas
    ↓
12. Usuario ve sus tareas
```

---

## 14. Conclusión

**El flujo general es:**

1. **Frontend** es una SPA (Single Page App) que se carga en el navegador
2. **Router** protege rutas verificando autenticación local
3. **Services** hacen requests HTTP al backend con JWT
4. **Interceptores** agregan tokens y manejo automático de 401
5. **Backend** valida JWT, ejecuta lógica, accede a BD
6. **Controllers** devuelven JSON
7. **Frontend** actualiza UI reactivamente

**Todo está protegido por:**
- JWT (autenticación)
- CSRF (protección contra falsificación)
- Cookies HTTP-Only (previene XSS)
- CORS (previene ataques cross-origin)
- Middleware (validación en backend)

