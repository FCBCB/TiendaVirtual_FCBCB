import express from 'express';
import authRoutes from './auth.routes.js';
import repositorioRoutes from './repositorio.routes.js';
import souvenirRoutes from './souvenir.routes.js';
import libroRoutes from './libro.routes.js';
import materialGratuitoRoutes from './materialGratuito.routes.js';
import ticketMuseoRoutes from './ticketMuseo.routes.js';
import carritoRoutes from './carrito.routes.js';
import ventaRoutes from './ventas.routes.js';

const router = express.Router();

// Montar las rutas
router.use('/auth', authRoutes);
router.use('/repositorios', repositorioRoutes);
router.use('/souvenirs', souvenirRoutes);
router.use('/libros', libroRoutes);
router.use('/material', materialGratuitoRoutes);
router.use('/tickets', ticketMuseoRoutes);
router.use('/carrito', carritoRoutes);
router.use('/ventas', ventaRoutes);

// Ruta de prueba
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor funcionando',
    timestamp: new Date()
  });
});

export default router;