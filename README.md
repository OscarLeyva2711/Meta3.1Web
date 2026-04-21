# 🚀 Meta3.1 Web - API REST de Tareas

**Aplicación completa con Frontend Vue.js + Backend Express + Base de Datos PostgreSQL**

---

## 📦 Estructura del Proyecto

```
Meta3.1/
├── 17marzo26/                 # Frontend Vue.js
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── services/
│   │   └── App.vue
│   └── package.json
│
└── api-tareas-mvc/            # Backend Express + Sequelize
    ├── config/                # Configuración de BD
    ├── migrations/            # Migrations de Sequelize
    ├── seeders/               # Datos de prueba
    ├── src/
    │   ├── models/            # Modelos Sequelize
    │   ├── controllers/
    │   ├── routes/
    │   └── middleware/
    ├── 00-INICIO-AQUI.md      # ⭐ EMPIEZA AQUÍ
    ├── SEQUELIZE-SETUP.md
    ├── QUICK-REFERENCE.md
    └── package.json
```

---

## 🎯 Guía Rápida

### Backend (api-tareas-mvc)

**1. Instalar dependencias**
```bash
cd api-tareas-mvc
npm install sequelize sequelize-cli pg pg-hstore
```

**2. Configurar Base de Datos**
```bash
# Editar config/config.json con tus credenciales
# Crear BD: createdb tareas_db
```

**3. Ejecutar Migrations y Seeders**
```bash
npm run db:migrate
npm run db:seed:all
```

**4. Iniciar servidor**
```bash
npm run dev
```

📍 **Documentación completa:** `api-tareas-mvc/00-INICIO-AQUI.md`

### Frontend (17marzo26)

```bash
cd 17marzo26
npm install
npm run dev
```

---

## 📚 Documentación Backend

| Archivo | Descripción |
|---------|------------|
| **00-INICIO-AQUI.md** | ⭐ Comienza aquí - Resumen visual |
| **SEQUELIZE-SETUP.md** | Instalación y configuración detallada |
| **QUICK-REFERENCE.md** | Guía rápida de operaciones CRUD |
| **IMPLEMENTATION-SUMMARY.md** | Resumen técnico |
| **CHECKLIST.md** | Lista de verificación |
| **RESUMEN-FINAL.txt** | ASCII art con estadísticas |

---

## ✨ Lo Que Se Ha Implementado

### Backend
✅ ORM Sequelize completamente configurado  
✅ 3 Modelos: Persona, Tarea, Tag  
✅ Relaciones 1:N y N:M  
✅ 4 Migrations automáticas  
✅ 4 Seeders con datos de prueba  
✅ 30+ ejemplos de queries  
✅ Documentación completa  

### Frontend
✅ Vue.js + Vite  
✅ Componentes reutilizables  
✅ Formularios reactivos  
✅ Autenticación JWT  
✅ Comunicación con API  

### Base de Datos
✅ PostgreSQL  
✅ Tabla: personas (4 registros)  
✅ Tabla: tags (6 registros)  
✅ Tabla: tareas (8 registros)  
✅ Tabla: tarea_tags (relaciones N:M)  

---

## 🗄️ Diagrama de Relaciones

```
Persona (1) ──────── (N) Tarea
                      │
                      └──── (N:M) Tags
```

---

## 📝 Descripción Original

Esta API permite crear, leer, actualizar y eliminar tareas (CRUD completo).  
La persistencia se maneja con PostgreSQL y Sequelize ORM.  
La arquitectura sigue el patrón MVC separando modelos, controladores y rutas.

---

## Requisitos

- Node.js v18 o superior
- npm

---

## Instalación

```bash
git clone https://github.com/tu-usuario/api-tareas-mvc.git
cd api-tareas-mvc
npm install
```

---

## Cómo ejecutar

```bash
npm run dev
```

El servidor corre en: `http://localhost:3000`

---

## Estructura del Proyecto

```
api-tareas-mvc/
├── src/
│   ├── models/
│   │   └── tarea.model.js       # Datos en memoria y lógica de negocio
│   ├── controllers/
│   │   └── tarea.controller.js  # Manejo de peticiones HTTP
│   ├── routes/
│   │   └── tarea.routes.js      # Definición de endpoints
│   └── app.js                   # Configuración de Express
├── package.json
└── server.js                    # Punto de entrada
```

---

## Endpoints disponibles

| Método | Endpoint | Descripción | Body requerido |
|--------|----------|-------------|----------------|
| GET | `/api/tareas` | Obtener todas las tareas | — |
| GET | `/api/tareas/:id` | Obtener tarea por ID | — |
| GET | `/api/tareas/buscar?q=texto` | Buscar tareas por título | — |
| POST | `/api/tareas` | Crear nueva tarea | `{ "titulo": "", "completada": false }` |
| PUT | `/api/tareas/:id` | Actualizar tarea completa | `{ "titulo": "", "completada": true }` |
| PATCH | `/api/tareas/:id` | Actualizar tarea parcialmente | `{ "completada": true }` |
| DELETE | `/api/tareas/:id` | Eliminar tarea | — |

---

## Ejemplos de respuesta

**GET /api/tareas — 200 OK**
```json
{
  "success": true,
  "data": [
    { "id": 1, "titulo": "Aprender Express", "completada": false },
    { "id": 2, "titulo": "Implementar MVC", "completada": false },
    { "id": 3, "titulo": "Probar API con Postman", "completada": true }
  ],
  "count": 3
}
```

**POST /api/tareas — 201 Created**
```json
{
  "success": true,
  "message": "Tarea creada exitosamente",
  "data": { "id": 4, "titulo": "Nueva tarea", "completada": false }
}
```

**GET /api/tareas/999 — 404 Not Found**
```json
{
  "success": false,
  "message": "Tarea con ID 999 no encontrada"
}
```

---

## Códigos de estado HTTP utilizados

| Código | Significado | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | GET, PUT, PATCH, DELETE exitosos |
| 201 | Created | POST exitoso al crear tarea |
| 400 | Bad Request | Datos inválidos o faltantes |
| 404 | Not Found | Tarea no encontrada |
| 500 | Internal Server Error | Error inesperado del servidor |

---

## Pruebas

Las pruebas se realizaron con **Postman** (extensión de VS Code).  
La colección exportada está disponible en Coleccion.JSON


---

## Tecnologías

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [nodemon](https://nodemon.io/)
- [Thunder Client](https://www.thunderclient.com/)