import express from 'express';
// Cambiar de '../middleware/' a '../middlewares/'
import { verificarToken } from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import authController from '../controllers/auth.controller.js';

const router = express.Router();

// ============================================
// RUTAS PÚBLICAS
// ============================================

// Login tradicional (admin, responsable)
router.post('/login', authController.login);

// Login con Google (clientes)
router.post('/google', authController.loginWithGoogle);

// ============================================
// RUTAS PROTEGIDAS (requieren token)
// ============================================

// Obtener perfil del usuario autenticado
router.get('/profile', verificarToken, authController.getProfile);

// ============================================
// RUTAS DE ADMINISTRACIÓN (solo admin)
// ============================================

// Registrar responsable (solo admin)
router.post(
  '/register/responsable',
  verificarToken,
  roleMiddleware.esAdminGeneral,
  authController.registerResponsable
);

// Ver usuarios pendientes de aprobación (solo admin)
router.get(
  '/pendientes',
  verificarToken,
  roleMiddleware.esAdminGeneral,
  authController.getPendientesAprobacion
);

// Aprobar/rechazar usuario (solo admin)
router.put(
  '/aprobar/:id_usuario',
  verificarToken,
  roleMiddleware.esAdminGeneral,
  authController.aprobarUsuario
);

router.put(
  '/rechazar/:id_usuario',
  verificarToken,
  roleMiddleware.esAdminGeneral,
  authController.rechazarUsuario
);

export default router;