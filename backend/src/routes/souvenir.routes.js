import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import souvenirController from '../controllers/souvenir.controller.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar multer para subida de archivos de souvenirs
const uploadDir = path.join(__dirname, '../../uploads/souvenirs');

// Crear directorio si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Carpeta creada para souvenirs:', uploadDir);
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    // Limpiar el nombre del campo para evitar conflictos
    const fieldName = file.fieldname === 'imagenes' ? 'adicional' : file.fieldname;
    cb(null, `${fieldName}-${uniqueSuffix}${ext}`);
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

// ============================================================
// RUTAS PÚBLICAS - NO requieren autenticación
// ============================================================
router.get('/', souvenirController.listar);
router.get('/repositorio/:id', souvenirController.listarPorRepositorio);
router.get('/repositorios/disponibles', souvenirController.listarRepositoriosDisponibles);
router.get('/:id', souvenirController.obtenerPorId);

// ============================================================
// RUTAS PROTEGIDAS - Requieren autenticación
// ============================================================
router.use(verificarToken);

// ✅ CORREGIDO: Usar upload.fields() para manejar múltiples campos
// - 'imagen': la imagen principal (opcional)
// - 'imagenes': múltiples imágenes adicionales (opcional)
router.post(
  '/',
  roleMiddleware.esAdminOResponsable,
  upload.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'imagenes', maxCount: 10 }  // Hasta 10 imágenes adicionales
  ]),
  souvenirController.crear
);

// ✅ CORREGIDO: Editar también con múltiples imágenes
router.put(
  '/:id',
  roleMiddleware.esAdminOResponsable,
  upload.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'imagenes', maxCount: 10 }
  ]),
  souvenirController.editar
);

// Eliminar souvenir (admin o responsable)
router.delete(
  '/:id',
  roleMiddleware.esAdminOResponsable,
  souvenirController.eliminar
);

// Subir imágenes adicionales (admin o responsable)
router.post(
  '/:id/imagenes',
  roleMiddleware.esAdminOResponsable,
  upload.array('imagenes', 10),
  souvenirController.subirImagenesAdicionales
);

// Eliminar imagen adicional (admin o responsable)
router.delete(
  '/imagenes/:id',
  roleMiddleware.esAdminOResponsable,
  souvenirController.eliminarImagen
);

// ============================================================
// RUTAS SOLO PARA ADMIN
// ============================================================
router.put(
  '/:id/stock',
  roleMiddleware.esAdminGeneral,
  souvenirController.actualizarStock
);

export default router;