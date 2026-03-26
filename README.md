# API REST de Tareas — MVC con Express

API REST para gestionar tareas, construida con Node.js y Express siguiendo el patrón MVC.

---

## Descripción

Esta API permite crear, leer, actualizar y eliminar tareas (CRUD completo).  
La persistencia se maneja en memoria mediante un arreglo en JavaScript.  
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