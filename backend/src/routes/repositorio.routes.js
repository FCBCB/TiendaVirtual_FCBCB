import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import repositorioController from '../controllers/repositorio.controller.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar multer para subida de archivos
const uploadDir = path.join(__dirname, '../../uploads/repositorios');

// Crear directorio si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Carpeta creada:', uploadDir);
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
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
    cb(new Error('Solo se permiten imágenes (jpg, jpeg, png, gif, webp)'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

const router = express.Router();

// ==============================================
// RUTAS PÚBLICAS (no requieren autenticación)
// ==============================================
router.get('/', repositorioController.listar);
router.get('/:id', repositorioController.obtenerPorId);

// ==============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ==============================================
router.use(verificarToken);

// ==============================================
// RUTAS DE ADMINISTRACIÓN (solo admin general)
// ==============================================
router.get('/admin/todos', roleMiddleware.esAdminGeneral, repositorioController.listarTodos);

// Crear repositorio (solo admin)
router.post(
  '/',
  roleMiddleware.esAdminGeneral,
  upload.fields([
    { name: 'portada', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
  ]),
  repositorioController.crear
);

// Editar repositorio (solo admin)
router.put(
  '/:id',
  roleMiddleware.esAdminGeneral,
  upload.fields([
    { name: 'portada', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
  ]),
  repositorioController.editar
);

// Eliminar repositorio (lógico - solo admin)
router.delete(
  '/:id',
  roleMiddleware.esAdminGeneral,
  repositorioController.eliminar
);

// Eliminar repositorio físicamente (solo admin)
router.delete(
  '/:id/fisico',
  roleMiddleware.esAdminGeneral,
  repositorioController.eliminarFisico
);

export default router;