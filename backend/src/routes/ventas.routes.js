import express from 'express';
import {
  crearVenta,
  obtenerVentasCliente,
  obtenerVentaPorId,
  actualizarEstadoVenta,
  confirmarPagoQR,
  obtenerVentasRepositorio,
  obtenerTodasLasVentas
} from '../controllers/ventas.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const router = express.Router();

// ============================================
// RUTAS DE VENTAS
// ============================================

// ✅ Crear una nueva venta (desde el carrito)
// POST /api/ventas
router.post(
  '/',
  verificarToken,
  crearVenta
);

// ✅ Obtener ventas de un cliente
// GET /api/ventas/cliente/:id_cliente
router.get(
  '/cliente/:id_cliente',
  verificarToken,
  obtenerVentasCliente
);

// ✅ Obtener una venta por ID
// GET /api/ventas/:id_venta
router.get(
  '/:id_venta',
  verificarToken,
  obtenerVentaPorId
);

// ✅ Actualizar estado de una venta
// PUT /api/ventas/:id_venta/estado
router.put(
  '/:id_venta/estado',
  verificarToken,
  actualizarEstadoVenta
);

// ✅ Confirmar pago QR de una venta (responsable/admin)
// PUT /api/ventas/:id_venta/confirmar-pago
router.put(
  '/:id_venta/confirmar-pago',
  verificarToken,
  confirmarPagoQR
);

// ✅ Obtener ventas de un repositorio (responsable/admin)
// GET /api/ventas/repositorio/:id_repositorio
router.get(
  '/repositorio/:id_repositorio',
  verificarToken,
  obtenerVentasRepositorio
);

// ✅ Obtener todas las ventas (solo admin general)
// GET /api/ventas/admin/todas
router.get(
  '/admin/todas',
  verificarToken,
  roleMiddleware.esAdminGeneral,
  obtenerTodasLasVentas
);

export default router;