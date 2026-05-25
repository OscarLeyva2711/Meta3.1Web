# Diagrama de Flujo: Cómo Funciona la Aplicación

## 1. INICIO DE LA APLICACIÓN

```
┌──────────────────────┐
│ Usuario abre browser │
│ https://localhost:5173
└──────────────────────┘
           │
           ▼
┌──────────────────────────┐
│ Carga main.ts            │
│ - Crea app Vue           │
│ - Registra plugins       │
│ - Monta en #app          │
└──────────────────────────┘
           │
           ▼
┌──────────────────────────┐
│ Router verifica:         │
│ ¿Existe token en localStorage?
└──────────────────────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
   SI          NO
  ├─►  Carga    ├─► Redirige
  │   TareasView    a /login
  │    (home)   └─── Muestra
  │               LoginView
  └
```

---

## 2. FLUJO DE LOGIN (Email + Password)

```
┌────────────────────────────────────────────────────────────┐
│ FRONTEND (navegador)                                        │
│                                                            │
│  Usuario ingresa email y password                          │
│         │                                                  │
│         ▼                                                  │
│  onClick="handleLogin"                                    │
│         │                                                  │
│         ▼                                                  │
│  authService.login(email, password)                       │
│         │                                                  │
│         ▼                                                  │
│  Interceptor agrega headers:                              │
│  - x-api-key: 'mi_api_key_secreta_12345'                 │
│         │                                                  │
│         ▼                                                  │
│  POST https://localhost:3000/api/auth/login               │
│  Body: { email, password }                                │
└────────────────────────────────────────────────────────────┘
                       │
                       │ HTTPS
                       │
┌────────────────────────────────────────────────────────────┐
│ BACKEND (Express)                                           │
│                                                            │
│  Recibe POST /api/auth/login                              │
│         │                                                  │
│         ▼                                                  │
│  Middleware CORS valida origin                            │
│         │                                                  │
│         ▼                                                  │
│  Extrae { email, password } del body                      │
│         │                                                  │
│         ▼                                                  │
│  Busca usuario por email en BD                            │
│         │                                                  │
│    ┌────┴────┐                                            │
│    │         │                                            │
│    ▼         ▼                                            │
│ Encontrado  NO encontrado                                │
│    │         │                                            │
│    │         └─► Devuelve 401:                           │
│    │             { error: "Email no existe" }            │
│    │                                                      │
│    ▼                                                      │
│ Compara password con bcryptjs                            │
│    │                                                      │
│    ┌────┴────┐                                            │
│    │         │                                            │
│    ▼         ▼                                            │
│ Válido    INVÁLIDO                                        │
│    │         │                                            │
│    │         └─► Devuelve 401:                           │
│    │             { error: "Password incorrecto" }        │
│    │                                                      │
│    ▼                                                      │
│ Genera JWT con:                                           │
│ { id, email, rol, iat, exp }                             │
│    │                                                      │
│    ▼                                                      │
│ Devuelve 200:                                             │
│ {                                                         │
│   "success": true,                                        │
│   "token": "eyJhbGc...",                                 │
│   "data": {                                               │
│     "id": 1,                                              │
│     "email": "admin@example.com",                        │
│     "nombre": "Admin User",                               │
│     "rol": "admin"                                        │
│   }                                                       │
│ }                                                         │
└────────────────────────────────────────────────────────────┘
                       │
                       │ HTTPS
                       │
┌────────────────────────────────────────────────────────────┐
│ FRONTEND recibe respuesta                                  │
│         │                                                  │
│         ▼                                                  │
│ Extrae token                                              │
│         │                                                  │
│         ▼                                                  │
│ authService.setAuthData(token, email)                    │
│         │                                                  │
│         ▼                                                  │
│ Guarda en localStorage:                                   │
│ - authToken = "eyJhbGc..."                               │
│ - userEmail = "admin@example.com"                        │
│ - userRole = "admin"                                      │
│ - userId = "1"                                            │
│         │                                                  │
│         ▼                                                  │
│ Configura header para próximos requests:                 │
│ apiClient.defaults.headers.Authorization =               │
│   "Bearer eyJhbGc..."                                    │
│         │                                                  │
│         ▼                                                  │
│ Emite evento 'login-success'                             │
│         │                                                  │
│         ▼                                                  │
│ router.push('/')  → Redirige a home                       │
│         │                                                  │
│         ▼                                                  │
│ Carga TareasView                                          │
└────────────────────────────────────────────────────────────┘
```

---

## 3. FLUJO DE GOOGLE OAUTH

```
┌──────────────────────────────┐
│ Usuario hace click            │
│ "Inicia sesión con Google"   │
└──────────────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Frontend abre popup:          │
│ Redirige a Google login       │
│ (credentials.google.com)      │
└──────────────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Usuario ingresa credenciales  │
│ de Google                     │
└──────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│ Usuario autoriza acceso de la app                        │
│ (permisos: email, perfil)                               │
└──────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│ Google redirige a:                                       │
│ https://localhost:3000/api/auth/google/callback?code=XX
│                                                          │
│ El code es un token temporal de Google                   │
└──────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│ BACKEND (Express)                                        │
│                                                          │
│ GET /api/auth/google/callback?code=XXX                 │
│         │                                                │
│         ▼                                                │
│ Usa code para obtener access_token de Google           │
│         │                                                │
│         ▼                                                │
│ Usa access_token para obtener datos del usuario        │
│ (email, nombre, foto, etc.)                             │
│         │                                                │
│         ▼                                                │
│ Busca usuario en BD por email                           │
│         │                                                │
│    ┌────┴────┐                                           │
│    │         │                                           │
│    ▼         ▼                                           │
│ Existe    NO existe                                      │
│    │         │                                           │
│    │         └─► Crea usuario nuevo en BD               │
│    │             (email, nombre, rol="usuario")         │
│    │                                                    │
│    ▼                                                    │
│ Genera JWT propio con usuario_id                       │
│         │                                                │
│         ▼                                                │
│ Redirige a frontend:                                   │
│ https://localhost:5173/oauth-callback?token=XXX        │
│                                                          │
│ (o coloca token en cookie)                              │
└──────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│ FRONTEND (OAuthCallback.vue monta)                      │
│                                                          │
│ Extrae token de URL:                                   │
│ const token = params.get('token')                      │
│         │                                                │
│         ▼                                                │
│ authService.setAuthData(token)                         │
│         │                                                │
│         ▼                                                │
│ Guarda en localStorage                                 │
│         │                                                │
│         ▼                                                │
│ router.push('/')                                       │
│         │                                                │
│         ▼                                                │
│ Usuario ve TareasView (autenticado)                   │
└──────────────────────────────────────────────────────────┘
```

---

## 4. FLUJO DE OBTENER TAREAS (GET)

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND                                                     │
│                                                             │
│ TareasView.vue monta                                        │
│         │                                                   │
│         ▼                                                   │
│ mounted() {                                                 │
│   tareaService.getAll()                                    │
│ }                                                           │
│         │                                                   │
│         ▼                                                   │
│ tareaService.getAll() =                                    │
│   apiClient.get('/tareas')                                │
│         │                                                   │
│         ▼                                                   │
│ Interceptor de Request agrega:                            │
│ - Authorization: Bearer <token_from_localStorage>        │
│ - x-csrf-token: <token_from_cookie>                      │
│ - Content-Type: application/json                         │
│         │                                                   │
│         ▼                                                   │
│ GET https://localhost:3000/api/tareas                    │
└─────────────────────────────────────────────────────────────┘
                       │
                       │ HTTPS
                       │
┌─────────────────────────────────────────────────────────────┐
│ BACKEND                                                      │
│                                                             │
│ GET /api/tareas                                            │
│         │                                                   │
│         ▼                                                   │
│ authMiddleware:                                            │
│ 1. Extrae JWT del header Authorization                    │
│    "Bearer eyJhbGc..."                                    │
│ 2. Valida JWT con JWT_SECRET                             │
│ 3. Verifica no esté expirado                             │
│ 4. Extrae payload: { id, email, rol }                    │
│ 5. Agrega a req.user = { id, email, rol }               │
│         │                                                   │
│         ▼                                                   │
│ tareaController.getAll():                                │
│ const tareas = await Tarea.findAll({                     │
│   where: { usuario_id: req.user.id }  ◄──────┐          │
│ })                        Filtro importante  │          │
│         │                                    │          │
│         ▼                                    │          │
│ Ejecuta SQL:                                 │          │
│ SELECT * FROM tareas                         │          │
│ WHERE usuario_id = 1                         │──────────┘
│ AND (otros filtros opcionales)
│         │                                                   │
│         ▼                                                   │
│ BD devuelve registros                                      │
│         │                                                   │
│         ▼                                                   │
│ Controller formatea respuesta:                            │
│ {                                                          │
│   "success": true,                                         │
│   "data": [                                                │
│     {                                                      │
│       "id": 1,                                             │
│       "titulo": "Implementar login",                      │
│       "descripcion": "Crear endpoint",                    │
│       "estado": "pendiente",                              │
│       "usuario_id": 1,                                    │
│       "createdAt": "2026-05-14T10:30:00Z",              │
│       "updatedAt": "2026-05-14T10:30:00Z"               │
│     },                                                     │
│     { ... otra tarea ... }                                │
│   ],                                                       │
│   "total": 2                                               │
│ }                                                          │
│         │                                                   │
│         ▼                                                   │
│ Devuelve respuesta 200 + JSON                            │
└─────────────────────────────────────────────────────────────┘
                       │
                       │ HTTPS (JSON)
                       │
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND recibe respuesta                                   │
│         │                                                   │
│         ▼                                                   │
│ Interceptor de Response verifica status                    │
│         │                                                   │
│    ┌────┴────┐                                             │
│    │         │                                             │
│    ▼         ▼                                             │
│  200      NO 200                                           │
│    │         │                                             │
│    │         └─► SI 401: Limpia token,                   │
│    │             redirige a /login                       │
│    │                                                      │
│    ▼                                                      │
│ tareaService transforma datos:                           │
│ .then(r => unwrapList(r.data))                           │
│ {                                                         │
│   "data": [                                               │
│     {                                                     │
│       ...todos los campos...                             │
│       "completada": false  ◄─── AGREGADO
│       // derivado de estado === 'completada'
│     }                                                     │
│   ]                                                       │
│ }                                                         │
│         │                                                  │
│         ▼                                                  │
│ Devuelve datos al componente                              │
│         │                                                  │
│         ▼                                                  │
│ Componente recibe datos:                                  │
│ tareas.value = response.data                              │
│         │                                                  │
│         ▼                                                  │
│ Vue detecta cambio reactivo                               │
│         │                                                  │
│         ▼                                                  │
│ Re-renderiza template                                     │
│         │                                                  │
│         ▼                                                  │
│ Usuario ve lista de tareas en pantalla                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. FLUJO DE CREAR TAREA (POST)

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND                                                     │
│                                                             │
│ Usuario hace click "Nueva Tarea"                           │
│         │                                                   │
│         ▼                                                   │
│ <TareaForm @submit="crearTarea" />                        │
│         │                                                   │
│         ▼                                                   │
│ crearTarea(formData) {                                     │
│   const datos = {                                          │
│     titulo: "Aprender Vue",                               │
│     descripcion: "Estudiar docs",                         │
│     estado: "pendiente",                                  │
│     persona_id: null,                                     │
│     tagIds: [1, 2]                                        │
│   }                                                        │
│                                                             │
│   tareaService.crear(datos)                               │
│ }                                                           │
│         │                                                   │
│         ▼                                                   │
│ tareaService.crear(datos) {                               │
│   return apiClient.post(                                  │
│     '/tareas',                                            │
│     toBackend(datos)  ◄──── TRANSFORMACIÓN               │
│   )                                                        │
│ }                                                           │
│         │                                                   │
│         ▼                                                   │
│ toBackend(datos):                                         │
│ Transforma {                                              │
│   titulo: "Aprender Vue",                                │
│   descripcion: "Estudiar docs",                          │
│   estado: "pendiente",                                   │
│   persona_id: null,                                      │
│   tagIds: [1, 2]                                         │
│   // Remueve campos innecesarios:
│   // - id, createdAt, updatedAt, tags, usuario, persona
│ }                                                          │
│         │                                                   │
│         ▼                                                   │
│ Interceptor agrega:                                       │
│ - Authorization: Bearer <token>                          │
│ - x-csrf-token: <token>                                  │
│         │                                                   │
│         ▼                                                   │
│ POST https://localhost:3000/api/tareas                   │
│ Body: { titulo, descripcion, estado, ... }               │
└─────────────────────────────────────────────────────────────┘
                       │
                       │ HTTPS
                       │
┌─────────────────────────────────────────────────────────────┐
│ BACKEND                                                      │
│                                                             │
│ POST /api/tareas                                           │
│         │                                                   │
│         ▼                                                   │
│ authMiddleware (igual que GET)                            │
│ req.user.id = 1  (del JWT)                                │
│         │                                                   │
│         ▼                                                   │
│ tareaController.crear():                                 │
│ const nuevaTarea = await Tarea.create({                 │
│   titulo: req.body.titulo,                              │
│   descripcion: req.body.descripcion,                    │
│   estado: req.body.estado,                              │
│   usuario_id: req.user.id  ◄────────────────┐          │
│                           El backend        │          │
│ })                        asigna el usuario │          │
│         │                 automáticamente    │          │
│         ▼                  (NO puede        │          │
│                            manipularse)    │          │
│ Inserta en BD:                              │          │
│ INSERT INTO tareas                          │          │
│   (titulo, descripcion, estado, usuario_id) │          │
│ VALUES                                       │          │
│   ('Aprender Vue', 'Estudiar', 'pendiente', 1) ◄───────┘
│         │                                                   │
│         ▼                                                   │
│ Si hay tagIds en body:                                    │
│ await nuevaTarea.addTags(req.body.tagIds)                │
│         │                                                   │
│         ▼                                                   │
│ Devuelve tarea creada:                                   │
│ {                                                          │
│   "success": true,                                        │
│   "data": {                                               │
│     "id": 42,  ◄────── NUEVO ID GENERADO               │
│     "titulo": "Aprender Vue",                            │
│     "descripcion": "Estudiar docs",                      │
│     "estado": "pendiente",                               │
│     "usuario_id": 1,                                     │
│     "createdAt": "2026-05-14T11:00:00Z",               │
│     "updatedAt": "2026-05-14T11:00:00Z"                │
│   }                                                       │
│ }                                                          │
└─────────────────────────────────────────────────────────────┘
                       │
                       │ HTTPS
                       │
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND recibe respuesta                                   │
│         │                                                   │
│         ▼                                                   │
│ unwrapOne(response.data):                                 │
│ Agrega "completada" basado en estado:                     │
│ {                                                          │
│   "id": 42,                                               │
│   "titulo": "Aprender Vue",                              │
│   "completada": false  ◄─── AGREGADO (estado === 'completada')
│   ...resto de campos...                                   │
│ }                                                          │
│         │                                                   │
│         ▼                                                   │
│ tareas.value.push(nuevaTarea)                             │
│         │                                                   │
│         ▼                                                   │
│ Vue detecta cambio en array                               │
│         │                                                   │
│         ▼                                                   │
│ Re-renderiza la lista                                     │
│         │                                                   │
│         ▼                                                   │
│ Usuario ve nueva tarea en la lista                        │
│ (sin recargar la página)                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. FLUJO DE LOGOUT

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND                                                     │
│                                                             │
│ Usuario hace click "Cerrar Sesión"                         │
│         │                                                   │
│         ▼                                                   │
│ await authService.logout()                                │
│         │                                                   │
│         ▼                                                   │
│ POST /api/auth/logout                                     │
│ Headers: Authorization: Bearer <token>                    │
│         │                                                   │
└─────────────────────────────────────────────────────────────┘
                       │
                       │ HTTPS
                       │
┌─────────────────────────────────────────────────────────────┐
│ BACKEND                                                      │
│                                                             │
│ POST /api/auth/logout                                     │
│         │                                                   │
│         ▼                                                   │
│ Valida JWT (igual que otros endpoints)                   │
│         │                                                   │
│         ▼                                                   │
│ (Opcional) Agrega token a blacklist                       │
│         │                                                   │
│         ▼                                                   │
│ Devuelve { success, message }                             │
└─────────────────────────────────────────────────────────────┘
                       │
                       │ HTTPS
                       │
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND recibe respuesta                                   │
│         │                                                   │
│         ▼                                                   │
│ clearAuthData() {                                          │
│   localStorage.removeItem('authToken')                    │
│   localStorage.removeItem('userEmail')                    │
│   localStorage.removeItem('userRole')                     │
│   localStorage.removeItem('userId')                       │
│   delete apiClient.headers.Authorization                  │
│   clearAuthCookies()  (expira jwt_token y csrf_token)    │
│ }                                                           │
│         │                                                   │
│         ▼                                                   │
│ Emite evento 'logout'                                      │
│         │                                                   │
│         ▼                                                   │
│ router.push('/login')                                     │
│         │                                                   │
│         ▼                                                   │
│ Usuario ve LoginView                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. MANEJO DE ERRORES 401 (Token Expirado)

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND hace request (con token expirado)                  │
│         │                                                   │
│         ▼                                                   │
│ POST /api/tareas                                          │
│ Authorization: Bearer <token_expirado>                    │
└─────────────────────────────────────────────────────────────┘
                       │
                       │ HTTPS
                       │
┌─────────────────────────────────────────────────────────────┐
│ BACKEND                                                      │
│                                                             │
│ authMiddleware:                                            │
│ jwt.verify(token, JWT_SECRET)                             │
│         │                                                   │
│         ▼                                                   │
│ Token expirado → lanza error                              │
│         │                                                   │
│         ▼                                                   │
│ Devuelve 401:                                             │
│ { error: "Token expirado" }                               │
└─────────────────────────────────────────────────────────────┘
                       │
                       │ HTTPS
                       │
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND                                                     │
│                                                             │
│ Interceptor de Response:                                   │
│ if (error.response.status === 401) {                       │
│   const path = window.location.pathname                   │
│                                                             │
│   // Rutas seguras donde está permitido fallar:           │
│   const SAFE_PATHS = ['/login', '/oauth-callback']       │
│                                                             │
│   if (!SAFE_PATHS.includes(path)) {                       │
│     // Estábamos en ruta protegida                         │
│     localStorage.removeItem('authToken')                  │
│     window.location.href = '/login'                       │
│     // Fuerza redirección a login                         │
│   }                                                         │
│   // Si estábamos en /login: permite que falle             │
│   // (para mostrar error al usuario)                       │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. ARQUITECTURA DE CARPETAS Y FLUJO

```
Meta3.1 copy/
│
├─ 17marzo26/  (FRONTEND - Puerto 5173)
│  │
│  ├─ src/
│  │  │
│  │  ├─ main.ts
│  │  │   └─► Punto de entrada Vue
│  │  │
│  │  ├─ App.vue
│  │  │   └─► Componente raíz
│  │  │
│  │  ├─ router/
│  │  │  └─ index.ts
│  │  │      └─► Define rutas + guard beforeEach
│  │  │          (verifica autenticación)
│  │  │
│  │  ├─ services/  (Comunican con backend)
│  │  │  ├─ authService.js  (login, logout, verify)
│  │  │  ├─ tareaService.js (CRUD tareas)
│  │  │  ├─ tagService.js
│  │  │  ├─ personaService.js
│  │  │  └─ usuarioService.js
│  │  │      Todos usan: apiClient (Axios)
│  │  │
│  │  ├─ components/
│  │  │  ├─ LoginView.vue
│  │  │  ├─ GoogleLogin.vue
│  │  │  ├─ OAuthCallback.vue
│  │  │  ├─ TareaForm.vue
│  │  │  └─ TareaCard.vue
│  │  │
│  │  └─ views/
│  │     └─ TareasView.vue  (vista principal)
│  │
│  └─ localStorage:
│     ├─ authToken (JWT)
│     ├─ userEmail
│     ├─ userRole
│     └─ userId
│
├─ api-tareas-mvc/  (BACKEND - Puerto 3000)
│  │
│  ├─ src/
│  │  │
│  │  ├─ server.js  (punto de entrada)
│  │  │   └─► Crea instancia Express
│  │  │
│  │  ├─ app.js  (configuración)
│  │  │   ├─ CORS
│  │  │   ├─ Middleware JSON
│  │  │   ├─ Sessiones Passport
│  │  │   └─ Monta rutas
│  │  │
│  │  ├─ routes/  (define endpoints)
│  │  │  ├─ auth.routes.js     (POST /api/auth/*)
│  │  │  ├─ tarea.routes.js    (GET/POST/PUT/PATCH /api/tareas/*)
│  │  │  ├─ tag.routes.js
│  │  │  ├─ persona.routes.js
│  │  │  ├─ usuario.routes.js
│  │  │  └─ googleAuth.routes.js
│  │  │
│  │  ├─ controllers/  (lógica de cada ruta)
│  │  │  ├─ auth.controller.js
│  │  │  ├─ tarea.controller.js
│  │  │  ├─ tag.controller.js
│  │  │  ├─ persona.controller.js
│  │  │  └─ usuario.controller.js
│  │  │
│  │  ├─ models/  (Sequelize ORM)
│  │  │  ├─ usuario.js
│  │  │  ├─ tarea.js
│  │  │  ├─ tag.js
│  │  │  ├─ persona.js
│  │  │  └─ index.js (sincroniza modelos)
│  │  │
│  │  ├─ middleware/
│  │  │  ├─ auth.js  (valida JWT)
│  │  │  └─ csrf.js  (valida CSRF token)
│  │  │
│  │  ├─ config/
│  │  │  ├─ passport.js  (estrategia Google OAuth)
│  │  │  └─ config.json  (credenciales BD)
│  │  │
│  │  └─ .env
│  │     ├─ JWT_SECRET
│  │     ├─ GOOGLE_CLIENT_ID
│  │     ├─ GOOGLE_CLIENT_SECRET
│  │     └─ etc.
│  │
│  ├─ migrations/  (scripts para crear tablas)
│  │  └─ Sequelize crea tablas automáticamente
│  │
│  └─ seeders/  (scripts para datos iniciales)
│     └─ Crea usuario admin, tags, etc.
│
└─ certs/  (HTTPS)
   ├─ cert.pem
   └─ key.pem
```

---

## Resumen: La Magia Detrás

```
Usuario en navegador (Frontend Vue)
           ↓ (hace acción)
       Componente
           ↓
       Service (authService, tareaService)
           ↓
    Axios + Interceptor
           ↓ (agrega JWT automáticamente)
           ↓ (HTTPS)
           ↓
    Backend Express
           ↓
    authMiddleware (valida JWT)
           ↓
    Controller (lógica)
           ↓
    Sequelize (ORM)
           ↓
    MySQL Base de Datos
           ↓ (devuelve datos)
    Sequelize
           ↓
    Controller (formatea JSON)
           ↓
    Backend responde (200 o error)
           ↓
    Frontend Interceptor recibe
           ↓
    Service transforma datos
           ↓
    Componente actualiza estado
           ↓
    Vue re-renderiza
           ↓
    Usuario ve cambios en pantalla
```

**TODO sin recargar la página (SPA = Single Page Application)**

