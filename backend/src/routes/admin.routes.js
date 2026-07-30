import express from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
// ❌ ESTO ESTÁ MAL - roleMiddleware no está en auth.middleware.js
// import roleMiddleware from "../middlewares/auth.middleware.js";
// ✅ CORRECTO - importar desde role.middleware.js
import roleMiddleware from "../middlewares/role.middleware.js";
import adminController from "../controllers/admin.controller.js";

const router = express.Router();

// Todas las rutas requieren autenticación y rol de ADMIN
router.use(verificarToken);
router.use(roleMiddleware.esAdminGeneral); // ← Cambiar de esAdmin a esAdminGeneral

// Rutas de administración de usuarios
router.get("/usuarios", adminController.listarUsuarios);
router.get("/usuarios/:id_usuario", adminController.obtenerUsuario);
router.post("/usuarios", adminController.crearUsuario);
router.put("/usuarios/:id_usuario", adminController.editarUsuario);
router.delete("/usuarios/:id_usuario", adminController.eliminarUsuario);
router.put("/usuarios/:id_usuario/password", adminController.cambiarPassword);

// Rutas de aprobación
router.get("/pendientes", adminController.listarPendientes);
router.put("/aprobar/:id_usuario", adminController.aprobarResponsable);
router.put("/rechazar/:id_usuario", adminController.rechazarResponsable);
router.put("/estado/:id_usuario", adminController.cambiarEstado);

// Rutas auxiliares
router.get("/repositorios", adminController.listarRepositorios);

export default router;