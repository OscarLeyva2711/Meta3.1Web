# API de Tareas con JWT y Protección CSRF

Servidor REST para manejar tareas con autenticación JWT y protección CSRF usando cookies HTTP-Only.

## Características

✅ Autenticación con JWT almacenado en cookie HTTP-Only  
✅ Protección CSRF con doble cookie pattern  
✅ API Key para autenticación inicial  
✅ Endpoints REST para tareas (GET, POST, PUT, PATCH, DELETE)  
✅ Middleware de autenticación robusto  
✅ Manejo de errores adecuado  
✅ Ejemplo de cliente incluido  
✅ Arquitectura MVC  

## Estructura del Proyecto

```
api-tareas-mvc/
├── server.js              # Servidor principal
├── .env                   # Variables de entorno
├── src/
│   ├── app.js            # Configuración de Express
│   ├── middleware/
│   │   └── auth.js       # Middleware de autenticación
│   ├── controllers/
│   │   ├── authController.js    # Controlador de autenticación
│   │   └── tarea.controller.js   # Controlador de tareas
│   ├── models/
│   │   └── tarea.model.js       # Modelo de tareas
│   └── routes/
│       ├── auth.js       # Rutas de autenticación
│       └── tarea.routes.js      # Rutas de tareas
├── ejemplo_cliente.js     # Ejemplo de cliente para pruebas
└── README.md             # Este archivo
```

## 🚀 Instalación Rápida

### 1. Instalar dependencias del proyecto
```bash
npm install
```

### 2. Instalar Sequelize y dependencias de BD (MariaDB/MySQL)
```bash
npm install sequelize sequelize-cli mysql2
```

### 3. Configurar Base de Datos
- Editar `config/config.json` con tus credenciales de MariaDB (usuario: root, puerto: 3306)
- Crear la base de datos: `mysql -u root -p -e "CREATE DATABASE tareas_db;"`

### 4. Ejecutar Migraciones y Seeders
```bash
npm run db:migrate      # Crea las tablas
npm run db:seed:all     # Inserta datos de prueba
```

### 5. Iniciar servidor
```bash
npm run dev
```

## 📚 Documentación Completa

- **[SEQUELIZE-SETUP.md](./SEQUELIZE-SETUP.md)** - Guía detallada de instalación y configuración
- **[IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md)** - Resumen de la implementación
- **[CHECKLIST.md](./CHECKLIST.md)** - Lista de verificación paso a paso

## Instalación (Original)

1. Clonar o descargar el proyecto
2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno (el archivo `.env` ya está creado con valores por defecto)

## Configuración

El archivo `.env` contiene:

```env
PORT=3000
CLIENT_URL=http://localhost:5173
JWT_SECRET=mi_secreto_super_seguro_para_jwt_2024
JWT_EXPIRES_IN=1h
API_KEY=mi_api_key_secreta_12345
COOKIE_MAX_AGE=3600000
CSRF_TOKEN_SECRET=mi_secreto_csrf_super_seguro
```

## Uso

### Iniciar el servidor

```bash
npm start
# o
node server.js
```

El servidor estará disponible en http://localhost:3000

### Probar con el cliente de ejemplo

Instalar dependencias adicionales:

```bash
npm install axios tough-cookie axios-cookiejar-support
```

Ejecutar el servidor:

```bash
npm start
```

En otra terminal, ejecutar el cliente de ejemplo:

```bash
node ejemplo_cliente.js
```

## Endpoints de la API

### Autenticación

#### POST /api/auth/login
Requiere header: `x-api-key: mi_api_key_secreta_12345`  
Body: `{ "email": "usuario@ejemplo.com" }`  
Configura cookies HTTP-Only para JWT y CSRF  
Devuelve token CSRF en la respuesta

#### POST /api/auth/logout
Requiere autenticación JWT  
Elimina las cookies de sesión

#### GET /api/auth/verify
Requiere autenticación JWT  
Verifica el estado de autenticación

### Tareas (requieren autenticación)

#### GET /api/tareas
Obtiene todas las tareas del usuario  
Headers requeridos:
- `x-csrf-token: [token_csrf]`
- `Cookie: jwt_token` (HTTP-Only, automática)

#### GET /api/tareas/:id
Obtiene una tarea específica por ID  
Headers requeridos igual que arriba

#### POST /api/tareas
Crea una nueva tarea  
Body: `{ "titulo": "Tarea ejemplo", "descripcion": "Descripción", "completada": false }`  
Headers requeridos igual que arriba

#### PUT /api/tareas/:id
Actualiza una tarea completamente  
Headers requeridos igual que arriba

#### PATCH /api/tareas/:id
Actualiza una tarea parcialmente  
Headers requeridos igual que arriba

#### DELETE /api/tareas/:id
Elimina una tarea  
Headers requeridos igual que arriba

## Flujo de Autenticación

### Login inicial:
1. Cliente envía API key en header y email en body
2. Servidor genera JWT y token CSRF
3. JWT se almacena en cookie HTTP-Only
4. Token CSRF se devuelve en respuesta y en cookie no HTTP-Only

### Solicitudes protegidas:
1. Cliente incluye automáticamente la cookie JWT (HTTP-Only)
2. Cliente envía token CSRF en header `x-csrf-token`
3. Servidor verifica:
   - JWT válido y no expirado
   - Token CSRF coincide con el del JWT
   - API key en JWT es válida

### Protección CSRF:
- Doble cookie pattern: JWT en HTTP-Only, CSRF en cookie regular
- Token CSRF debe coincidir en header y JWT
- Previene ataques CSRF mientras mantiene seguridad

## Ejemplo de Uso

### Prueba manual con curl

Login (obtener tokens):

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "x-api-key: mi_api_key_secreta_12345" \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com"}' \
  -c cookies.txt
```

Extraer token CSRF de la respuesta y guardarlo

Crear tarea (usando cookies y CSRF):

```bash
curl -X POST http://localhost:3000/api/tareas \
  -H "x-csrf-token: [TOKEN_CSRF_AQUI]" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Mi tarea","descripcion":"Descripción"}' \
  -b cookies.txt
```

## Seguridad

- **JWT en HTTP-Only cookie**: Previene acceso desde JavaScript (XSS)
- **CSRF Protection**: Doble cookie pattern para prevenir CSRF
- **API Key**: Autenticación inicial adicional
- **SameSite Strict**: Cookies solo en solicitudes del mismo sitio
- **Expiración**: Tokens con tiempo de vida limitado

## Notas de Producción

- Cambiar secretos: Usa secretos fuertes y únicos en producción
- HTTPS: Siempre usa HTTPS en producción para cookies seguras
- Base de datos: Reemplazar almacenamiento en memoria por base de datos real
- Rate limiting: Implementar límite de solicitudes
- Logging: Agregar logging apropiado para auditoría
- CORS: Configurar orígenes permitidos específicamente

## Frontend Vue.js

La aplicación frontend está ubicada en `../17marzo26/` e incluye:

- Servicio de autenticación con manejo automático de cookies
- Interceptor Axios para tokens CSRF
- Componentes Vue con protección de rutas
- Manejo de errores y notificaciones

Para iniciar el frontend:

```bash
cd ../17marzo26
npm install
npm run dev
```

El frontend estará disponible en http://localhost:5173
