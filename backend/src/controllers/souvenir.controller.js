import pool from '../db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SouvenirController {
  // =====================================================
  // LISTAR SOUVENIRS CON SUS REPOSITORIOS Y STOCK
  // =====================================================
// En el método listar de SouvenirController
async listar(req, res) {
  try {
    const usuario = req.usuario || {};
    
    let query = `
      SELECT 
        p.id_producto,
        p.tipo_producto,
        p.nombre,
        p.descripcion_general,
        p.descripcion_especifica,
        p.precio,
        p.imagen_principal,
        p.activo,
        p.fecha_creacion,
        s.tipo_souvenir,
        s.material,
        s.dimensiones,
        s.peso,
        COALESCE(SUM(dp.stock), 0) as stock_total
      FROM producto p
      JOIN souvenir s ON p.id_producto = s.id_producto
      LEFT JOIN disponibilidad_producto dp ON p.id_producto = dp.id_producto
      WHERE p.tipo_producto = 'souvenir' AND p.activo = true
    `;
    
    const params = [];
    
    if (usuario.rol === 'responsable' && usuario.id_repositorio_asignado) {
      query += ` AND dp.id_repositorio = $${params.length + 1}`;
      params.push(usuario.id_repositorio_asignado);
    }
    
    query += ` GROUP BY p.id_producto, s.id_producto ORDER BY p.fecha_creacion DESC`;
    
    const result = await pool.query(query, params);
    const souvenirs = result.rows;
    
    // ✅ Para cada souvenir, obtener sus imágenes adicionales
    const souvenirsConRepositorios = await Promise.all(
      souvenirs.map(async (souvenir) => {
        // Obtener repositorios
        const reposResult = await pool.query(
          `SELECT 
             r.id_repositorio,
             r.nombre,
             r.sigla,
             r.direccion,
             r.ubicacion_gps,
             r.departamento,
             dp.stock,
             dp.estado as estado_disponibilidad
           FROM disponibilidad_producto dp
           JOIN repositorio r ON dp.id_repositorio = r.id_repositorio
           WHERE dp.id_producto = $1 AND r.activo = true`,
          [souvenir.id_producto]
        );
        
        // ✅ Obtener imágenes adicionales
        let imagenesAdicionales = [];
        try {
          const imagenesResult = await pool.query(
            `SELECT id_imagen, imagen_url, descripcion, orden
             FROM imagen_souvenir
             WHERE id_producto = $1
             ORDER BY orden ASC`,
            [souvenir.id_producto]
          );
          imagenesAdicionales = imagenesResult.rows;
        } catch (error) {
          console.error('Error obteniendo imágenes adicionales:', error);
        }
        
        return {
          ...souvenir,
          imagenes_adicionales: imagenesAdicionales,
          repositorios_disponibles: reposResult.rows
        };
      })
    );
    
    res.json({
      souvenirs: souvenirsConRepositorios,
      total: souvenirsConRepositorios.length,
      rol: usuario.rol || 'publico'
    });
  } catch (error) {
    console.error('Error listar souvenirs:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

  // =====================================================
  // LISTAR SOUVENIRS POR REPOSITORIO
  // =====================================================
  async listarPorRepositorio(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || {};
      
      // Verificar permisos si es responsable
      if (usuario.rol === 'responsable' && usuario.id_repositorio_asignado != id) {
        return res.status(403).json({
          message: 'No tienes permisos para ver souvenirs de este repositorio'
        });
      }
      
      const result = await pool.query(
        `SELECT 
           p.id_producto,
           p.nombre,
           p.descripcion_general,
           p.descripcion_especifica,
           p.precio,
           p.imagen_principal,
           p.activo,
           s.tipo_souvenir,
           s.material,
           s.dimensiones,
           s.peso,
           dp.id_disponibilidad,
           dp.stock,
           dp.estado as estado_disponibilidad
         FROM producto p
         JOIN souvenir s ON p.id_producto = s.id_producto
         JOIN disponibilidad_producto dp ON p.id_producto = dp.id_producto
         WHERE p.tipo_producto = 'souvenir' 
           AND p.activo = true
           AND dp.id_repositorio = $1
         ORDER BY p.fecha_creacion DESC`,
        [id]
      );
      
      res.json({ souvenirs: result.rows });
    } catch (error) {
      console.error('Error listar souvenirs por repositorio:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

// =====================================================
// OBTENER SOUVENIR POR ID - CORREGIDO CON STOCK_TOTAL
// =====================================================
async obtenerPorId(req, res) {
  try {
    const { id } = req.params;
    const usuario = req.usuario || {};

    const result = await pool.query(
      `SELECT 
         p.id_producto,
         p.tipo_producto,
         p.nombre,
         p.descripcion_general,
         p.descripcion_especifica,
         p.precio,
         p.imagen_principal,
         p.activo,
         p.fecha_creacion,
         s.tipo_souvenir,
         s.material,
         s.dimensiones,
         s.peso,
         COALESCE(SUM(dp.stock), 0) as stock_total
       FROM producto p
       JOIN souvenir s ON p.id_producto = s.id_producto
       LEFT JOIN disponibilidad_producto dp ON p.id_producto = dp.id_producto
       WHERE p.id_producto = $1 AND p.tipo_producto = 'souvenir'
       GROUP BY p.id_producto, s.id_producto`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Souvenir no encontrado' });
    }

    const souvenir = result.rows[0];

    // ✅ Obtener repositorios disponibles
    const reposResult = await pool.query(
      `SELECT 
         r.id_repositorio,
         r.nombre,
         r.sigla,
         r.direccion,
         r.ubicacion_gps,
         r.departamento,
         dp.stock,
         dp.estado as estado_disponibilidad
       FROM disponibilidad_producto dp
       JOIN repositorio r ON dp.id_repositorio = r.id_repositorio
       WHERE dp.id_producto = $1 AND r.activo = true`,
      [id]
    );
    souvenir.repositorios_disponibles = reposResult.rows;

    // ✅ Obtener imágenes adicionales - VERIFICAR QUE EXISTE LA TABLA
    try {
      const imagenesResult = await pool.query(
        `SELECT id_imagen, imagen_url, descripcion, orden
         FROM imagen_souvenir
         WHERE id_producto = $1
         ORDER BY orden ASC`,
        [id]
      );
      souvenir.imagenes_adicionales = imagenesResult.rows;
      
      console.log(`📸 Imágenes adicionales encontradas: ${souvenir.imagenes_adicionales.length}`);
    } catch (error) {
      console.error('Error obteniendo imágenes adicionales:', error);
      souvenir.imagenes_adicionales = [];
    }

    // ✅ Verificar permisos si es responsable
    if (usuario.rol === 'responsable') {
      const tienePermiso = souvenir.repositorios_disponibles.some(
        r => r.id_repositorio === usuario.id_repositorio_asignado
      );
      if (!tienePermiso) {
        return res.status(403).json({
          message: 'No tienes permisos para ver este souvenir'
        });
      }
    }

    res.json({ souvenir });
  } catch (error) {
    console.error('Error obtener souvenir:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

  // =====================================================
  // LISTAR REPOSITORIOS DISPONIBLES
  // =====================================================
  async listarRepositoriosDisponibles(req, res) {
    try {
      const result = await pool.query(
        `SELECT id_repositorio, nombre, sigla, direccion, ubicacion_gps, departamento
         FROM repositorio 
         WHERE activo = true
         ORDER BY nombre`
      );
      
      res.json({ repositorios: result.rows });
    } catch (error) {
      console.error('Error listarRepositoriosDisponibles:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

// =====================================================
// CREAR SOUVENIR - CORREGIDO CON MÚLTIPLES IMÁGENES
// =====================================================
async crear(req, res) {
  try {
    const {
      nombre,
      descripcion_general,
      descripcion_especifica,
      precio,
      tipo_souvenir,
      material,
      dimensiones,
      peso,
      repositorios
    } = req.body;

    const usuario = req.usuario || {};

    console.log('📦 Body recibido:', req.body);
    console.log('📁 Files recibidos:', req.files);

    // Validar campos requeridos
    if (!nombre || !precio) {
      return res.status(400).json({
        message: 'Nombre y precio son requeridos'
      });
    }

    // Parsear repositorios
    let repositoriosList = repositorios;
    if (typeof repositorios === 'string') {
      try {
        repositoriosList = JSON.parse(repositorios);
      } catch (e) {
        console.error('Error parsing repositorios:', e);
        return res.status(400).json({
          message: 'Formato de repositorios inválido'
        });
      }
    }

    if (!repositoriosList || !repositoriosList.length) {
      return res.status(400).json({
        message: 'Debe seleccionar al menos un repositorio'
      });
    }

    // Verificar permisos para responsable
    if (usuario.rol === 'responsable') {
      const tienePermiso = repositoriosList.some(
        r => parseInt(r.id_repositorio) === parseInt(usuario.id_repositorio_asignado)
      );
      if (!tienePermiso) {
        return res.status(403).json({
          message: 'Solo puedes agregar souvenirs a tu repositorio asignado'
        });
      }
    }

    // ✅ Manejar imagen principal y adicionales
    let imagen_url = null;
    let imagenes_adicionales = [];

    // Imagen principal (campo 'imagen')
    if (req.files && req.files.imagen && req.files.imagen[0]) {
      const file = req.files.imagen[0];
      imagen_url = `/uploads/souvenirs/${path.basename(file.path)}`;
      console.log('✅ Imagen principal guardada en:', imagen_url);
    }

    // Imágenes adicionales (campo 'imagenes')
    if (req.files && req.files.imagenes && req.files.imagenes.length > 0) {
      for (const file of req.files.imagenes) {
        const imgUrl = `/uploads/souvenirs/${path.basename(file.path)}`;
        imagenes_adicionales.push({
          url: imgUrl,
          orden: imagenes_adicionales.length
        });
        console.log('✅ Imagen adicional guardada en:', imgUrl);
      }
    }

    // 1. Insertar en PRODUCTO
    const productoResult = await pool.query(
      `INSERT INTO producto 
       (tipo_producto, nombre, descripcion_general, descripcion_especifica, precio, imagen_principal, creado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id_producto`,
      ['souvenir', nombre, descripcion_general || null, descripcion_especifica || null, 
       precio, imagen_url, usuario.id_usuario || null]
    );

    const id_producto = productoResult.rows[0].id_producto;

    // 2. Insertar en SOUVENIR
    await pool.query(
      `INSERT INTO souvenir 
       (id_producto, tipo_souvenir, material, dimensiones, peso)
       VALUES ($1, $2, $3, $4, $5)`,
      [id_producto, tipo_souvenir || null, material || null, dimensiones || null, peso || null]
    );

    // 3. Insertar imágenes adicionales
    for (const img of imagenes_adicionales) {
      await pool.query(
        `INSERT INTO imagen_souvenir (id_producto, imagen_url, orden)
         VALUES ($1, $2, $3)`,
        [id_producto, img.url, img.orden]
      );
    }

    // 4. Crear disponibilidad en cada repositorio
    for (const repo of repositoriosList) {
      await pool.query(
        `INSERT INTO disponibilidad_producto 
         (id_repositorio, id_producto, stock, estado, actualizado_por)
         VALUES ($1, $2, $3, $4, $5)`,
        [repo.id_repositorio, id_producto, repo.stock || 0, 'disponible', usuario.id_usuario || null]
      );
    }

    // 5. Registrar en bitácora
    await pool.query(
      `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_nuevos)
       VALUES ($1, 'crear_souvenir', 'producto', $2, $3::jsonb)`,
      [usuario.id_usuario || null, id_producto, JSON.stringify({ nombre, precio })]
    );

    res.status(201).json({
      message: 'Souvenir creado exitosamente',
      id_producto: id_producto,
      imagen: imagen_url,
      imagenes_adicionales: imagenes_adicionales
    });
  } catch (error) {
    console.error('Error crear souvenir:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// =====================================================
// EDITAR SOUVENIR - CORREGIDO CON MÚLTIPLES IMÁGENES
// =====================================================
async editar(req, res) {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion_general,
      descripcion_especifica,
      precio,
      tipo_souvenir,
      material,
      dimensiones,
      peso,
      repositorios,
      imagen_actual
    } = req.body;

    const usuario = req.usuario || {};

    console.log('📦 Body recibido editar:', req.body);
    console.log('📁 Files recibidos editar:', req.files);

    // Verificar que el producto existe
    const productoExistente = await pool.query(
      `SELECT p.*, s.* 
       FROM producto p
       JOIN souvenir s ON p.id_producto = s.id_producto
       WHERE p.id_producto = $1 AND p.tipo_producto = 'souvenir'`,
      [id]
    );

    if (productoExistente.rows.length === 0) {
      return res.status(404).json({ message: 'Souvenir no encontrado' });
    }

    // Parsear repositorios
    let repositoriosList = repositorios;
    if (typeof repositorios === 'string') {
      try {
        repositoriosList = JSON.parse(repositorios);
      } catch (e) {
        console.error('Error parsing repositorios:', e);
        return res.status(400).json({
          message: 'Formato de repositorios inválido'
        });
      }
    }

    // Verificar permisos para responsable
    if (usuario.rol === 'responsable') {
      const tienePermiso = repositoriosList.some(
        r => parseInt(r.id_repositorio) === parseInt(usuario.id_repositorio_asignado)
      );
      if (!tienePermiso) {
        return res.status(403).json({
          message: 'Solo puedes editar souvenirs de tu repositorio asignado'
        });
      }
    }

    // ✅ Manejar imagen principal
    let imagen_url = imagen_actual || productoExistente.rows[0].imagen_principal;

    if (req.files && req.files.imagen && req.files.imagen[0]) {
      // Eliminar imagen anterior si existe
      if (imagen_actual && imagen_actual.startsWith('/uploads')) {
        const oldPath = path.join(__dirname, '../..', imagen_actual);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
          console.log('🗑️ Imagen anterior eliminada:', oldPath);
        }
      }
      const file = req.files.imagen[0];
      imagen_url = `/uploads/souvenirs/${path.basename(file.path)}`;
      console.log('✅ Nueva imagen principal guardada:', imagen_url);
    }

    // ✅ Manejar imágenes adicionales nuevas
    if (req.files && req.files.imagenes && req.files.imagenes.length > 0) {
      for (const file of req.files.imagenes) {
        const imgUrl = `/uploads/souvenirs/${path.basename(file.path)}`;
        await pool.query(
          `INSERT INTO imagen_souvenir (id_producto, imagen_url, orden)
           VALUES ($1, $2, (SELECT COALESCE(MAX(orden), -1) + 1 FROM imagen_souvenir WHERE id_producto = $1))`,
          [id, imgUrl]
        );
        console.log('✅ Nueva imagen adicional guardada:', imgUrl);
      }
    }

    // 1. Actualizar PRODUCTO
    await pool.query(
      `UPDATE producto 
       SET nombre = $1, descripcion_general = $2, descripcion_especifica = $3, 
           precio = $4, imagen_principal = $5
       WHERE id_producto = $6`,
      [nombre, descripcion_general || null, descripcion_especifica || null,
       precio, imagen_url, id]
    );

    // 2. Actualizar SOUVENIR
    await pool.query(
      `UPDATE souvenir 
       SET tipo_souvenir = $1, material = $2, dimensiones = $3, peso = $4
       WHERE id_producto = $5`,
      [tipo_souvenir || null, material || null, dimensiones || null, peso || null, id]
    );

    // 3. Eliminar disponibilidades existentes
    await pool.query(
      'DELETE FROM disponibilidad_producto WHERE id_producto = $1',
      [id]
    );

    // 4. Crear nuevas disponibilidades
    for (const repo of repositoriosList) {
      await pool.query(
        `INSERT INTO disponibilidad_producto 
         (id_repositorio, id_producto, stock, estado, actualizado_por)
         VALUES ($1, $2, $3, $4, $5)`,
        [repo.id_repositorio, id, repo.stock || 0, 'disponible', usuario.id_usuario || null]
      );
    }

    // 5. Registrar en bitácora
    await pool.query(
      `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_anteriores, datos_nuevos)
       VALUES ($1, 'editar_souvenir', 'producto', $2, $3::jsonb, $4::jsonb)`,
      [
        usuario.id_usuario || null,
        id,
        JSON.stringify(productoExistente.rows[0]),
        JSON.stringify({ nombre, precio })
      ]
    );

    res.json({
      message: 'Souvenir actualizado exitosamente',
      imagen: imagen_url
    });
  } catch (error) {
    console.error('Error editar souvenir:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

  // =====================================================
  // ELIMINAR SOUVENIR (lógico)
  // =====================================================
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || {};

      // Verificar que el producto existe
      const productoExistente = await pool.query(
        `SELECT p.id_producto, p.activo
         FROM producto p
         WHERE p.id_producto = $1 AND p.tipo_producto = 'souvenir'`,
        [id]
      );

      if (productoExistente.rows.length === 0) {
        return res.status(404).json({ message: 'Souvenir no encontrado' });
      }

      // Verificar permisos para responsable
      if (usuario.rol === 'responsable') {
        const reposResult = await pool.query(
          `SELECT id_repositorio 
           FROM disponibilidad_producto 
           WHERE id_producto = $1`,
          [id]
        );
        
        const repositoriosIds = reposResult.rows.map(r => r.id_repositorio);
        if (!repositoriosIds.includes(parseInt(usuario.id_repositorio_asignado))) {
          return res.status(403).json({
            message: 'No tienes permisos para eliminar este souvenir'
          });
        }
      }

      // Eliminación lógica
      await pool.query(
        `UPDATE producto SET activo = false WHERE id_producto = $1`,
        [id]
      );

      // Registrar en bitácora
      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_anteriores)
         VALUES ($1, 'eliminar_souvenir', 'producto', $2, $3::jsonb)`,
        [usuario.id_usuario || null, id, JSON.stringify(productoExistente.rows[0])]
      );

      res.json({ message: 'Souvenir eliminado exitosamente' });
    } catch (error) {
      console.error('Error eliminar souvenir:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // ACTUALIZAR STOCK (solo admin)
  // =====================================================
  async actualizarStock(req, res) {
    try {
      const { id } = req.params;
      const { stock, id_repositorio } = req.body;
      const usuario = req.usuario || {};

      if (stock === undefined || stock < 0) {
        return res.status(400).json({ message: 'Stock no válido' });
      }

      if (!id_repositorio) {
        return res.status(400).json({ message: 'Repositorio requerido' });
      }

      // Verificar que el producto existe
      const productoExistente = await pool.query(
        `SELECT id_producto FROM producto WHERE id_producto = $1 AND tipo_producto = 'souvenir'`,
        [id]
      );

      if (productoExistente.rows.length === 0) {
        return res.status(404).json({ message: 'Souvenir no encontrado' });
      }

      // Actualizar stock
      await pool.query(
        `UPDATE disponibilidad_producto 
         SET stock = $1, estado = $2, actualizado_por = $3, ultima_actualizacion = CURRENT_TIMESTAMP
         WHERE id_producto = $4 AND id_repositorio = $5`,
        [
          stock,
          stock === 0 ? 'agotado' : 'disponible',
          usuario.id_usuario || null,
          id,
          id_repositorio
        ]
      );

      // Registrar en bitácora
      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_nuevos)
         VALUES ($1, 'actualizar_stock_souvenir', 'disponibilidad_producto', $2, $3::jsonb)`,
        [
          usuario.id_usuario || null,
          id,
          JSON.stringify({ stock, id_repositorio })
        ]
      );

      res.json({
        message: 'Stock actualizado exitosamente',
        stock,
        estado: stock === 0 ? 'agotado' : 'disponible'
      });
    } catch (error) {
      console.error('Error actualizar stock:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // SUBIR IMÁGENES ADICIONALES PARA SOUVENIR
  // =====================================================
  async subirImagenesAdicionales(req, res) {
    try {
      const { id } = req.params;
      const { descripcion } = req.body;
      const usuario = req.usuario || {};

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Debe subir al menos una imagen' });
      }

      // Verificar que el producto existe
      const productoExistente = await pool.query(
        `SELECT id_producto FROM producto WHERE id_producto = $1 AND tipo_producto = 'souvenir'`,
        [id]
      );

      if (productoExistente.rows.length === 0) {
        return res.status(404).json({ message: 'Souvenir no encontrado' });
      }

      const imagenes = [];
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imagen_url = `/uploads/souvenirs/${path.basename(file.path)}`;
        
        const result = await pool.query(
          `INSERT INTO imagen_souvenir (id_producto, imagen_url, descripcion, orden)
           VALUES ($1, $2, $3, $4)
           RETURNING id_imagen`,
          [id, imagen_url, descripcion || null, i]
        );
        
        imagenes.push({
          id_imagen: result.rows[0].id_imagen,
          imagen_url,
          descripcion: descripcion || null,
          orden: i
        });
      }

      res.status(201).json({
        message: 'Imágenes subidas exitosamente',
        imagenes
      });
    } catch (error) {
      console.error('Error subir imágenes adicionales:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // ELIMINAR IMAGEN ADICIONAL
  // =====================================================
  async eliminarImagen(req, res) {
    try {
      const { id } = req.params; // id_imagen
      const usuario = req.usuario || {};

      // Obtener información de la imagen
      const imagenResult = await pool.query(
        `SELECT imagen_url FROM imagen_souvenir WHERE id_imagen = $1`,
        [id]
      );

      if (imagenResult.rows.length === 0) {
        return res.status(404).json({ message: 'Imagen no encontrada' });
      }

      const imagen_url = imagenResult.rows[0].imagen_url;

      // Eliminar archivo físico
      if (imagen_url && imagen_url.startsWith('/uploads')) {
        const filePath = path.join(__dirname, '../..', imagen_url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('🗑️ Imagen eliminada:', filePath);
        }
      }

      // Eliminar de la base de datos
      await pool.query('DELETE FROM imagen_souvenir WHERE id_imagen = $1', [id]);

      res.json({ message: 'Imagen eliminada exitosamente' });
    } catch (error) {
      console.error('Error eliminar imagen:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

export default new SouvenirController();