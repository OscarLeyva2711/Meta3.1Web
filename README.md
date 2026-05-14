# Sistema de Gestión de Tareas — Meta3.1

Sistema completo de gestión de tareas con autenticación JWT, OAuth Google y base de datos MySQL/MariaDB.

**Stack:** Vue 3 + Vuetify (Frontend) · Express + Sequelize (Backend) · MySQL 8.0+

---

## Tabla de Contenidos

1. [Características](#características)
2. [Requisitos Previos](#requisitos-previos)
3. [Configuración Inicial](#configuración-inicial)
4. [Instalación Paso a Paso](#instalación-paso-a-paso)
5. [Ejecución](#ejecución)
6. [Credenciales por Defecto](#credenciales-por-defecto)
7. [Documentación de Endpoints](#documentación-de-endpoints)
8. [URLs Funcionales](#urls-funcionales)
9. [Pruebas E2E](#pruebas-e2e)
10. [Troubleshooting](#troubleshooting)

---

## Características

- **Autenticación JWT** con cookies HTTP-Only
- **OAuth Google** — Login social sin contraseña
- **Protección CSRF** con doble cookie pattern
- **API RESTful** — CRUD de tareas, personas y tags
- **Relaciones complejas** — 1:N y N:M
- **Control de roles** — admin, usuario, visualizador
- **Documentación Swagger** — `/api-docs`
- **Pruebas E2E** con Playwright
- **HTTPS** con certificados autofirmados  

---

## Requisitos Previos

Asegúrate de tener instalados:

- **Node.js** >= 18.x ([descargar](https://nodejs.org/))
- **MySQL** 8.0 ó **MariaDB** 10.5+ ([descargar](https://www.mysql.com/))
- **Git** (opcional, para versionado)

**Verificar instalaciones:**

```bash
node --version
npm --version
mysql --version
```

---

## Configuración Inicial

### 1. Preparar Base de Datos

Acceder a MySQL/MariaDB y crear la base de datos:

```bash
mysql -u root -p
```

```sql
-- Crear usuario y base de datos
CREATE DATABASE tareas_db;
CREATE USER 'tareas_user'@'localhost' IDENTIFIED BY 'Tareas@2026#Segura';
GRANT ALL PRIVILEGES ON tareas_db.* TO 'tareas_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Parámetros:**
- **Host:** localhost
- **Puerto:** 3306
- **Usuario:** tareas_user
- **Contraseña:** Tareas@2026#Segura
- **Base de datos:** tareas_db

### 2. Configurar Credenciales OAuth Google

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear proyecto nuevo o seleccionar existente
3. Habilitar **Google+ API**
4. Crear credenciales **OAuth 2.0** (tipo: Aplicación web)
5. Autorizar orígenes autorizados:
   - `https://localhost:3000`
   - `https://localhost:5173`
6. Autorizar URIs de redirección:
   - `https://localhost:3000/api/auth/google/callback`
7. Copiar **Client ID** y **Client Secret**
8. Actualizar en `api-tareas-mvc/.env`:
   ```env
   GOOGLE_CLIENT_ID=tu_client_id_aqui
   GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
   ```

---

## Instalación Paso a Paso

### Paso 1: Descargar el Proyecto

```bash
# Si aún no está descargado
cd ~/Downloads
# El proyecto está en: Meta3.1 corregidoCLD/Meta3.1 copy
cd "Meta3.1 corregidoCLD/Meta3.1 copy"
```

### Paso 2: Instalar Dependencias Backend

```bash
cd api-tareas-mvc
npm install
```

**Paquetes principales que se instalan:**
- express (servidor web)
- sequelize (ORM para BD)
- jsonwebtoken (JWT)
- passport (autenticación OAuth)
- bcryptjs (hash de contraseñas)
- cors (manejo de CORS)

### Paso 3: Instalar Dependencias Frontend

```bash
cd ../17marzo26
npm install
```

**Paquetes principales:**
- vue (framework)
- vuetify (UI components)
- axios (cliente HTTP)
- vue-router (enrutamiento)

### Paso 4: Ejecutar Migraciones y Seeders

```bash
cd ../api-tareas-mvc

# Crear tablas
npm run db:migrate

# Insertar datos de prueba
npm run db:seed:all
```

**Tablas creadas:**
- `Personas` — Usuarios/personas del sistema
- `Tareas` — Lista de tareas
- `Tags` — Etiquetas/categorías
- `TareaTags` — Relación muchos-a-muchos
- `Usuarios` — Usuarios con autenticación

---

## Ejecución

### Opción A: Ejecutar Ambos Servidores en Desarrollo

**Terminal 1 — Backend (Puerto 3000):**

```bash
cd api-tareas-mvc
npm run dev
```

Expected output:
```
- Base de datos sincronizada correctamente
- Servidor HTTPS corriendo en https://localhost:3000
- Documentación: https://localhost:3000/api-docs
```

**Terminal 2 — Frontend (Puerto 5173):**

```bash
cd 17marzo26
npm run dev
```

Expected output:
```
VITE v8.0.0  ready in 234 ms
➜  Local:   https://localhost:5173/
```

**Acceder:**
- Frontend: https://localhost:5173/
- Swagger Docs: https://localhost:3000/api-docs

### Opción B: Ejecutar Scripts Proporcionados

```bash
# Terminal 1 — Backend
chmod +x start.sh
./start.sh

# Terminal 2 — Frontend (desde otra terminal)
cd 17marzo26 && npm run dev
```

### Opción C: Verificación de Servicios

```bash
# Verificar disponibilidad de puertos
chmod +x verificar-instalacion.sh
./verificar-instalacion.sh
```

---

## Credenciales por Defecto

### Usuario Admin (Seed Data)

Después de ejecutar `npm run db:seed:all`, se crean:

| Campo | Valor |
|-------|-------|
| **Email** | admin@example.com |
| **Contraseña** | admin123456 |
| **Nombre** | Admin User |
| **Rol** | admin |
| **Estado** | Activo |

### Usuario Test (OAuth)

| Campo | Valor |
|-------|-------|
| **Email** | oscar.leyva@uabc.edu.mx |
| **Método** | Google OAuth |
| **Nombre** | Oscar Leyva Herrera |
| **Rol** | usuario |
| **Estado** | Activo |

### API Key (Autenticación Inicial)

Para obtener JWT sin OAuth:

```
x-api-key: mi_api_key_secreta_12345
```

### Secretos (almacenados en `.env`)

```env
JWT_SECRET=mi_secreto_super_seguro_para_jwt_2024
CSRF_TOKEN_SECRET=mi_secreto_csrf_super_seguro
SESSION_SECRET=mi_secreto_de_sesion_super_seguro_2024
```

---

## Documentación de Endpoints

### Autenticación (sin requerir JWT)

#### POST `/api/auth/login`

Iniciar sesión con email y contraseña.

**Headers:**
```
x-api-key: mi_api_key_secreta_12345
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": 1,
    "email": "admin@example.com",
    "nombre": "Admin User",
    "rol": "admin",
    "activo": true
  }
}
```

#### POST `/api/auth/google/callback`

Callback de Google OAuth (manejado automáticamente).

#### GET `/api/auth/verify`

Verificar sesión actual.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "nombre": "Admin User",
    "rol": "admin"
  }
}
```

#### POST `/api/auth/logout`

Cerrar sesión.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

### Personas

#### GET `/api/personas`

Obtener todas las personas.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Juan García",
      "email": "juan@example.com",
      "createdAt": "2026-04-14T10:30:00Z",
      "updatedAt": "2026-04-14T10:30:00Z"
    }
  ],
  "total": 1
}
```

#### POST `/api/personas`

Crear nueva persona.

**Body:**
```json
{
  "nombre": "Carlos Rodríguez",
  "email": "carlos@example.com"
}
```

**Response (201):** Persona creada con ID

#### GET `/api/personas/{id}`

Obtener persona específica.

#### PUT `/api/personas/{id}`

Actualizar persona completamente.

**Body:**
```json
{
  "nombre": "Carlos López",
  "email": "carlos.lopez@example.com"
}
```

#### DELETE `/api/personas/{id}`

Eliminar persona.

#### GET `/api/personas/{id}/tareas`

Obtener tareas de una persona.

---

### Tareas

#### GET `/api/tareas`

Obtener todas las tareas.

**Query Parameters:**
- `estado` — filtrar por: `pendiente`, `en_progreso`, `completada`
- `personaId` — filtrar por persona asignada

**Example:**
```
GET /api/tareas?estado=pendiente&personaId=1
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Implementar login",
      "descripcion": "Crear endpoint de login con JWT",
      "estado": "pendiente",
      "persona_id": 1,
      "createdAt": "2026-04-14T10:30:00Z",
      "updatedAt": "2026-04-14T10:30:00Z",
      "tags": [
        {
          "id": 1,
          "nombre": "urgente"
        }
      ]
    }
  ]
}
```

#### POST `/api/tareas`

Crear nueva tarea.

**Body:**
```json
{
  "titulo": "Implementar API",
  "descripcion": "Crear endpoints REST",
  "estado": "pendiente",
  "persona_id": 1,
  "tagIds": [1, 2]
}
```

#### GET `/api/tareas/{id}`

Obtener tarea específica.

#### PUT `/api/tareas/{id}`

Actualizar tarea completamente.

**Body:**
```json
{
  "titulo": "Implementar API (actualizado)",
  "descripcion": "Crear endpoints REST con documentación",
  "estado": "en_progreso",
  "persona_id": 1,
  "tagIds": [1, 2, 3]
}
```

#### PATCH `/api/tareas/{id}`

Actualizar tarea parcialmente.

**Body (solo los campos a actualizar):**
```json
{
  "estado": "completada"
}
```

#### DELETE `/api/tareas/{id}`

Eliminar tarea.

#### GET `/api/tareas/{id}/tags`

Obtener tags de una tarea.

#### POST `/api/tareas/{id}/tags/{tagId}`

Asignar tag a tarea.

#### DELETE `/api/tareas/{id}/tags/{tagId}`

Remover tag de tarea.

---

### Tags

#### GET `/api/tags`

Obtener todos los tags.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "urgente",
      "createdAt": "2026-04-14T10:30:00Z"
    }
  ]
}
```

#### POST `/api/tags`

Crear nuevo tag.

**Body:**
```json
{
  "nombre": "en_revisión"
}
```

#### GET `/api/tags/{id}`

Obtener tag específico.

#### PUT `/api/tags/{id}`

Actualizar tag.

#### DELETE `/api/tags/{id}`

Eliminar tag.

#### GET `/api/tags/{id}/tareas`

Obtener tareas con un tag específico.

---

### Usuarios

#### POST `/api/usuarios/registro`

Registrar nuevo usuario.

**Headers:**
```
x-api-key: mi_api_key_secreta_12345
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan.perez@example.com",
  "password": "MiPassword123!",
  "passwordConfirm": "MiPassword123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "nombre": "Juan Pérez",
    "email": "juan.perez@example.com",
    "rol": "usuario",
    "activo": true
  }
}
```

#### GET `/api/usuarios`

Obtener todos los usuarios.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

#### GET `/api/usuarios/{id}`

Obtener usuario específico.

#### PATCH `/api/usuarios/{id}`

Actualizar usuario (cambiar rol, estado, etc).

**Body:**
```json
{
  "activo": false,
  "rol": "visualizador"
}
```

#### DELETE `/api/usuarios/{id}`

Eliminar usuario.

---

## URLs Funcionales

### Acceso Local

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | https://localhost:5173/ | Aplicación Vue |
| **Backend API** | https://localhost:3000/ | Servidor Express |
| **Swagger Docs** | https://localhost:3000/api-docs | Documentación interactiva |
| **Colección Postman** | `./Coleccion.JSON` | Importar en Postman |

### Testing URLs

```bash
# Verificar backend disponible
curl -k https://localhost:3000/health 2>/dev/null | jq

# Verificar frontend disponible
curl -k https://localhost:5173/ 2>/dev/null | head -20

# Obtener documentación Swagger
curl -k https://localhost:3000/api-docs 2>/dev/null | jq '.info'
```

### Flujos de Prueba

#### 1. Login Local

```bash
# Obtener JWT
curl -k -X POST https://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "x-api-key: mi_api_key_secreta_12345" \
  -d '{"email":"admin@example.com","password":"admin123456"}' | jq
```

Response esperada:
```json
{
  "success": true,
  "token": "eyJ...",
  "data": {
    "id": 1,
    "email": "admin@example.com",
    "nombre": "Admin User",
    "rol": "admin"
  }
}
```

#### 2. Usar JWT para Obtener Tareas

```bash
export TOKEN="eyJ..."  # Del paso anterior

curl -k -X GET https://localhost:3000/api/tareas \
  -H "Authorization: Bearer $TOKEN" | jq
```

#### 3. Login con Google

1. Acceder a https://localhost:5173/
2. Hacer click en "Inicia sesión con Google"
3. Seleccionar cuenta de prueba
4. Será redirigido al dashboard

---

## Pruebas E2E

### Instalar Playwright

```bash
npm install
npm run install:browsers
```

### Ejecutar Tests

```bash
# Todas las pruebas
npm run test

# Con interfaz gráfica
npm run test:ui

# Test específico (autenticación)
npm run test:auth

# Ver reporte
npm run report
```

### Tests Disponibles

| Archivo | Descripción |
|---------|-------------|
| `tests/auth.spec.ts` | Login, logout, OAuth flow |
| `tests/tareas.spec.ts` | CRUD de tareas |
| `tests/jwt-crud.spec.ts` | Pruebas de JWT |
| `tests/admin-tags.spec.ts` | Gestión de tags y usuarios |

---

## Troubleshooting

### Error: "ECONNREFUSED" en puerto 3000

**Causa:** Backend no está ejecutándose o puerto está en uso.

**Solución:**
```bash
# Verificar si algo está usando el puerto 3000
lsof -i :3000

# Matar el proceso (si es necesario)
kill -9 <PID>

# Reiniciar backend
cd api-tareas-mvc
npm run dev
```

### Error: "ECONNREFUSED" en puerto 5173

**Causa:** Frontend no está ejecutándose.

**Solución:**
```bash
cd 17marzo26
npm run dev
```

### Error: "Access denied for user 'tareas_user'@'localhost'"

**Causa:** Credenciales de BD incorrectas.

**Solución:**
```bash
# Verificar credenciales en api-tareas-mvc/config/config.json
# Deben ser:
# "username": "tareas_user"
# "password": "Tareas@2026#Segura"

# Si no existen, crearlas en MySQL:
mysql -u root -p
CREATE USER 'tareas_user'@'localhost' IDENTIFIED BY 'Tareas@2026#Segura';
GRANT ALL PRIVILEGES ON tareas_db.* TO 'tareas_user'@'localhost';
FLUSH PRIVILEGES;
```

### Error: "Certificados no encontrados"

**Causa:** Falta `key.pem` o `cert.pem`.

**Solución:**
```bash
# Backend busca certificados en: ../certs o ./certs
# Verificar ubicación
ls -la ../certs/
ls -la ./certs/

# Si no existen, generarlos:
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

### Error: "Google OAuth no funciona"

**Causa:** Credenciales de Google incorrectas.

**Solución:**
1. Verificar `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en `.env`
2. Confirmar que https://localhost:3000/api/auth/google/callback está en la consola de Google
3. Limpiar cookies del navegador
4. Intentar de nuevo

### Error: "JWT expirado"

**Causa:** Token JWT expiró (defecto: 24h).

**Solución:**
```bash
# Obtener nuevo token
curl -k -X POST https://localhost:3000/api/auth/login \
  -H "x-api-key: mi_api_key_secreta_12345" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123456"}'
```

### Error: "CORS policy violation"

**Causa:** Frontend y Backend tienen origins diferentes.

**Solución:**
Verificar que `CLIENT_URL` en `.env` coincide:
```env
CLIENT_URL=https://localhost:5173
FRONTEND_URL=https://localhost:5173
```

### Error: "Database not found"

**Causa:** Base de datos no fue creada.

**Solución:**
```bash
mysql -u root -p
CREATE DATABASE tareas_db;
FLUSH PRIVILEGES;

# Luego ejecutar migraciones
cd api-tareas-mvc
npm run db:migrate
npm run db:seed:all
```

---

## 📊 Estructura del Proyecto

```
Meta3.1 copy/
├── 17marzo26/                          # Frontend Vue + Vuetify
│   ├── src/
│   │   ├── components/                 # Componentes reutilizables
│   │   │   ├── LoginView.vue
│   │   │   ├── GoogleLogin.vue
│   │   │   ├── OAuthCallback.vue
│   │   │   ├── TareaCard.vue
│   │   │   └── TareaForm.vue
│   │   ├── views/
│   │   │   └── TareasView.vue          # Vista principal
│   │   ├── services/
│   │   │   ├── authService.js          # Servicio de autenticación
│   │   │   ├── tareaService.js         # Servicio de tareas
│   │   │   └── tagService.js           # Servicio de tags
│   │   ├── router/
│   │   │   └── index.ts                # Configuración de rutas
│   │   └── main.ts                     # Punto de entrada
│   ├── package.json
│   └── vite.config.mts
│
├── api-tareas-mvc/                     # Backend Express + Sequelize
│   ├── src/
│   │   ├── app.js                      # Configuración de Express
│   │   ├── config/
│   │   │   ├── config.json             # Credenciales BD
│   │   │   └── passport.js             # Configuración OAuth
│   │   ├── middleware/
│   │   │   └── auth.js                 # Validación JWT
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── tarea.controller.js
│   │   │   └── usuario.controller.js
│   │   ├── models/
│   │   │   ├── usuario.js
│   │   │   ├── tarea.js
│   │   │   └── tag.js
│   │   └── routes/
│   │       ├── auth.routes.js
│   │       ├── tareas.routes.js
│   │       └── tags.routes.js
│   ├── migrations/                     # Migraciones DB
│   ├── seeders/                        # Datos iniciales
│   ├── config/config.json
│   ├── server.js                       # Punto de entrada
│   ├── .env                            # Variables de entorno
│   └── openapi.yaml                    # Documentación Swagger
│
├── tests/                              # Tests E2E Playwright
│   ├── auth.spec.ts
│   ├── tareas.spec.ts
│   └── fixtures/users.ts
│
├── certs/                              # Certificados HTTPS
│   ├── cert.pem
│   └── key.pem
│
├── Coleccion.JSON                      # Colección Postman
├── USUARIOS_BD.md                      # Credenciales BD
├── CORRECCIONES.md                     # Cambios realizados
└── README.md                           # Este archivo
```

---

## Pasos Rápidos para Empezar

```bash
# 1. Crear BD
mysql -u root -p < api-tareas-mvc/migrations/schema.sql

# 2. Instalar dependencias
cd api-tareas-mvc && npm install
cd ../17marzo26 && npm install

# 3. Migraciones
cd ../api-tareas-mvc
npm run db:migrate
npm run db:seed:all

# 4. Terminal 1 — Backend
npm run dev

# 5. Terminal 2 — Frontend
cd ../17marzo26
npm run dev

# 6. Acceder
# Frontend: https://localhost:5173/
# Backend: https://localhost:3000/
# Docs: https://localhost:3000/api-docs
```

---

## Soporte

- **Documentación Swagger:** https://localhost:3000/api-docs
- **Archivo de Correcciones:** `CORRECCIONES.md`
- **Credenciales:** `USUARIOS_BD.md`
- **Tests E2E:** `tests/` (ejecutar con `npm run test:ui`)

---

## Versión

- **Meta3.1** — Sistema de Gestión de Tareas
- **Fecha:** 13 de mayo de 2026
- **Stack:** Vue 3 + Vuetify + Express + Sequelize + MySQL
- **Licencia:** ISC

---

## Checklist de Verificación

Antes de iniciar, asegúrate de:

- [ ] Node.js instalado (v18+)
- [ ] MySQL/MariaDB corriendo en puerto 3306
- [ ] Base de datos `tareas_db` creada
- [ ] Usuario `tareas_user` con acceso a `tareas_db`
- [ ] Credenciales de Google OAuth configuradas
- [ ] Certificados HTTPS existentes en `./certs/`
- [ ] Variables de entorno en `api-tareas-mvc/.env`
- [ ] Migraciones ejecutadas (`npm run db:migrate`)
- [ ] Seeders ejecutados (`npm run db:seed:all`)
- [ ] Backend ejecutándose en puerto 3000
- [ ] Frontend ejecutándose en puerto 5173

---

**Sistema listo para usar!**
