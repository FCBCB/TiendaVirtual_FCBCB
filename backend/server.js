import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import pool, { testConnection } from './src/db.js';
import routes from './src/routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import proxyRoutes from './src/routes/proxyRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Función para detectar si el origen es un túnel
const isTunnelOrigin = (origin) => {
  if (!origin) return false;
  return origin.includes('ngrok') || 
         origin.includes('localtunnel') || 
         origin.includes('serveo') ||
         origin.includes('ngrok-free.app');
};

// ✅ CONFIGURACIÓN CORS CORREGIDA - AGREGAR X-Cart-Token
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173', 
    'http://localhost:3000',
    /^https:\/\/.*\.devtunnels\.ms$/,
    /^https:\/\/.*\.brs\.devtunnels\.ms$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  // ✅ AGREGAR 'X-Cart-Token' A LOS HEADERS PERMITIDOS
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Cart-Token', 'x-cart-token']
};

// Servir archivos estáticos con headers CORS mejorados
app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin.includes('devtunnels.ms') || origin.includes('localhost'))) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  }
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  // ✅ AGREGAR 'X-Cart-Token' AQUÍ TAMBIÉN
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Cart-Token, x-cart-token');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Limitador de peticiones
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Demasiadas peticiones desde esta IP'
});

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));
app.use(cors(corsOptions));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Servir archivos estáticos con headers CORS correctos para túneles (segundo middleware)
app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin && isTunnelOrigin(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  // ✅ AGREGAR 'X-Cart-Token' AQUÍ TAMBIÉN
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Cart-Token, x-cart-token');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path, stat) => {
    if (path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// ==============================================
// ========== RUTAS DEL PROXY ==================
// ==============================================
app.use('/api/eventos-proxy', proxyRoutes);
app.use('/proxy', proxyRoutes);

// ==============================================
// ========== TUS RUTAS EXISTENTES =============
// ==============================================
app.use('/api', routes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: '🚀 Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        status: 'online'
    });
});

// Ruta para probar conexión a base de datos
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 as test, NOW() as fecha, VERSION() as version');
        res.json({
            success: true,
            message: 'Conexión a base de datos exitosa',
            data: rows[0]
        });
    } catch (error) {
        console.error('Error en test-db:', error);
        res.status(500).json({
            success: false,
            message: 'Error de conexión a base de datos',
            error: error.message
        });
    }
});

// Ruta para probar el proxy
app.get('/api/proxy-test', (req, res) => {
    res.json({
        success: true,
        message: 'Proxy funcionando correctamente',
        endpoints: {
            parametros: 'POST /api/eventos-proxy/api/parametros',
            eventos: 'POST /api/eventos-proxy/api/eventos'
        }
    });
});

// Manejador de errores 404
app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ message: 'Error interno del servidor' });
});

// Iniciar servidor
const startServer = async () => {
    await testConnection();
    
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n Servidor corriendo en http://localhost:${PORT}`);
        console.log(` Modo: ${process.env.NODE_ENV || 'development'}`);
        console.log(` Accesible desde la red en: http://0.0.0.0:${PORT}`);
        
        console.log('\n=== PROXY PARA EVENTOS CULTURALES ===');
        console.log(`   POST /api/eventos-proxy/api/parametros - Obtener parámetros`);
        console.log(`   POST /api/eventos-proxy/api/eventos     - Obtener eventos culturales`);
        console.log(`   GET  /api/proxy-test                    - Probar proxy`);
        
        console.log('\n=== ENDPOINTS DISPONIBLES ===');
        console.log('=== AUTENTICACIÓN ===');
        console.log(`   POST /api/auth/register     - Registrar usuario`);
        console.log(`   POST /api/auth/login        - Iniciar sesión`);
        console.log(`   GET  /api/auth/profile      - Obtener perfil (protegido)`);
        console.log('\n=== ADMINISTRACIÓN DE USUARIOS (Admin) ===');
        console.log(`   GET    /api/admin/usuarios      - Listar usuarios`);
        console.log(`   GET    /api/admin/usuarios/:id  - Obtener usuario`);
        console.log(`   POST   /api/admin/usuarios      - Crear usuario`);
        console.log(`   PUT    /api/admin/usuarios/:id  - Editar usuario`);
        console.log(`   DELETE /api/admin/usuarios/:id  - Eliminar usuario`);
        console.log(`   PUT    /api/admin/usuarios/:id/password - Cambiar contraseña`);
        console.log(`   GET    /api/admin/pendientes     - Listar pendientes`);
        console.log(`   PUT    /api/admin/aprobar/:id    - Aprobar responsable`);
        console.log(`   PUT    /api/admin/rechazar/:id   - Rechazar responsable`);
        console.log(`   PUT    /api/admin/estado/:id     - Cambiar estado`);
        console.log(`   GET    /api/admin/repositorios   - Listar repositorios`);
        console.log('\n=== REPOSITORIOS ===');
        console.log(`   GET    /api/repositorios/          - Listar activos (público)`);
        console.log(`   GET    /api/repositorios/admin/todos - Listar todos (admin)`);
        console.log(`   GET    /api/repositorios/:id       - Obtener por ID`);
        console.log(`   POST   /api/repositorios/          - Crear repositorio (admin)`);
        console.log(`   PUT    /api/repositorios/:id       - Editar repositorio (admin)`);
        console.log(`   DELETE /api/repositorios/:id       - Eliminar repositorio (admin)`);
        console.log(`   DELETE /api/repositorios/:id/fisico - Eliminar físicamente (admin)`);
        console.log('\n=== TICKETS (NUEVO) ===');
        console.log(`   GET    /api/tickets/museos           - Listar tickets por museo`);
        console.log(`   GET    /api/tickets/museos/:id       - Obtener ticket de museo`);
        console.log(`   PUT    /api/tickets/museos/:id       - Actualizar ticket (precio, descuento)`);
        console.log(`   PATCH  /api/tickets/museos/:id/toggle-venta - Habilitar/Deshabilitar venta`);
        console.log(`   GET    /api/tickets/disponibles/hoy  - Tickets disponibles hoy (público)`);
        console.log(`   GET    /api/tickets/repositorios     - Repositorios con tickets (público)`);
        console.log('\n=== CARRITO DE COMPRAS ===');
        console.log(`   GET    /api/carrito                 - Obtener carrito`);
        console.log(`   POST   /api/carrito/items           - Agregar item al carrito`);
        console.log(`   PUT    /api/carrito/items/:id       - Actualizar cantidad`);
        console.log(`   DELETE /api/carrito/items/:id       - Eliminar item`);
        console.log(`   DELETE /api/carrito/vaciar          - Vaciar carrito`);
        console.log(`   GET    /api/carrito/count           - Contar items`);
        console.log('\n=== UTILIDADES ===');
        console.log(`   GET    /api/health                 - Health check`);
        console.log(`   GET    /api/test-db                - Probar conexión BD`);
        console.log(`   GET    /uploads/*                  - Archivos estáticos\n`);
    });
};

startServer();