// routes/evento.routes.js
import express from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/auth.middleware.js";
import eventoController from "../controllers/evento.controller.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar multer para subida de archivos de eventos
const uploadDir = path.join(__dirname, "../../uploads/eventos");

// Crear directorio si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Carpeta creada para eventos:', uploadDir);
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `evento-${uniqueSuffix}${ext}`);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes (jpg, jpeg, png, gif, webp)"));
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

const router = express.Router();

// ============================================================
// RUTAS PÚBLICAS - NO requieren autenticación (para app móvil)
// ============================================================
router.get("/", eventoController.listar);
router.get("/repositorio/:id", eventoController.listarPorRepositorio);
router.get("/:id", eventoController.obtenerPorId);
router.get("/repositorios/disponibles", eventoController.listarRepositoriosDisponibles);

// ============================================================
// RUTAS PROTEGIDAS - REQUIEREN AUTENTICACIÓN (para web admin)
// ============================================================
router.post(
  "/", 
  verificarToken,
  roleMiddleware.esAdminOResponsable,
  upload.single("imagen"), 
  eventoController.crear
);

router.put(
  "/:id", 
  verificarToken,
  roleMiddleware.esAdminOResponsable,
  upload.single("imagen"), 
  eventoController.editar
);

router.delete(
  "/:id", 
  verificarToken,
  roleMiddleware.esAdminOResponsable,
  eventoController.eliminar
);

// Rutas solo para admin
router.put(
  "/:id/estado",
  verificarToken,
  roleMiddleware.esAdmin,
  eventoController.actualizarEstadoEvento
);

router.put(
  "/realizacion/:id/estado",
  verificarToken,
  roleMiddleware.esAdmin,
  eventoController.actualizarEstadoRealizacion
);

export default router;