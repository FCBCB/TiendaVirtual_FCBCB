// src/routes/carrito.routes.js
import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import carritoController from '../controllers/carrito.controller.js';

const router = express.Router();

// Rutas públicas (requieren token de carrito en header)
router.get('/', carritoController.obtenerCarrito);
router.post('/items', carritoController.agregarItem);
router.put('/items/:id_item', carritoController.actualizarCantidad);
router.delete('/items/:id_item', carritoController.eliminarItem);
router.delete('/vaciar', carritoController.vaciarCarrito);
router.get('/count', carritoController.contarItems);

export default router;