# Resumen Visual: Servicios del Backend al Frontend

## Vista Rápida de Servicios

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Vue)                         │
│                                                             │
│  Componentes solicitan datos a través de Services          │
└─────────────────────────────────────────────────────────────┘
           ↓ Axios (con JWT automático) ↓
```

---

## Servicios de Autenticación

**Propósito:** Gestionar login, registro, OAuth y sesiones

```
POST /api/auth/login
├─ Input:  { email, password }
├─ Output: { token, user: { id, email, nombre, rol } }
└─ Uso:    authService.login(email, password)

POST /api/auth/register
├─ Input:  { nombre, email, password }
├─ Output: { user: { id, email, nombre } }
└─ Uso:    authService.register(...)

GET /api/auth/verify
├─ Input:  (solo JWT en header)
├─ Output: { user: { id, email, nombre, rol } }
└─ Uso:    authService.verify()

POST /api/auth/logout
├─ Input:  (solo JWT en header)
├─ Output: { message: "Sesión cerrada" }
└─ Uso:    authService.logout()

GET /api/auth/google
├─ Input:  (redirección del navegador)
└─ Output: Abre diálogo de Google

GET /api/auth/google/callback
├─ Input:  code=XXX (de Google)
├─ Output: { token, user }
└─ Uso:    (automático después de autorizar)
```

---

## Servicios de Tareas (CRUD)

**Propósito:** Gestionar todas las operaciones de tareas del usuario autenticado

```
GET /api/tareas
├─ Query:  ?estado=pendiente&personaId=1
├─ Output: { data: [ tareas ], total: número }
└─ Uso:    tareaService.getAll({ estado, personaId })

GET /api/tareas/:id
├─ Output: { data: { id, titulo, descripcion, estado, tags, ... } }
└─ Uso:    tareaService.getById(id)

POST /api/tareas
├─ Input:  { titulo, descripcion, estado, persona_id, tagIds[] }
├─ Output: { data: { id, titulo, ... } }
└─ Uso:    tareaService.crear({ titulo, descripcion, ... })

PUT /api/tareas/:id
├─ Input:  { titulo, descripcion, estado, persona_id, tagIds[] }
├─ Output: { data: { tarea actualizada } }
└─ Uso:    tareaService.actualizar(id, datos)

PATCH /api/tareas/:id
├─ Input:  { estado: "completada" }  // Solo lo que cambió
├─ Output: { data: { tarea actualizada } }
└─ Uso:    tareaService.actualizarParcial(id, { estado })

DELETE /api/tareas/:id
├─ Output: { message: "Tarea eliminada" }
└─ Uso:    tareaService.eliminar(id)

GET /api/tareas/:id/tags
├─ Output: { data: [ { id, nombre }, ... ] }
└─ Uso:    Mostrar tags de una tarea

POST /api/tareas/:id/tags/:tagId
├─ Output: { data: { tarea } }
└─ Uso:    Asignar tag a tarea

DELETE /api/tareas/:id/tags/:tagId
├─ Output: { data: { tarea } }
└─ Uso:    Remover tag de tarea
```

---

## Servicios de Tags (Etiquetas)

**Propósito:** Gestionar categorías/etiquetas para tareas

```
GET /api/tags
├─ Output: { data: [ { id, nombre }, ... ] }
└─ Uso:    tagService.getAll()

GET /api/tags/:id
├─ Output: { data: { id, nombre } }
└─ Uso:    tagService.getById(id)

POST /api/tags
├─ Input:  { nombre: "urgente" }
├─ Output: { data: { id, nombre } }
└─ Uso:    tagService.crear({ nombre })

PUT /api/tags/:id
├─ Input:  { nombre: "urgente-nuevo" }
├─ Output: { data: { ... } }
└─ Uso:    tagService.actualizar(id, { nombre })

DELETE /api/tags/:id
├─ Output: { message: "Tag eliminado" }
└─ Uso:    tagService.eliminar(id)

GET /api/tags/:id/tareas
├─ Output: { data: [ tareas con este tag ] }
└─ Uso:    Mostrar tareas de un tag
```

---

## Servicios de Personas

**Propósito:** Gestionar contactos/personas relacionados

```
GET /api/personas
├─ Output: { data: [ { id, nombre, email }, ... ] }
└─ Uso:    personaService.getAll()

GET /api/personas/:id
├─ Output: { data: { id, nombre, email } }
└─ Uso:    personaService.getById(id)

POST /api/personas
├─ Input:  { nombre, email }
├─ Output: { data: { id, nombre, email } }
└─ Uso:    personaService.crear({ nombre, email })

PUT /api/personas/:id
├─ Input:  { nombre, email }
├─ Output: { data: { ... } }
└─ Uso:    personaService.actualizar(id, datos)

DELETE /api/personas/:id
├─ Output: { message: "Persona eliminada" }
└─ Uso:    personaService.eliminar(id)

GET /api/personas/:id/tareas
├─ Output: { data: [ tareas asignadas a persona ] }
└─ Uso:    Ver tareas de una persona
```

---

## Servicios de Usuarios (Administración)

**Propósito:** Gestionar usuarios, roles y permisos (admin only)

```
GET /api/usuarios
├─ Output: { data: [ { id, email, nombre, rol, activo }, ... ] }
└─ Uso:    usuarioService.getAll()

GET /api/usuarios/:id
├─ Output: { data: { id, email, nombre, rol, activo } }
└─ Uso:    usuarioService.getById(id)

PATCH /api/usuarios/:id
├─ Input:  { rol: "admin", activo: true }
├─ Output: { data: { usuario actualizado } }
└─ Uso:    usuarioService.actualizar(id, { rol, activo })

DELETE /api/usuarios/:id
├─ Output: { message: "Usuario eliminado" }
└─ Uso:    usuarioService.eliminar(id)

POST /api/usuarios/registro
├─ Input:  { nombre, email, password }
├─ Output: { data: { id, email, nombre } }
└─ Uso:    Registro público (requiere API key)
```

---

## Flujo de una Solicitud Típica

```
1. USUARIO HACE ACCIÓN EN UI
   ↓
2. COMPONENTE LLAMA SERVICE
   await tareaService.getAll()
   ↓
3. SERVICE HACE HTTP REQUEST
   apiClient.get('/tareas')
   ↓
4. INTERCEPTOR AGREGA AUTENTICACIÓN
   Authorization: Bearer <JWT>
   x-csrf-token: <token>
   x-api-key: <key>
   ↓
5. BACKEND RECIBE
   ├─ Valida JWT
   ├─ Verifica que no esté expirado
   ├─ Extrae userId del JWT
   └─ Procesa request
   ↓
6. CONTROLADOR EJECUTA LÓGICA
   ├─ Busca datos en BD
   ├─ Filtra por usuario autenticado
   └─ Formatea respuesta
   ↓
7. BACKEND DEVUELVE JSON
   {
     "success": true,
     "data": [ ... ],
     "total": 5
   }
   ↓
8. FRONTEND RECIBE RESPUESTA
   ├─ Interceptor verifica status
   ├─ Si 401: redirige a login
   ├─ Si 200: devuelve data
   └─ Si error: muestra mensaje
   ↓
9. SERVICE TRANSFORMA DATA (si es necesario)
   ├─ estado → completada
   ├─ estructura → formato del frontend
   └─ valida tipos
   ↓
10. COMPONENTE RECIBE DATA
    ├─ Actualiza estado reactivo
    ├─ Vue re-renderiza
    └─ Usuario ve cambios
```

---

## Autenticación: Cómo Funciona

### 1. Login Tradicional (Email + Password)

```
Usuario ingresa email y password
        ↓
POST /api/auth/login { email, password }
        ↓
Backend:
  1. Busca usuario por email
  2. Compara password con bcryptjs
  3. Genera JWT con: { id, email, rol }
  4. Devuelve token
        ↓
Frontend:
  1. Recibe token
  2. Guarda en localStorage
  3. Configura header Authorization
  4. Redirige a /
```

### 2. Login Google OAuth

```
Usuario hace click "Inicia sesión con Google"
        ↓
Frontend abre Google login popup
        ↓
Usuario autoriza la app
        ↓
Google redirige a: /api/auth/google/callback?code=XXX
        ↓
Backend:
  1. Intercambia code por access_token de Google
  2. Obtiene datos del usuario de Google
  3. Busca o crea usuario en BD
  4. Genera JWT propio
  5. Redirige a frontend con token
        ↓
Frontend:
  1. Extrae token de URL
  2. Guarda en localStorage
  3. Redirige a /
```

### 3. Cada Request Posterior

```
Frontend hace request:
  GET /api/tareas
        ↓
Interceptor agrega:
  Authorization: Bearer <JWT>
  x-csrf-token: <CSRF_TOKEN>
        ↓
Backend middleware:
  1. Extrae JWT del header
  2. Verifica firma (JWT_SECRET)
  3. Verifica no esté expirado
  4. Extrae datos del usuario
  5. Continúa con endpoint
```

---

## Transformación de Datos

El frontend y backend usan modelos ligeramente diferentes:

### Backend devuelve:
```json
{
  "id": 1,
  "titulo": "Mi tarea",
  "descripcion": "Hacer algo",
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
  "titulo": "Mi tarea",
  "descripcion": "Hacer algo",
  "estado": "pendiente",
  "completada": false,
  "usuario_id": 1,
  "createdAt": "2026-05-14T10:30:00Z",
  "updatedAt": "2026-05-14T10:30:00Z"
}
```

**Transformación:** `completada = (estado === 'completada')`

---

## Códigos de Respuesta del Backend

```
200 OK
  └─ Request exitoso, devuelve datos

201 Created
  └─ Recurso creado exitosamente

400 Bad Request
  └─ Datos inválidos (faltan campos, formato incorrecto)

401 Unauthorized
  └─ Token expirado, inválido o falta
  └─ Frontend interceptor redirige a /login

403 Forbidden
  └─ Usuario no tiene permisos (ej: no es admin)

404 Not Found
  └─ Recurso no existe

409 Conflict
  └─ Email ya existe, violación de constraint

500 Internal Server Error
  └─ Error en el servidor (bug)
```

---

## Resumen: Qué Recibe Frontend del Backend

| Cuando | Datos |
|--------|-------|
| Login | JWT + datos usuario |
| Get Tareas | Lista de tareas filtrada por usuario |
| Crear Tarea | Tarea creada con ID nuevo |
| Actualizar Tarea | Tarea actualizada |
| Eliminar Tarea | Confirmación de eliminación |
| Obtener Tags | Lista de tags disponibles |
| Obtener Personas | Lista de contactos |
| Get Usuarios (admin) | Lista de usuarios y roles |
| Error 401 | Limpia token y redirige a login |
| Error 403 | Muestra "No tienes permisos" |
| Error 404 | Muestra "No encontrado" |

---

## Seguridad: Cómo Está Protegido

```
REQUEST                     PROTECCIÓN
  ↓
¿Token válido?           → JWT signature verification
¿Token expirado?         → exp claim check
¿CSRF token presente?    → CSRF validation
¿Origen permitido?       → CORS whitelist
¿Usuario es dueño?       → Comparar user_id con JWT
¿Usuario es admin?       → Verificar rol en JWT
  ↓
BACKEND EJECUTA          (Si todo OK)
```

---

## Archivos Clave en Frontend

```
src/
├─ services/
│  ├─ authService.js      ← Login, logout, JWT management
│  ├─ tareaService.js     ← CRUD tareas
│  ├─ tagService.js       ← CRUD tags
│  └─ personaService.js   ← CRUD personas
│
├─ components/
│  ├─ LoginView.vue       ← Formulario login
│  ├─ GoogleLogin.vue     ← Botón OAuth
│  └─ TareaForm.vue       ← Formulario crear/editar tarea
│
├─ views/
│  └─ TareasView.vue      ← Vista principal (lista tareas)
│
└─ router/
   └─ index.ts            ← Rutas protegidas
```

---

## Archivos Clave en Backend

```
src/
├─ routes/
│  ├─ auth.routes.js      ← POST /api/auth/*
│  ├─ tarea.routes.js     ← GET/POST/PUT/PATCH/DELETE /api/tareas
│  ├─ tag.routes.js       ← GET/POST/PUT/DELETE /api/tags
│  └─ persona.routes.js   ← GET/POST/PUT/DELETE /api/personas
│
├─ controllers/
│  ├─ auth.controller.js  ← Lógica de autenticación
│  ├─ tarea.controller.js ← Lógica de CRUD tareas
│  └─ ...
│
├─ models/
│  ├─ usuario.js          ← Modelo Usuario (Sequelize)
│  ├─ tarea.js            ← Modelo Tarea
│  ├─ tag.js              ← Modelo Tag
│  └─ ...
│
├─ middleware/
│  ├─ auth.js             ← Valida JWT
│  └─ csrf.js             ← Valida CSRF token
│
└─ config/
   ├─ passport.js         ← Configuración Google OAuth
   └─ config.json         ← Credenciales BD
```

---

## Conclusión

El backend proporciona una **API REST completa** que el frontend consume:

1. **Auth Service** — Maneja login, verificación, logout
2. **Tarea Service** — CRUD completo de tareas
3. **Tag Service** — Gestión de etiquetas
4. **Persona Service** — Gestión de contactos
5. **Usuario Service** — Administración de usuarios

Todo está **protegido por JWT**, **CSRF tokens** y **validaciones** en el backend.

El frontend confía en que el backend:
- Valida que los datos sean correctos
- Verifica que el usuario autenticado sea el dueño
- Devuelve solo datos que el usuario puede ver
- Persiste todo en la BD

