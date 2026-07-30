import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import materialGratuitoController from '../controllers/materialGratuito.controller.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar multer para subida de archivos
const uploadDir = path.join(__dirname, '../../uploads/material');

// Crear directorio si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Carpeta creada para material gratuito:', uploadDir);
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    let prefix = 'archivo';
    if (file.fieldname === 'portada') prefix = 'portada';
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt|jpg|jpeg|png|gif|webp|mp4|mp3|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Formatos permitidos: PDF, DOC, DOCX, XLS, PPT, imágenes, videos, audio, ZIP, RAR'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB máximo
  fileFilter
});

const router = express.Router();

// ============================================================
// ⚠️ IMPORTANTE: Las rutas específicas DEBEN ir ANTES de las rutas con parámetros
// ============================================================

// ============================================================
// RUTAS PARA OBTENER DATOS MAESTROS (sin parámetros)
// ============================================================
router.get('/autores', materialGratuitoController.listarAutores);
router.get('/categorias', materialGratuitoController.listarCategorias);
router.get('/repositorios/disponibles', materialGratuitoController.listarRepositoriosDisponibles);

// ============================================================
// RUTAS PÚBLICAS - CON PARÁMETROS
// ============================================================
router.get('/repositorio/:id', materialGratuitoController.listarPorRepositorio);
router.get('/:id/url', materialGratuitoController.obtenerUrlDescarga);
router.get('/:id', materialGratuitoController.obtenerPorId);  // ← Esta debe ir DESPUÉS de las rutas específicas

// ============================================================
// RUTAS PÚBLICAS - SIN PARÁMETROS (debe ir al final)
// ============================================================
router.get('/', materialGratuitoController.listar);

// ============================================================
// RUTAS PROTEGIDAS - REQUIEREN AUTENTICACIÓN
// ============================================================
router.use(verificarToken);

// Crear material (admin o responsable)
router.post(
  '/',
  roleMiddleware.esAdminOResponsable,
  upload.fields([
    { name: 'archivo', maxCount: 1 },
    { name: 'portada', maxCount: 1 }
  ]),
  materialGratuitoController.crear
);

// Editar material (admin o responsable)
router.put(
  '/:id',
  roleMiddleware.esAdminOResponsable,
  upload.fields([
    { name: 'archivo', maxCount: 1 },
    { name: 'portada', maxCount: 1 }
  ]),
  materialGratuitoController.editar
);

// Eliminar material (admin o responsable)
router.delete(
  '/:id',
  roleMiddleware.esAdminOResponsable,
  materialGratuitoController.eliminar
);

// Registrar descarga (requiere autenticación para llevar registro)
router.post(
  '/:id/descargar',
  verificarToken,
  materialGratuitoController.registrarDescarga
);

export default router;