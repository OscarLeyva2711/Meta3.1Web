/**
 * Configuración de la aplicación Express
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import session from 'express-session';
import passport from 'passport';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar configuración de Passport
import './config/passport.js';

import tareaRoutes from './routes/tarea.routes.js';
import personaRoutes from './routes/persona.routes.js';
import tagRoutes from './routes/tag.routes.js';
import authRoutes from './routes/auth.routes.js';
import googleAuthRoutes from './routes/googleAuth.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';
import db from './models/index.js'; // Sequelize initialization

const app = express();

// Configuración de CORS - Más flexible para desarrollo
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://localhost:5173',
      'http://localhost:5174',
      'https://localhost:5174',
      'http://localhost:3000',
      'https://localhost:3000',
      process.env.CLIENT_URL || 'https://localhost:5173'
    ];
    
    // Permitir peticiones sin origin (como Postman, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('CORS no permitido'));
    }
  },
  credentials: true, // Permitir cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-csrf-token', 'Access-Control-Allow-Origin'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 horas
};

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sesiones para Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'mi_secreto_de_sesion',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Usar HTTPS en producción
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware de logging (opcional)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Cargar documentación OpenAPI
let swaggerDocument;
try {
  const openApiPath = path.join(__dirname, '..', 'openapi.yaml');
  const fileContents = fs.readFileSync(openApiPath, 'utf8');
  swaggerDocument = YAML.parse(fileContents);
} catch (error) {
  console.warn('⚠️  No se pudo cargar openapi.yaml. Swagger UI no disponible:', error.message);
}

// Swagger UI
if (swaggerDocument) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true
    }
  }));
}
// Rutas - Google debe estar ANTES que /api/auth para evitar conflictos
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tareas', tareaRoutes);
app.use('/api/personas', personaRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'API de Tareas - Práctica MVC con Express',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        verify: 'GET /api/auth/verify'
      },
      tareas: {
        getAll: 'GET /api/tareas',
        getById: 'GET /api/tareas/:id',
        create: 'POST /api/tareas',
        updateFull: 'PUT /api/tareas/:id',
        updatePartial: 'PATCH /api/tareas/:id',
        delete: 'DELETE /api/tareas/:id'
      }
    }
  });
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: err.message
  });
});

// Debug: Log all registered routes
console.log('=== REGISTERED ROUTES ===');
app._router?.stack?.forEach((middleware, i) => {
  if (middleware.route) {
    console.log(`${i}: Route ${middleware.route.path} - ${JSON.stringify(middleware.route.methods)}`);
  } else if (middleware.name === 'router') {
    console.log(`${i}: Router middleware`);
    if (middleware.handle?.stack) {
      middleware.handle.stack.forEach((subMiddleware, j) => {
        if (subMiddleware.route) {
          console.log(`  ${i}.${j}: Sub-route ${subMiddleware.route.path} - ${JSON.stringify(subMiddleware.route.methods)}`);
        }
      });
    }
  }
});

export default app;