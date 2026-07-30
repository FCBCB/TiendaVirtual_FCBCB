import pool from '../db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LibroController {
  // =====================================================
  // LISTAR LIBROS CON DESCUENTOS - RECALCULA EN TIEMPO REAL
  // =====================================================
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
          p.descuento_porcentaje,
          p.precio_con_descuento,
          p.fecha_inicio_descuento,
          p.fecha_fin_descuento,
          p.tipo_descuento,
          p.aplica_descuento,
          p.imagen_principal,
          p.activo,
          p.fecha_creacion,
          l.id_autor,
          l.id_categoria,
          l.titulo_libro,
          l.reseña,
          l.tema,
          l.editorial,
          l.anio_publicacion,
          l.isbn,
          l.portada_libro,
          l.descuento_especial,
          l.motivo_descuento,
          CONCAT(a.nombre, ' ', a.apellido) AS autor_nombre_completo,
          a.nombre AS autor_nombre,
          a.apellido AS autor_apellido,
          c.nombre AS categoria_nombre,
          COALESCE(SUM(dp.stock), 0) as stock_total
        FROM producto p
        JOIN libro l ON p.id_producto = l.id_producto
        LEFT JOIN autor a ON l.id_autor = a.id_autor
        LEFT JOIN categoria_libro c ON l.id_categoria = c.id_categoria
        LEFT JOIN disponibilidad_producto dp ON p.id_producto = dp.id_producto
        WHERE p.tipo_producto = 'libro' AND p.activo = true
      `;
      
      const params = [];
      
      if (usuario.rol === 'responsable' && usuario.id_repositorio_asignado) {
        query += ` AND dp.id_repositorio = $${params.length + 1}`;
        params.push(usuario.id_repositorio_asignado);
      }
      
      query += ` GROUP BY p.id_producto, l.id_producto, a.id_autor, c.id_categoria 
                 ORDER BY p.fecha_creacion DESC`;
      
      const result = await pool.query(query, params);
      const libros = result.rows;
      
      const librosConRepositorios = await Promise.all(
        libros.map(async (libro) => {
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
            [libro.id_producto]
          );
          
          // ✅ CALCULAR EN TIEMPO REAL
          const descuentoPorcentaje = parseFloat(libro.descuento_porcentaje) || 0;
          const precio = parseFloat(libro.precio) || 0;
          
          // ✅ RECALCULAR fechas
          let fechaInicio = null;
          let fechaFin = null;
          if (libro.fecha_inicio_descuento) {
            fechaInicio = new Date(libro.fecha_inicio_descuento);
          }
          if (libro.fecha_fin_descuento) {
            fechaFin = new Date(libro.fecha_fin_descuento);
          }
          const ahora = new Date();
          
          // ✅ RECALCULAR aplica_descuento (IGNORAR VALOR DE LA BD)
          const aplicaDescuento = descuentoPorcentaje > 0 && 
            (fechaInicio === null || fechaInicio <= ahora) &&
            (fechaFin === null || fechaFin >= ahora);
          
          // ✅ RECALCULAR precio con descuento
          let precioConDescuento = precio;
          if (aplicaDescuento) {
            precioConDescuento = precio - (precio * descuentoPorcentaje / 100);
            // Si existe precio_con_descuento en la BD y es válido, usarlo
            const precioBD = parseFloat(libro.precio_con_descuento);
            if (!isNaN(precioBD) && precioBD > 0) {
              precioConDescuento = precioBD;
            }
          }
          
          return {
            ...libro,
            // ✅ SOBREESCRIBIR valores de la BD
            aplica_descuento: aplicaDescuento,
            descuento_porcentaje: descuentoPorcentaje,
            precio_con_descuento: precioConDescuento,
            precio_final: aplicaDescuento ? precioConDescuento : precio,
            descuento_activo: aplicaDescuento,
            repositorios_disponibles: reposResult.rows
          };
        })
      );
      
      res.json({
        libros: librosConRepositorios,
        total: librosConRepositorios.length,
        rol: usuario.rol || 'publico'
      });
    } catch (error) {
      console.error('Error listar libros:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // LISTAR LIBROS POR REPOSITORIO
  // =====================================================
  async listarPorRepositorio(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || {};
      
      if (usuario.rol === 'responsable' && usuario.id_repositorio_asignado != id) {
        return res.status(403).json({
          message: 'No tienes permisos para ver libros de este repositorio'
        });
      }
      
      const result = await pool.query(
        `SELECT 
           p.id_producto,
           p.nombre,
           p.descripcion_general,
           p.descripcion_especifica,
           p.precio,
           p.descuento_porcentaje,
           p.precio_con_descuento,
           p.fecha_inicio_descuento,
           p.fecha_fin_descuento,
           p.tipo_descuento,
           p.aplica_descuento,
           p.imagen_principal,
           p.activo,
           l.titulo_libro,
           l.reseña,
           l.tema,
           l.editorial,
           l.anio_publicacion,
           l.isbn,
           l.portada_libro,
           l.descuento_especial,
           l.motivo_descuento,
           CONCAT(a.nombre, ' ', a.apellido) AS autor_nombre_completo,
           c.nombre AS categoria_nombre,
           dp.id_disponibilidad,
           dp.stock,
           dp.estado as estado_disponibilidad
         FROM producto p
         JOIN libro l ON p.id_producto = l.id_producto
         LEFT JOIN autor a ON l.id_autor = a.id_autor
         LEFT JOIN categoria_libro c ON l.id_categoria = c.id_categoria
         JOIN disponibilidad_producto dp ON p.id_producto = dp.id_producto
         WHERE p.tipo_producto = 'libro' 
           AND p.activo = true
           AND dp.id_repositorio = $1
         ORDER BY p.fecha_creacion DESC`,
        [id]
      );
      
      res.json({ libros: result.rows });
    } catch (error) {
      console.error('Error listar libros por repositorio:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // OBTENER LIBRO POR ID - CON RECÁLCULO EN TIEMPO REAL
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
           p.descuento_porcentaje,
           p.precio_con_descuento,
           p.fecha_inicio_descuento,
           p.fecha_fin_descuento,
           p.tipo_descuento,
           p.aplica_descuento,
           p.imagen_principal,
           p.activo,
           p.fecha_creacion,
           l.id_autor,
           l.id_categoria,
           l.titulo_libro,
           l.reseña,
           l.tema,
           l.editorial,
           l.anio_publicacion,
           l.isbn,
           l.portada_libro,
           l.descuento_especial,
           l.motivo_descuento,
           CONCAT(a.nombre, ' ', a.apellido) AS autor_nombre_completo,
           a.nombre AS autor_nombre,
           a.apellido AS autor_apellido,
           a.biografia AS autor_biografia,
           a.nacionalidad AS autor_nacionalidad,
           c.nombre AS categoria_nombre,
           c.descripcion AS categoria_descripcion,
           COALESCE(SUM(dp.stock), 0) as stock_total
         FROM producto p
         JOIN libro l ON p.id_producto = l.id_producto
         LEFT JOIN autor a ON l.id_autor = a.id_autor
         LEFT JOIN categoria_libro c ON l.id_categoria = c.id_categoria
         LEFT JOIN disponibilidad_producto dp ON p.id_producto = dp.id_producto
         WHERE p.id_producto = $1 AND p.tipo_producto = 'libro'
         GROUP BY p.id_producto, l.id_producto, a.id_autor, c.id_categoria`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Libro no encontrado' });
      }
      
      const libro = result.rows[0];
      
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
      
      // ✅ RECALCULAR EN TIEMPO REAL
      const descuentoPorcentaje = parseFloat(libro.descuento_porcentaje) || 0;
      const precio = parseFloat(libro.precio) || 0;
      
      let fechaInicio = null;
      let fechaFin = null;
      if (libro.fecha_inicio_descuento) {
        fechaInicio = new Date(libro.fecha_inicio_descuento);
      }
      if (libro.fecha_fin_descuento) {
        fechaFin = new Date(libro.fecha_fin_descuento);
      }
      const ahora = new Date();
      
      const aplicaDescuento = descuentoPorcentaje > 0 && 
        (fechaInicio === null || fechaInicio <= ahora) &&
        (fechaFin === null || fechaFin >= ahora);
      
      let precioConDescuento = precio;
      if (aplicaDescuento) {
        precioConDescuento = precio - (precio * descuentoPorcentaje / 100);
        const precioBD = parseFloat(libro.precio_con_descuento);
        if (!isNaN(precioBD) && precioBD > 0) {
          precioConDescuento = precioBD;
        }
      }
      
      libro.repositorios_disponibles = reposResult.rows;
      // ✅ SOBREESCRIBIR valores
      libro.aplica_descuento = aplicaDescuento;
      libro.precio_con_descuento = precioConDescuento;
      libro.precio_final = aplicaDescuento ? precioConDescuento : precio;
      
      if (usuario.rol === 'responsable') {
        const tienePermiso = libro.repositorios_disponibles.some(
          r => r.id_repositorio === usuario.id_repositorio_asignado
        );
        if (!tienePermiso) {
          return res.status(403).json({
            message: 'No tienes permisos para ver este libro'
          });
        }
      }
      
      res.json({ libro });
    } catch (error) {
      console.error('Error obtener libro:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // CREAR LIBRO
  // =====================================================
  async crear(req, res) {
    try {
      const {
        nombre,
        descripcion_general,
        descripcion_especifica,
        precio,
        id_autor,
        id_categoria,
        titulo_libro,
        reseña,
        tema,
        editorial,
        anio_publicacion,
        isbn,
        repositorios,
        descuento_porcentaje,
        fecha_inicio_descuento,
        fecha_fin_descuento,
        tipo_descuento,
        motivo_descuento
      } = req.body;

      const usuario = req.usuario || {};

      if (!nombre || !precio || !titulo_libro || !id_autor) {
        return res.status(400).json({
          message: 'Nombre, precio, título del libro y autor son requeridos'
        });
      }

      let repositoriosList = repositorios;
      if (typeof repositorios === 'string') {
        try {
          repositoriosList = JSON.parse(repositorios);
        } catch (e) {
          return res.status(400).json({ message: 'Formato de repositorios inválido' });
        }
      }

      if (!repositoriosList || !repositoriosList.length) {
        return res.status(400).json({ message: 'Debe seleccionar al menos un repositorio' });
      }

      let imagen_url = null;
      let portada_libro = null;

      if (req.file) {
        imagen_url = `/uploads/libros/${path.basename(req.file.path)}`;
        portada_libro = imagen_url;
      }

      const descuento = parseFloat(descuento_porcentaje) || 0;
      const fechaInicio = fecha_inicio_descuento || null;
      const fechaFin = fecha_fin_descuento || null;
      const aplicaDescuento = descuento > 0 && 
        (fechaInicio === null || new Date(fechaInicio) <= new Date()) &&
        (fechaFin === null || new Date(fechaFin) >= new Date());

      const productoResult = await pool.query(
        `INSERT INTO producto 
         (tipo_producto, nombre, descripcion_general, descripcion_especifica, precio, 
          imagen_principal, creado_por,
          descuento_porcentaje, fecha_inicio_descuento, fecha_fin_descuento, 
          tipo_descuento, aplica_descuento)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id_producto`,
        ['libro', nombre, descripcion_general || null, descripcion_especifica || null,
         precio, imagen_url, usuario.id_usuario || null,
         descuento, fechaInicio, fechaFin,
         tipo_descuento || 'normal', aplicaDescuento]
      );

      const id_producto = productoResult.rows[0].id_producto;

      await pool.query(
        `INSERT INTO libro 
         (id_producto, id_autor, id_categoria, titulo_libro, reseña, tema, 
          editorial, anio_publicacion, isbn, portada_libro,
          descuento_especial, motivo_descuento)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [id_producto, id_autor, id_categoria || null, titulo_libro, reseña || null,
         tema || null, editorial || null, anio_publicacion || null,
         isbn || null, portada_libro,
         descuento || 0, motivo_descuento || null]
      );

      for (const repo of repositoriosList) {
        await pool.query(
          `INSERT INTO disponibilidad_producto 
           (id_repositorio, id_producto, stock, estado, actualizado_por)
           VALUES ($1, $2, $3, $4, $5)`,
          [repo.id_repositorio, id_producto, repo.stock || 0, 'disponible', usuario.id_usuario || null]
        );
      }

      res.status(201).json({
        message: 'Libro creado exitosamente',
        id_producto: id_producto,
        portada: portada_libro,
        descuento_aplicado: aplicaDescuento,
        precio_final: aplicaDescuento ? precio - (precio * descuento / 100) : precio
      });
    } catch (error) {
      console.error('Error crear libro:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // EDITAR LIBRO
  // =====================================================
  async editar(req, res) {
    try {
      const { id } = req.params;
      const {
        nombre,
        descripcion_general,
        descripcion_especifica,
        precio,
        id_autor,
        id_categoria,
        titulo_libro,
        reseña,
        tema,
        editorial,
        anio_publicacion,
        isbn,
        repositorios,
        portada_actual,
        imagen_actual,
        activo,
        descuento_porcentaje,
        fecha_inicio_descuento,
        fecha_fin_descuento,
        tipo_descuento,
        descuento_especial,
        motivo_descuento
      } = req.body;

      const usuario = req.usuario || {};

      const productoExistente = await pool.query(
        `SELECT p.*, l.* 
         FROM producto p
         JOIN libro l ON p.id_producto = l.id_producto
         WHERE p.id_producto = $1 AND p.tipo_producto = 'libro'`,
        [id]
      );

      if (productoExistente.rows.length === 0) {
        return res.status(404).json({ message: 'Libro no encontrado' });
      }

      let repositoriosList = repositorios;
      if (typeof repositorios === 'string') {
        try {
          repositoriosList = JSON.parse(repositorios);
        } catch (e) {
          return res.status(400).json({ message: 'Formato de repositorios inválido' });
        }
      }

      let imagen_url = imagen_actual || productoExistente.rows[0].imagen_principal;
      let portada_libro = portada_actual || productoExistente.rows[0].portada_libro;

      if (req.file) {
        if (imagen_actual && imagen_actual.startsWith('/uploads')) {
          const oldPath = path.join(__dirname, '../..', imagen_actual);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        imagen_url = `/uploads/libros/${path.basename(req.file.path)}`;
        portada_libro = imagen_url;
      }

      const activoBool = activo !== undefined ? activo : true;
      const descuento = parseFloat(descuento_porcentaje) || 0;
      const descEsp = parseFloat(descuento_especial) || 0;
      const fechaInicio = fecha_inicio_descuento || null;
      const fechaFin = fecha_fin_descuento || null;
      
      const aplicaDescuento = descuento > 0 && 
        (fechaInicio === null || new Date(fechaInicio) <= new Date()) &&
        (fechaFin === null || new Date(fechaFin) >= new Date());

      await pool.query(
        `UPDATE producto 
         SET nombre = $1, descripcion_general = $2, descripcion_especifica = $3, 
             precio = $4, imagen_principal = $5, activo = $6,
             descuento_porcentaje = $7, fecha_inicio_descuento = $8, 
             fecha_fin_descuento = $9, tipo_descuento = $10, aplica_descuento = $11
         WHERE id_producto = $12`,
        [nombre, descripcion_general || null, descripcion_especifica || null,
         precio, imagen_url, activoBool,
         descuento, fechaInicio, fechaFin,
         tipo_descuento || 'normal', aplicaDescuento, id]
      );

      await pool.query(
        `UPDATE libro 
         SET id_autor = $1, id_categoria = $2, titulo_libro = $3, 
             reseña = $4, tema = $5, editorial = $6, 
             anio_publicacion = $7, isbn = $8, portada_libro = $9,
             descuento_especial = $10, motivo_descuento = $11
         WHERE id_producto = $12`,
        [id_autor, id_categoria || null, titulo_libro, reseña || null,
         tema || null, editorial || null, anio_publicacion || null,
         isbn || null, portada_libro,
         descEsp, motivo_descuento || null, id]
      );

      await pool.query('DELETE FROM disponibilidad_producto WHERE id_producto = $1', [id]);

      for (const repo of repositoriosList) {
        await pool.query(
          `INSERT INTO disponibilidad_producto 
           (id_repositorio, id_producto, stock, estado, actualizado_por)
           VALUES ($1, $2, $3, $4, $5)`,
          [repo.id_repositorio, id, repo.stock || 0, 'disponible', usuario.id_usuario || null]
        );
      }

      if (descuento !== productoExistente.rows[0].descuento_porcentaje) {
        await pool.query(
          `INSERT INTO historial_descuento 
           (id_producto, descuento_anterior, descuento_nuevo, 
            fecha_inicio_anterior, fecha_fin_anterior,
            fecha_inicio_nuevo, fecha_fin_nuevo,
            motivo, modificado_por)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [id, 
           productoExistente.rows[0].descuento_porcentaje || 0,
           descuento,
           productoExistente.rows[0].fecha_inicio_descuento,
           productoExistente.rows[0].fecha_fin_descuento,
           fechaInicio, fechaFin,
           motivo_descuento || 'Actualización de descuento',
           usuario.id_usuario || null]
        );
      }

      res.json({
        message: 'Libro actualizado exitosamente',
        portada: portada_libro,
        descuento_aplicado: aplicaDescuento,
        precio_final: aplicaDescuento ? precio - (precio * descuento / 100) : precio
      });
    } catch (error) {
      console.error('Error editar libro:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // ELIMINAR LIBRO
  // =====================================================
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || {};

      const productoExistente = await pool.query(
        `SELECT p.id_producto, p.activo
         FROM producto p
         WHERE p.id_producto = $1 AND p.tipo_producto = 'libro'`,
        [id]
      );

      if (productoExistente.rows.length === 0) {
        return res.status(404).json({ message: 'Libro no encontrado' });
      }

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
            message: 'No tienes permisos para eliminar este libro'
          });
        }
      }

      await pool.query(`UPDATE producto SET activo = false WHERE id_producto = $1`, [id]);

      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_anteriores)
         VALUES ($1, 'eliminar_libro', 'producto', $2, $3::jsonb)`,
        [usuario.id_usuario || null, id, JSON.stringify(productoExistente.rows[0])]
      );

      res.json({ message: 'Libro eliminado exitosamente' });
    } catch (error) {
      console.error('Error eliminar libro:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // APLICAR DESCUENTO
  // =====================================================
async aplicarDescuento(req, res) {
  try {
    const { id } = req.params;
    let {
      descuento_porcentaje,
      fecha_inicio,
      fecha_fin,
      tipo_descuento,
      motivo
    } = req.body;

    const usuario = req.usuario || {};

    const descuento = parseFloat(descuento_porcentaje);
    
    if (isNaN(descuento) || descuento === null || descuento === undefined) {
      return res.status(400).json({ 
        message: 'El porcentaje de descuento debe ser un número válido' 
      });
    }

    if (descuento < 0 || descuento > 100) {
      return res.status(400).json({ 
        message: 'El porcentaje de descuento debe estar entre 0 y 100' 
      });
    }

    const productoExistente = await pool.query(
      `SELECT * FROM producto WHERE id_producto = $1 AND tipo_producto = 'libro'`,
      [id]
    );

    if (productoExistente.rows.length === 0) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }

    // ✅ PRIMERO: Calcular si aplica descuento
    const fechaInicioParsed = fecha_inicio ? new Date(fecha_inicio) : null;
    const fechaFinParsed = fecha_fin ? new Date(fecha_fin) : null;
    const ahora = new Date();
    
    const aplicaDescuento = descuento > 0 && 
      (fechaInicioParsed === null || fechaInicioParsed <= ahora) &&
      (fechaFinParsed === null || fechaFinParsed >= ahora);

    // ✅ SEGUNDO: Actualizar producto con valores calculados
    await pool.query(
      `UPDATE producto 
       SET 
         descuento_porcentaje = $1,
         fecha_inicio_descuento = $2,
         fecha_fin_descuento = $3,
         tipo_descuento = $4,
         aplica_descuento = $5
       WHERE id_producto = $6`,
      [
        descuento,
        fecha_inicio || null,
        fecha_fin || null,
        tipo_descuento || 'normal',
        aplicaDescuento,
        id
      ]
    );

    // ✅ TERCERO: Registrar en historial
    await pool.query(
      `INSERT INTO historial_descuento 
       (id_producto, descuento_anterior, descuento_nuevo, 
        fecha_inicio_anterior, fecha_fin_anterior,
        fecha_inicio_nuevo, fecha_fin_nuevo,
        motivo, modificado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        productoExistente.rows[0].descuento_porcentaje || 0,
        descuento,
        productoExistente.rows[0].fecha_inicio_descuento,
        productoExistente.rows[0].fecha_fin_descuento,
        fecha_inicio || null,
        fecha_fin || null,
        motivo || 'Aplicación de descuento manual',
        usuario.id_usuario || null
      ]
    );

    // ✅ CUARTO: Obtener el libro actualizado
    const libroActualizado = await pool.query(
      `SELECT p.*, l.* 
       FROM producto p
       JOIN libro l ON p.id_producto = l.id_producto
       WHERE p.id_producto = $1`,
      [id]
    );

    const libro = libroActualizado.rows[0];
    
    // ✅ QUINTO: Recalcular en tiempo real para la respuesta
    const descuentoFinal = parseFloat(libro.descuento_porcentaje) || 0;
    const precioFinal = parseFloat(libro.precio) || 0;
    
    let fechaInicioFinal = null;
    let fechaFinFinal = null;
    if (libro.fecha_inicio_descuento) {
      fechaInicioFinal = new Date(libro.fecha_inicio_descuento);
    }
    if (libro.fecha_fin_descuento) {
      fechaFinFinal = new Date(libro.fecha_fin_descuento);
    }
    const ahoraFinal = new Date();
    
    const aplicaDescuentoFinal = descuentoFinal > 0 && 
      (fechaInicioFinal === null || fechaInicioFinal <= ahoraFinal) &&
      (fechaFinFinal === null || fechaFinFinal >= ahoraFinal);
    
    const precioConDescuentoFinal = aplicaDescuentoFinal 
      ? precioFinal - (precioFinal * descuentoFinal / 100)
      : precioFinal;

    res.json({
      message: 'Descuento aplicado exitosamente',
      libro: {
        ...libro,
        aplica_descuento: aplicaDescuentoFinal,
        precio_con_descuento: precioConDescuentoFinal,
        precio_final: aplicaDescuentoFinal ? precioConDescuentoFinal : precioFinal
      },
      precio_final: precioConDescuentoFinal
    });
  } catch (error) {
    console.error('Error aplicar descuento:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

  // =====================================================
  // ELIMINAR DESCUENTO
  // =====================================================
  async eliminarDescuento(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || {};

      const productoExistente = await pool.query(
        `SELECT * FROM producto WHERE id_producto = $1 AND tipo_producto = 'libro'`,
        [id]
      );

      if (productoExistente.rows.length === 0) {
        return res.status(404).json({ message: 'Libro no encontrado' });
      }

      const descuentoAnterior = productoExistente.rows[0].descuento_porcentaje || 0;

      await pool.query(
        `UPDATE producto 
         SET descuento_porcentaje = 0, 
             fecha_inicio_descuento = NULL, 
             fecha_fin_descuento = NULL,
             aplica_descuento = FALSE,
             tipo_descuento = 'normal'
         WHERE id_producto = $1`,
        [id]
      );

      await pool.query(
        `INSERT INTO historial_descuento 
         (id_producto, descuento_anterior, descuento_nuevo, motivo, modificado_por)
         VALUES ($1, $2, 0, $3, $4)`,
        [id, descuentoAnterior, 'Eliminación de descuento', usuario.id_usuario || null]
      );

      res.json({
        message: 'Descuento eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminar descuento:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // LISTAR HISTORIAL DE DESCUENTOS
  // =====================================================
  async listarHistorialDescuentos(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT 
           hd.id_historial,
           hd.descuento_anterior,
           hd.descuento_nuevo,
           hd.fecha_inicio_anterior,
           hd.fecha_fin_anterior,
           hd.fecha_inicio_nuevo,
           hd.fecha_fin_nuevo,
           hd.motivo,
           hd.fecha_modificacion,
           u.username AS modificado_por_usuario,
           CONCAT(pu.nombre, ' ', pu.apellido_paterno) AS modificado_por_nombre
         FROM historial_descuento hd
         LEFT JOIN usuario u ON hd.modificado_por = u.id_usuario
         LEFT JOIN perfil_usuario pu ON u.id_usuario = pu.id_usuario
         WHERE hd.id_producto = $1
         ORDER BY hd.fecha_modificacion DESC`,
        [id]
      );

      res.json({ historial: result.rows });
    } catch (error) {
      console.error('Error listar historial descuentos:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // VERIFICAR DESCUENTOS ACTIVOS
  // =====================================================
  async verificarDescuentosActivos(req, res) {
    try {
      await pool.query('SELECT verificar_descuentos_activos()');
      
      res.json({
        message: 'Descuentos verificados y actualizados exitosamente'
      });
    } catch (error) {
      console.error('Error verificar descuentos:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // LISTAR AUTORES
  // =====================================================
  async listarAutores(req, res) {
    try {
      const result = await pool.query(
        `SELECT id_autor, nombre, apellido, CONCAT(nombre, ' ', apellido) as nombre_completo
         FROM autor
         WHERE activo = true
         ORDER BY apellido, nombre`
      );
      
      res.json({ autores: result.rows });
    } catch (error) {
      console.error('Error listar autores:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // LISTAR CATEGORÍAS
  // =====================================================
  async listarCategorias(req, res) {
    try {
      const result = await pool.query(
        `SELECT id_categoria, nombre, descripcion
         FROM categoria_libro
         WHERE activo = true
         ORDER BY nombre`
      );
      
      res.json({ categorias: result.rows });
    } catch (error) {
      console.error('Error listar categorías:', error);
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
  // ACTUALIZAR STOCK
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

      const productoExistente = await pool.query(
        `SELECT id_producto FROM producto WHERE id_producto = $1 AND tipo_producto = 'libro'`,
        [id]
      );

      if (productoExistente.rows.length === 0) {
        return res.status(404).json({ message: 'Libro no encontrado' });
      }

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
}

export default new LibroController();