import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import ticketMuseoController from '../controllers/ticketMuseo.controller.js';

const router = express.Router();

// ============================================================
// ✅ RUTAS PÚBLICAS (NO REQUIEREN TOKEN)
// ============================================================
// Listar todos los museos con sus tickets (PÚBLICO)
router.get('/museos', ticketMuseoController.listarTicketsMuseos);

// Tickets disponibles hoy (PÚBLICO)
router.get('/disponibles/hoy', ticketMuseoController.listarDisponiblesHoy);

// Listar repositorios con tickets (PÚBLICO)
router.get('/repositorios', ticketMuseoController.listarRepositoriosConTickets);

// ============================================================
// ✅ RUTAS PROTEGIDAS (requieren token)
// ============================================================
router.use(verificarToken);

// Obtener ticket de un museo específico
router.get('/museos/:id', ticketMuseoController.obtenerTicketMuseo);

// Actualizar ticket de un museo (precio, descuento) - SOLO ADMIN/RESPONSABLE
router.put(
  '/museos/:id',
  roleMiddleware.esAdminOResponsable,
  ticketMuseoController.actualizarTicketMuseo
);

// Habilitar/Deshabilitar venta - SOLO ADMIN/RESPONSABLE
router.patch(
  '/museos/:id/toggle-venta',
  roleMiddleware.esAdminOResponsable,
  ticketMuseoController.toggleVenta
);

export default router;