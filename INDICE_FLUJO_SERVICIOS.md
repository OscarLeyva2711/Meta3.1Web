# Índice de Documentación: Flujo y Servicios

## Resumen Ejecutivo

He creado **6 documentos completos** que explican en detalle el flujo de la aplicación Meta3.1 y todos los servicios que ofrece el Backend al Frontend.

**Tamaño total:** 125 KB de documentación técnica profesional.

---

## Documentos Creados

### 1. FLUJO_EXPLICADO.txt (15 KB)
**El mejor punto de partida para entender TODO**

Contiene:
- El flujo explicado en 10 puntos clave
- Diagrama simple de capas
- Arquitectura general
- Puertos y URLs
- Conclusión ejecutiva

**Cuándo leerlo:** Primero, para obtener una visión general rápida.

---

### 2. ARQUITECTURA_Y_FLUJO.md (22 KB)
**Explicación profunda y técnica**

Contiene:
- Descripción general del sistema (2 capas: Frontend/Backend)
- Flujo general de la aplicación
- 14 secciones detalladas que incluyen:
  1. Iniciación de la aplicación
  2. Enrutamiento y protección de rutas
  3. Autenticación - Login
  4. Autenticación - Google OAuth
  5. Solicitudes HTTP con autenticación
  6. Servicios del Backend (A-E)
  7. Ciclo de vida de una acción
  8. Protección de seguridad
  9. Flujo de logout
  10. Manejo de errores y 401
  11. Flujo visual completo
  12. Resumen de servicios
  13. Secuencia de eventos
  14. Conclusión

**Cuándo leerlo:** Para entender la arquitectura en profundidad, cada capa, cómo funciona todo integrado.

---

### 3. SERVICIOS_BACKEND.md (12 KB)
**Referencia completa de servicios y endpoints**

Contiene:
- Vista rápida de servicios (tabla)
- Servicios de Autenticación (6 endpoints)
- Servicios de Tareas (8 endpoints)
- Servicios de Tags (7 endpoints)
- Servicios de Personas (6 endpoints)
- Servicios de Usuarios (4 endpoints)
- Flujo de una solicitud típica
- Autenticación: cómo funciona
- Transformación de datos
- Códigos de respuesta del backend
- Resumen: qué recibe Frontend del Backend
- Archivos clave en Frontend y Backend

**Cuándo leerlo:** Cuando necesitas saber qué endpoints existen y qué devuelven.

---

### 4. DIAGRAMAS_FLUJO.md (44 KB)
**Diagramas ASCII detallados de cada flujo**

Contiene:
- Inicio de la aplicación (diagrama ASCII)
- Flujo de login por Email (detallado con cajas)
- Flujo de Google OAuth (paso a paso)
- Flujo de obtener tareas (GET /api/tareas)
- Flujo de crear tarea (POST /api/tareas)
- Flujo de logout
- Manejo de errores 401
- Arquitectura de carpetas y flujo
- Resumen: la magia detrás

**Cuándo leerlo:** Cuando prefieres ver diagramas visuales, o necesitas seguir paso a paso qué ocurre.

---

### 5. REFERENCIA_RAPIDA_FLUJO.md (13 KB)
**Guía de referencia rápida para consultas**

Contiene:
- Cómo funciona todo (versión ultra corta)
- Capas de la aplicación
- Servicios ofrecidos por el Backend (tablas)
- Flujos principales (7 flujos)
- Protección de seguridad (5 protecciones)
- Códigos HTTP posibles
- Transformación de datos
- Estructura de directorios
- Checklist de cada paso
- Errores comunes y soluciones
- Resumen ultra-rápido

**Cuándo leerlo:** Para búsquedas rápidas, checklists, tablas de referencia.

---

### 6. README.md (19 KB)
**Documentación completa original del proyecto**

Contiene:
- Características del sistema
- Requisitos previos
- Configuración inicial
- Instalación paso a paso
- 3 opciones de ejecución
- Credenciales por defecto
- 30+ endpoints documentados con ejemplos
- URLs funcionales
- Pruebas E2E
- 10+ soluciones de troubleshooting
- Estructura del proyecto
- Pasos rápidos para empezar
- Checklist de verificación

**Cuándo leerlo:** Para instalar y ejecutar el proyecto, consultar credenciales, hacer troubleshooting.

---

## Mapa de Lectura Recomendado

### Opción A: Aprendizaje Completo (1-2 horas)
1. Lee **FLUJO_EXPLICADO.txt** (15 min)
2. Lee **SERVICIOS_BACKEND.md** (20 min)
3. Lee **DIAGRAMAS_FLUJO.md** (30 min)
4. Lee **ARQUITECTURA_Y_FLUJO.md** (45 min)
5. Usa **REFERENCIA_RAPIDA_FLUJO.md** como referencia

### Opción B: Aprendizaje Rápido (30 minutos)
1. Lee **FLUJO_EXPLICADO.txt** (15 min)
2. Escanea **SERVICIOS_BACKEND.md** - enfocate en tablas (10 min)
3. Usa **REFERENCIA_RAPIDA_FLUJO.md** como referencia (5 min)

### Opción C: Consulta Específica (5-10 minutos)
- ¿Qué endpoints existen? → **SERVICIOS_BACKEND.md**
- ¿Cómo funciona login? → **DIAGRAMAS_FLUJO.md** (Flujo 2)
- ¿Cómo crear tarea? → **DIAGRAMAS_FLUJO.md** (Flujo 4)
- ¿Qué error es 401? → **REFERENCIA_RAPIDA_FLUJO.md**
- ¿Cómo instalar? → **README.md**

---

## Estructura de Carpetas Documentada

```
Documentación de Flujo:
├─ FLUJO_EXPLICADO.txt          ← EMPEZAR AQUÍ
├─ ARQUITECTURA_Y_FLUJO.md      (Explicación profunda)
├─ SERVICIOS_BACKEND.md         (Referencia endpoints)
├─ DIAGRAMAS_FLUJO.md           (Flujos visuales)
└─ REFERENCIA_RAPIDA_FLUJO.md   (Consultas rápidas)

Documentación Completa del Proyecto:
├─ README.md                     (Instalación + troubleshooting)
├─ QUICK_START.md               (Setup en 5 minutos)
├─ ENTREGA_FINAL.md             (Resumen de entrega)
└─ DOCUMENTACION_COMPLETA.md    (Índice general)
```

---

## Conceptos Clave Explicados

### En FLUJO_EXPLICADO.txt
1. **Los 10 puntos del flujo** — Iniciación, login, OAuth, requests, servicios, etc.
2. **Transformación de datos** — Cómo Frontend y Backend estructuran diferente
3. **Arquitectura en capas** — 5 capas desde presentación hasta datos

### En ARQUITECTURA_Y_FLUJO.md
1. **Ciclo de vida completo** — De usuario a BD y vuelta
2. **Protección de seguridad** — JWT, CSRF, Cookies HTTP-Only, CORS
3. **Flujos específicos** — Login, OAuth, GET, POST, DELETE

### En SERVICIOS_BACKEND.md
1. **Todos los endpoints** — 30+ endpoints organizados por servicio
2. **Qué devuelve cada uno** — Formato de respuesta JSON
3. **Cómo transformar datos** — De backend a frontend

### En DIAGRAMAS_FLUJO.md
1. **Diagramas ASCII** — Visualización paso a paso
2. **Flujos principales** — Login, OAuth, CRUD, logout
3. **Manejo de errores** — Qué pasa cuando falla

### En REFERENCIA_RAPIDA_FLUJO.md
1. **Checklists** — Qué verificar en cada paso
2. **Tablas de referencia** — Servicios, códigos HTTP
3. **Soluciones rápidas** — Errores comunes

---

## Tabla Resumen: Servicios del Backend

| Servicio | Endpoints | Funcionalidad |
|----------|-----------|---------------|
| **Auth** | 6 | login, register, verify, logout, OAuth Google |
| **Tareas** | 8 | CRUD + tags + filtrado |
| **Tags** | 7 | CRUD + búsqueda |
| **Personas** | 6 | CRUD + relaciones |
| **Usuarios** | 4 | Administración (admin only) |
| **Swagger** | 1 | Documentación interactiva |
| **Total** | 32+ | API REST completa |

---

## Flujos Principales Documentados

### Flujo 1: Login por Email
```
Usuario → email + password → Backend → JWT → Frontend → Home
```

### Flujo 2: Login Google OAuth
```
Usuario → Google popup → Code → Backend → JWT → Frontend → Home
```

### Flujo 3: Obtener Tareas
```
TareasView → Service → GET /api/tareas → Backend → SELECT → JSON → Transform → UI
```

### Flujo 4: Crear Tarea
```
Form → Service → POST /api/tareas → Backend → INSERT → JSON → Add to list → UI
```

### Flujo 5: Actualizar Tarea
```
Form → Service → PUT /api/tareas/:id → Backend → UPDATE → JSON → Update list → UI
```

### Flujo 6: Eliminar Tarea
```
User → Delete button → Service → DELETE /api/tareas/:id → Backend → DELETE → Remove from list → UI
```

### Flujo 7: Logout
```
User → Logout → POST /logout → Backend → Frontend clears → Redirect to login
```

---

## Protecciones de Seguridad Explicadas

1. **JWT (JSON Web Token)**
   - Token enviado en Authorization header
   - Contiene id, email, rol, expiración
   - Verificado en cada request
   - Expira en 24 horas

2. **CSRF Token**
   - Almacenado en cookie HttpOnly
   - Validado en cada request POST/PUT/PATCH/DELETE
   - Previene ataques de falsificación

3. **Cookies HTTP-Only**
   - JavaScript NO puede acceder
   - Se envían automáticamente
   - Solo sobre HTTPS
   - Previene XSS

4. **CORS (Cross-Origin)**
   - Solo acepta requests de localhost:5173 y localhost:3000
   - Rechaza otros dominios
   - Whitelist configurable

5. **Validación en Backend**
   - ¿Token válido?
   - ¿No expirado?
   - ¿Usuario es dueño?
   - Devuelve 401 o 403 si falla

---

## Códigos HTTP Documentados

```
200 OK              → Éxito
201 Created         → Recurso creado
400 Bad Request     → Datos inválidos
401 Unauthorized    → Token falta/inválido/expirado
403 Forbidden       → Sin permisos
404 Not Found       → No existe
409 Conflict        → Email duplicado
500 Server Error    → Error en servidor
```

---

## Archivos Clave del Proyecto

### Frontend (Vue)
- `main.ts` — Inicia app
- `router/index.ts` — Rutas + guard
- `services/authService.js` — Login/logout
- `services/tareaService.js` — CRUD tareas
- `components/LoginView.vue` — Formulario login
- `components/TareaForm.vue` — Formulario tareas
- `views/TareasView.vue` — Lista principal

### Backend (Express)
- `server.js` — Punto de entrada
- `app.js` — Configuración
- `routes/auth.routes.js` — Endpoints auth
- `routes/tarea.routes.js` — Endpoints tareas
- `controllers/auth.controller.js` — Lógica auth
- `controllers/tarea.controller.js` — Lógica tareas
- `middleware/auth.js` — Validación JWT

---

## Transformación de Datos

**Backend devuelve:** `{ "estado": "pendiente" }`
**Frontend transforma a:** `{ "estado": "pendiente", "completada": false }`

**Frontend envía:** `{ "completada": false }`
**Backend recibe:** `{ "estado": "pendiente" }`

---

## URLs Principales

- **Frontend:** https://localhost:5173/
- **Backend API:** https://localhost:3000/api
- **Swagger Docs:** https://localhost:3000/api-docs
- **Database:** localhost:3306 (mysql)

---

## Credenciales de Prueba

**Admin:**
- Email: admin@example.com
- Password: admin123456

**Base de Datos:**
- Usuario: tareas_user
- Password: Tareas@2026#Segura
- Database: tareas_db

---

## Próximos Pasos Recomendados

1. **Lee FLUJO_EXPLICADO.txt** para obtener una visión general (15 min)
2. **Explora SERVICIOS_BACKEND.md** para ver todos los endpoints (10 min)
3. **Consulta DIAGRAMAS_FLUJO.md** para entender visualmente (20 min)
4. **Usa REFERENCIA_RAPIDA_FLUJO.md** como referencia diaria
5. **Revisa README.md** para instalar y ejecutar

---

## Conclusión

Tienes **125 KB de documentación completa** que explica:
- Cómo funciona la aplicación de principio a fin
- Qué servicios ofrece el Backend
- Cómo se comunican Frontend y Backend
- Cómo está protegida la información
- Diagramas visuales de cada flujo
- Referencia rápida para consultas

**¡Eres el nuevo experto del proyecto Meta3.1!**

