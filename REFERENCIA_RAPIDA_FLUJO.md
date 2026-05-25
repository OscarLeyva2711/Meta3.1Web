# Guía de Referencia Rápida: Flujo y Servicios

## Cómo Funciona Todo (Versión Ultra Corta)

### El Ciclo Básico

```
1. Usuario abre app
   ↓
2. Router verifica: ¿tienes token?
   ↓
3. SI: muestra home | NO: muestra login
   ↓
4. Usuario se autentica (email/password o Google)
   ↓
5. Backend genera JWT
   ↓
6. Frontend guarda JWT en localStorage
   ↓
7. Cada request lleva JWT automáticamente
   ↓
8. Backend valida JWT, ejecuta acción
   ↓
9. Frontend actualiza pantalla
```

---

## Capas de la Aplicación

### CAPA 1: PRESENTACIÓN (Vue + Vuetify)
- Componentes visuales
- TareasView (lista tareas)
- LoginView (formulario login)
- TareaForm (crear/editar tarea)

### CAPA 2: LÓGICA DE NEGOCIO (Services)
- authService (login, logout, JWT)
- tareaService (CRUD tareas)
- tagService (CRUD tags)
- personaService (CRUD personas)

### CAPA 3: COMUNICACIÓN (Axios)
- HTTP client
- Interceptores (agregan JWT automáticamente)
- Manejo de errores (401, 403, etc.)

### CAPA 4: SERVIDOR (Express)
- Validación de JWT
- Lógica de negocio
- Acceso a BD

### CAPA 5: DATOS (MySQL)
- Tablas: usuarios, tareas, tags, personas
- Relaciones: tarea_tags (M:M)

---

## Servicios Ofrecidos por el Backend

### Autenticación
| Acción | Endpoint | Método |
|--------|----------|--------|
| Login | /api/auth/login | POST |
| Registro | /api/usuarios/registro | POST |
| Verificar | /api/auth/verify | GET |
| Logout | /api/auth/logout | POST |
| Google OAuth | /api/auth/google | GET |
| Callback Google | /api/auth/google/callback | GET |

### Tareas
| Acción | Endpoint | Método |
|--------|----------|--------|
| Listar | /api/tareas | GET |
| Obtener | /api/tareas/:id | GET |
| Crear | /api/tareas | POST |
| Actualizar | /api/tareas/:id | PUT |
| Actualizar parcial | /api/tareas/:id | PATCH |
| Eliminar | /api/tareas/:id | DELETE |

### Tags
| Acción | Endpoint | Método |
|--------|----------|--------|
| Listar | /api/tags | GET |
| Crear | /api/tags | POST |
| Actualizar | /api/tags/:id | PUT |
| Eliminar | /api/tags/:id | DELETE |

### Personas
| Acción | Endpoint | Método |
|--------|----------|--------|
| Listar | /api/personas | GET |
| Crear | /api/personas | POST |
| Actualizar | /api/personas/:id | PUT |
| Eliminar | /api/personas/:id | DELETE |

---

## Flujos Principales

### Flujo 1: Login por Email

```
Usuario ingresa email + password
         ↓
Frontend: authService.login(email, password)
         ↓
POST /api/auth/login { email, password }
         ↓
Backend valida credenciales
         ↓
Genera JWT: eyJ... (contiene id, email, rol)
         ↓
Devuelve: { token, user }
         ↓
Frontend guarda en localStorage
         ↓
Frontend redirige a home
```

### Flujo 2: Login Google OAuth

```
Usuario hace click "Google"
         ↓
Frontend abre Google popup
         ↓
Usuario autoriza
         ↓
Google devuelve code
         ↓
Backend intercambia code por access_token
         ↓
Backend obtiene datos del usuario de Google
         ↓
Backend busca o crea usuario en BD
         ↓
Backend genera JWT propio
         ↓
Backend redirige a frontend con token
         ↓
Frontend guarda en localStorage
         ↓
Frontend redirige a home
```

### Flujo 3: Obtener Tareas

```
TareasView.vue monta
         ↓
Llama: tareaService.getAll()
         ↓
Axios: GET /api/tareas
         ↓
Interceptor agrega JWT
         ↓
Backend middleware valida JWT
         ↓
Extrae usuario_id del JWT
         ↓
SELECT * FROM tareas WHERE usuario_id = ?
         ↓
Devuelve JSON: { data: [ tareas ] }
         ↓
Frontend transforma: estado → completada
         ↓
Vue actualiza estado reactivo
         ↓
Re-renderiza lista
         ↓
Usuario ve tareas
```

### Flujo 4: Crear Tarea

```
Usuario rellena formulario y hace click "Crear"
         ↓
TareaForm emite evento submit con datos
         ↓
tareaService.crear({ titulo, descripcion, ... })
         ↓
Transforma datos: remueve campos innecesarios
         ↓
POST /api/tareas { titulo, descripcion, estado, tagIds }
         ↓
Interceptor agrega JWT
         ↓
Backend valida JWT
         ↓
Extrae usuario_id del JWT
         ↓
INSERT INTO tareas (titulo, descripcion, estado, usuario_id)
VALUES (...)
         ↓
Devuelve: { data: { id: 42, titulo, ... } }
         ↓
Frontend agrega a lista local
         ↓
Vue re-renderiza
         ↓
Usuario ve nueva tarea sin recargar
```

### Flujo 5: Actualizar Tarea

```
Usuario hace click "Editar" en tarea
         ↓
Abre TareaForm con datos precargados
         ↓
Usuario modifica y hace click "Guardar"
         ↓
tareaService.actualizar(id, { titulo, ... })
         ↓
PUT /api/tareas/:id { nuevo titulo, ... }
         ↓
Backend valida JWT
         ↓
UPDATE tareas SET titulo = ?, ... WHERE id = ?
         ↓
Devuelve tarea actualizada
         ↓
Frontend actualiza item en lista
         ↓
Vue re-renderiza
```

### Flujo 6: Eliminar Tarea

```
Usuario hace click icono "Eliminar"
         ↓
Confirmación: ¿Estás seguro?
         ↓
DELETE /api/tareas/:id
         ↓
Backend valida JWT
         ↓
DELETE FROM tareas WHERE id = ?
         ↓
Devuelve: { success: true }
         ↓
Frontend remueve de lista local
         ↓
Vue re-renderiza
         ↓
Usuario ve lista sin la tarea
```

### Flujo 7: Logout

```
Usuario hace click "Cerrar Sesión"
         ↓
POST /api/auth/logout (con JWT)
         ↓
Backend invalida sesión
         ↓
Frontend limpia localStorage
         ↓
Frontend limpia cookies
         ↓
Frontend redirige a /login
         ↓
Usuario vuelve a pantalla de login
```

---

## Protección de Seguridad

### 1. JWT (Token)
```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbCI6ImFkbWluIiwiaWF0IjoxNjI2Nzg5NjAwLCJleHAiOjE2MjY4NzYwMDB9.signature

Contiene:
- id: 1
- email: admin@example.com
- rol: admin
- iat (issued at): cuándo se creó
- exp (expiration): cuándo expira (24 horas)

El JWT es verificado en cada request por el backend.
```

### 2. CSRF Token
```
Se almacena en cookie HttpOnly
Se envía en header x-csrf-token
Previene ataques de falsificación de solicitud entre sitios
```

### 3. Cookies HTTP-Only
```
Set-Cookie: jwt_token=...; HttpOnly; Secure; SameSite=Strict

- HttpOnly: JavaScript no puede leerla (previene XSS)
- Secure: solo sobre HTTPS
- SameSite=Strict: no se envía a otros sitios
```

### 4. CORS (Cross-Origin)
```
Backend solo acepta requests de:
- https://localhost:5173 (frontend)
- https://localhost:3000 (mismo servidor)

Rechaza requests de otros dominios
```

### 5. Validación en Backend
```
Cada endpoint verifica:
- ¿Token válido?
- ¿No está expirado?
- ¿Usuario es dueño del recurso?
- ¿Usuario tiene permisos?

Si no pasa: devuelve 401 o 403
```

---

## Códigos HTTP Posibles

```
200 OK
  └─ Request exitoso

201 Created
  └─ Recurso creado

400 Bad Request
  └─ Datos inválidos (falta campo, formato malo)

401 Unauthorized
  └─ Token falta, inválido o expirado
  └─ Frontend interceptor redirige a login

403 Forbidden
  └─ No tienes permisos (ej: no eres admin)

404 Not Found
  └─ Recurso no existe

409 Conflict
  └─ Email duplicado, violación de constraint

500 Internal Server Error
  └─ Error en servidor
```

---

## Transformación de Datos: Frontend ↔ Backend

### Backend devuelve:
```json
{
  "id": 1,
  "titulo": "Aprender Vue",
  "descripcion": "Estudiar documentación",
  "estado": "pendiente",
  "usuario_id": 1,
  "createdAt": "2026-05-14T10:30:00Z",
  "updatedAt": "2026-05-14T10:30:00Z"
}
```

### Frontend transforma a:
```json
{
  "id": 1,
  "titulo": "Aprender Vue",
  "descripcion": "Estudiar documentación",
  "estado": "pendiente",
  "completada": false,
  "usuario_id": 1,
  "createdAt": "2026-05-14T10:30:00Z",
  "updatedAt": "2026-05-14T10:30:00Z"
}
```

**¿Por qué?** Frontend usa `completada` (boolean), backend usa `estado` (enum).

Cuando Frontend envía al Backend:
```json
{ "completada": false }
    ↓ (tareaService.toBackend())
{ "estado": "pendiente" }
```

---

## Estructura de Directorios y Qué Hace Cada Uno

### Frontend (`17marzo26/src/`)

```
main.ts
  └─ Inicia Vue app

App.vue
  └─ Componente raíz

router/index.ts
  └─ Define rutas + guard
  └─ Verifica auth en cada navegación

services/
  ├─ authService.js
  │   └─ login(), logout(), verify()
  │   └─ Maneja JWT en localStorage
  ├─ tareaService.js
  │   └─ getAll(), getById(), crear(), actualizar(), eliminar()
  ├─ tagService.js
  │   └─ CRUD de tags
  └─ personaService.js
      └─ CRUD de personas

components/
  ├─ LoginView.vue
  │   └─ Formulario email + password
  ├─ GoogleLogin.vue
  │   └─ Botón OAuth Google
  ├─ TareaForm.vue
  │   └─ Formulario crear/editar tarea
  └─ TareaCard.vue
      └─ Componente individual de tarea

views/
  └─ TareasView.vue
      └─ Lista de tareas + filtros
```

### Backend (`api-tareas-mvc/src/`)

```
server.js
  └─ Inicia Express app

app.js
  └─ Configura middleware, CORS, Passport

routes/
  ├─ auth.routes.js
  │   └─ POST /api/auth/login
  │   └─ POST /api/auth/register
  │   └─ GET  /api/auth/verify
  │   └─ POST /api/auth/logout
  ├─ tarea.routes.js
  │   └─ GET/POST/PUT/PATCH/DELETE /api/tareas/*
  ├─ tag.routes.js
  ├─ persona.routes.js
  └─ usuario.routes.js

controllers/
  ├─ auth.controller.js
  │   └─ Lógica de login, register, verify
  ├─ tarea.controller.js
  │   └─ Lógica de CRUD tareas
  │   └─ Filtra por usuario_id del JWT
  ├─ tag.controller.js
  └─ persona.controller.js

models/
  ├─ usuario.js (Sequelize)
  ├─ tarea.js
  ├─ tag.js
  ├─ persona.js
  └─ index.js (sincroniza con BD)

middleware/
  ├─ auth.js
  │   └─ Valida JWT en cada request protegido
  └─ csrf.js
      └─ Valida CSRF token

config/
  ├─ passport.js
  │   └─ Configuración de estrategia OAuth Google
  └─ config.json
      └─ Credenciales de base de datos
```

---

## Checklist: Qué Sucede en Cada Paso

### Step 1: Usuario Abre Aplicación
- [ ] Navegador carga https://localhost:5173/
- [ ] Vue App inicia (main.ts)
- [ ] Router se carga
- [ ] beforeEach guard se ejecuta
  - [ ] Verifica: ¿localStorage tiene authToken?
  - [ ] SI: redirige a /
  - [ ] NO: redirige a /login

### Step 2: Usuario Hace Login
- [ ] Ingresa email y password
- [ ] onClick en botón "Iniciar Sesión"
- [ ] authService.login(email, password)
- [ ] Axios interceptor agrega x-api-key header
- [ ] POST /api/auth/login se envía al backend
- [ ] Backend busca usuario por email
- [ ] Backend compara password con bcryptjs
- [ ] Si OK: Backend genera JWT
- [ ] Frontend recibe token
- [ ] Frontend guarda en localStorage
- [ ] Frontend redirige a /
- [ ] Frontend carga TareasView

### Step 3: Usuario Ve Tareas
- [ ] TareasView.vue monta
- [ ] mounted() llama tareaService.getAll()
- [ ] Axios interceptor agrega Authorization header con JWT
- [ ] GET /api/tareas se envía
- [ ] Backend authMiddleware valida JWT
- [ ] Backend extrae user_id del JWT
- [ ] Backend: SELECT * FROM tareas WHERE usuario_id = ?
- [ ] Backend devuelve JSON
- [ ] Frontend transforma (estado → completada)
- [ ] Frontend actualiza estado reactivo
- [ ] Vue re-renderiza
- [ ] Usuario ve lista de tareas

### Step 4: Usuario Crea Tarea
- [ ] Usuario rellena formulario
- [ ] onClick "Crear Tarea"
- [ ] tareaService.crear({...})
- [ ] Axios interceptor agrega JWT
- [ ] POST /api/tareas se envía
- [ ] Backend valida JWT
- [ ] Backend extrae usuario_id
- [ ] Backend: INSERT INTO tareas
- [ ] Backend devuelve tarea con nuevo ID
- [ ] Frontend agrega a lista local
- [ ] Vue re-renderiza
- [ ] Usuario ve nueva tarea

### Step 5: Usuario Cierra Sesión
- [ ] Usuario hace click "Cerrar Sesión"
- [ ] POST /api/auth/logout (con JWT)
- [ ] Frontend limpia localStorage
- [ ] Frontend limpia cookies
- [ ] Frontend redirige a /login
- [ ] Usuario vuelve a LoginView

---

## Errores Comunes y Soluciones

### Error 401 Unauthorized
```
Causa: Token expirado o inválido
Solución: 
  1. Frontend limpia token
  2. Redirige a /login
  3. Usuario hace login de nuevo
```

### Error 403 Forbidden
```
Causa: Usuario no tiene permisos (ej: no es admin)
Solución:
  1. Mostrar mensaje "No tienes permisos"
  2. Usuario debe solicitar acceso o usar otra cuenta
```

### Error 404 Not Found
```
Causa: Tarea no existe
Solución:
  1. Mostrar "Tarea no encontrada"
  2. Redireccionar a lista
```

### Error CORS
```
Causa: Frontend intenta hacer request a backend de otro origen
Solución:
  1. Backend debe permitir el origin en CORS
  2. O cambiar configuración de frontend
```

---

## Resumen Ultra-Rápido

```
Frontend (Vue) solicita datos a Backend (Express)
         ↓
Axios + Interceptor agrega JWT automáticamente
         ↓
Backend valida JWT
         ↓
Backend ejecuta lógica, accede a BD
         ↓
Backend devuelve JSON
         ↓
Frontend recibe, transforma, actualiza UI
         ↓
Vue re-renderiza (sin recargar)
         ↓
Usuario ve cambios al instante
```

**Todo está protegido por JWT, CSRF, Cookies HTTP-Only y CORS.**

