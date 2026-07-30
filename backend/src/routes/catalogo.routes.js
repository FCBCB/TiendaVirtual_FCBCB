// routes/catalogo.routes.js
import express from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/auth.middleware.js";
import catalogoController from "../controllers/catalogo.controller.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar multer para subida de archivos de catálogos
const uploadDir = path.join(__dirname, "../../uploads/catalogos");

// Crear directorio si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Carpeta creada para catálogos:', uploadDir);
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `catalogo-${uniqueSuffix}${ext}`);
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
router.get("/", catalogoController.listar);
router.get("/repositorio/:id", catalogoController.listarPorRepositorio);
router.get("/:id", catalogoController.obtenerPorId);
router.get("/repositorios/disponibles", catalogoController.listarRepositoriosDisponibles);

// ============================================================
// RUTAS PROTEGIDAS - REQUIEREN AUTENTICACIÓN (para web admin)
// ============================================================
router.post(
  "/", 
  verificarToken,
  roleMiddleware.esAdminOResponsable,
  upload.single("portada"), 
  catalogoController.crear
);

router.put(
  "/:id", 
  verificarToken,
  roleMiddleware.esAdminOResponsable,
  upload.single("portada"), 
  catalogoController.editar
);

router.delete(
  "/:id", 
  verificarToken,
  roleMiddleware.esAdminOResponsable,
  catalogoController.eliminar
);

// Rutas solo para admin
router.put(
  "/:id/disponibilidad",
  verificarToken,
  roleMiddleware.esAdmin,
  catalogoController.actualizarDisponibilidad
);

router.put(
  "/:id/stock",
  verificarToken,
  roleMiddleware.esAdmin,
  catalogoController.actualizarStock
);

export default router;