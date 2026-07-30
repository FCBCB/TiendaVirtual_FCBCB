import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import ticketController from '../controllers/ticket.controller.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Configuración de subida de archivos ──────────────────────────────
const uploadDir = path.join(__dirname, '../../uploads/tickets');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Carpeta creada para tickets:', uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `ticket-${uniqueSuffix}${ext}`);
  }
});

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
// ⚠️ IMPORTANTE: Las rutas específicas DEBEN ir ANTES de las rutas con parámetros
// ============================================================

// ============================================================
// RUTAS PÚBLICAS
// ============================================================
router.get('/', ticketController.listar);
router.get('/disponibles/hoy', ticketController.listarDisponiblesHoy);
router.get('/repositorios/disponibles', ticketController.listarRepositoriosDisponibles);

// ============================================================
// RUTAS PROTEGIDAS
// ============================================================
router.use(verificarToken);

// Verificar disponibilidad de un ticket específico
router.get('/:id/disponibilidad', ticketController.verificarDisponibilidad);

// Obtener ticket por ID (después de las rutas específicas)
router.get('/:id', ticketController.obtenerPorId);

// Crear ticket
router.post(
  '/',
  roleMiddleware.esAdminOResponsable,
  upload.single('imagen'),
  ticketController.crear
);

// Editar ticket
router.put(
  '/:id',
  roleMiddleware.esAdminOResponsable,
  upload.single('imagen'),
  ticketController.editar
);

// Eliminar ticket
router.delete(
  '/:id',
  roleMiddleware.esAdminOResponsable,
  ticketController.eliminar
);

// Actualizar stock
router.put(
  '/:id/stock',
  roleMiddleware.esAdminOResponsable,
  ticketController.actualizarStock
);

// Listar tickets por repositorio
router.get('/repositorio/:id', ticketController.listarPorRepositorio);

export default router;