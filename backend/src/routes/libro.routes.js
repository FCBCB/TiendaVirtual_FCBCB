import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import libroController from '../controllers/libro.controller.js';
import autorController from '../controllers/autor.controller.js';
import categoriaController from '../controllers/categoria.controller.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads/libros');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Carpeta creada para libros:', uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `libro-${uniqueSuffix}${ext}`);
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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

const router = express.Router();

// ============================================================
// ⚠️ IMPORTANTE: Las rutas específicas DEBEN ir ANTES de las rutas con parámetros
// ============================================================

// ============================================================
// RUTAS PÚBLICAS - AUTORES Y CATEGORÍAS (sin parámetros)
// ============================================================
router.get('/autores', libroController.listarAutores);
router.get('/categorias', libroController.listarCategorias);
router.get('/repositorios/disponibles', libroController.listarRepositoriosDisponibles);

// ============================================================
// RUTAS PÚBLICAS - LIBROS (con parámetros)
// ============================================================
router.get('/', libroController.listar);
router.get('/repositorio/:id', libroController.listarPorRepositorio);

// ============================================================
// RUTAS PROTEGIDAS - LIBROS
// ============================================================
router.use(verificarToken);

router.post(
  '/',
  roleMiddleware.esAdminOResponsable,
  upload.single('portada'),
  libroController.crear
);

router.put(
  '/:id',
  roleMiddleware.esAdminOResponsable,
  upload.single('portada'),
  libroController.editar
);

router.delete(
  '/:id',
  roleMiddleware.esAdminOResponsable,
  libroController.eliminar
);

router.put(
  '/:id/stock',
  roleMiddleware.esAdminOResponsable,
  libroController.actualizarStock
);

// ============================================================
// ✅ NUEVAS RUTAS PARA DESCUENTOS (DEBEN IR ANTES DE /:id)
// ============================================================

// Verificar descuentos activos
router.get(
  '/descuentos/verificar',
  roleMiddleware.esAdminOResponsable,
  libroController.verificarDescuentosActivos
);

// Aplicar descuento a un libro
router.post(
  '/:id/descuento',
  roleMiddleware.esAdminOResponsable,
  libroController.aplicarDescuento
);

// Eliminar descuento de un libro
router.delete(
  '/:id/descuento',
  roleMiddleware.esAdminOResponsable,
  libroController.eliminarDescuento
);

// Historial de descuentos de un libro
router.get(
  '/:id/descuento/historial',
  roleMiddleware.esAdminOResponsable,
  libroController.listarHistorialDescuentos
);

// ============================================================
// RUTA CON PARÁMETRO (DEBE IR AL FINAL)
// ============================================================
router.get('/:id', libroController.obtenerPorId);

// ============================================================
// RUTAS PROTEGIDAS - AUTORES (solo admin)
// ============================================================
router.get('/admin/autores', roleMiddleware.esAdminGeneral, autorController.listarTodos);
router.post('/autores', roleMiddleware.esAdminGeneral, autorController.crear);
router.put('/autores/:id', roleMiddleware.esAdminGeneral, autorController.editar);
router.delete('/autores/:id', roleMiddleware.esAdminGeneral, autorController.eliminar);
router.get('/autores/:id', roleMiddleware.esAdminGeneral, autorController.obtenerPorId);

// ============================================================
// RUTAS PROTEGIDAS - CATEGORÍAS (solo admin)
// ============================================================
router.get('/admin/categorias', roleMiddleware.esAdminGeneral, categoriaController.listarTodos);
router.post('/categorias', roleMiddleware.esAdminGeneral, categoriaController.crear);
router.put('/categorias/:id', roleMiddleware.esAdminGeneral, categoriaController.editar);
router.delete('/categorias/:id', roleMiddleware.esAdminGeneral, categoriaController.eliminar);
router.get('/categorias/:id', roleMiddleware.esAdminGeneral, categoriaController.obtenerPorId);

export default router;