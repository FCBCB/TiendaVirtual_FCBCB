import pool from '../db.js';

class AutorController {
  // =====================================================
  // LISTAR AUTORES
  // =====================================================
  async listar(req, res) {
    try {
      const result = await pool.query(
        `SELECT id_autor, nombre, apellido, 
                CONCAT(nombre, ' ', apellido) as nombre_completo,
                biografia, fecha_nacimiento, nacionalidad, activo
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
  // LISTAR TODOS LOS AUTORES (INCLUYE INACTIVOS - ADMIN)
  // =====================================================
  async listarTodos(req, res) {
    try {
      const result = await pool.query(
        `SELECT id_autor, nombre, apellido, 
                CONCAT(nombre, ' ', apellido) as nombre_completo,
                biografia, fecha_nacimiento, nacionalidad, activo,
                (SELECT COUNT(*) FROM libro WHERE id_autor = autor.id_autor AND activo = true) as total_libros
         FROM autor
         ORDER BY apellido, nombre`
      );
      
      res.json({ autores: result.rows });
    } catch (error) {
      console.error('Error listar todos autores:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // OBTENER AUTOR POR ID
  // =====================================================
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        `SELECT a.*, 
                (SELECT COUNT(*) FROM libro WHERE id_autor = a.id_autor AND activo = true) as total_libros
         FROM autor a
         WHERE a.id_autor = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Autor no encontrado' });
      }
      
      res.json({ autor: result.rows[0] });
    } catch (error) {
      console.error('Error obtener autor:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // CREAR AUTOR
  // =====================================================
  async crear(req, res) {
    try {
      const { nombre, apellido, biografia, fecha_nacimiento, nacionalidad } = req.body;
      
      if (!nombre || !apellido) {
        return res.status(400).json({ message: 'Nombre y apellido son requeridos' });
      }
      
      const result = await pool.query(
        `INSERT INTO autor (nombre, apellido, biografia, fecha_nacimiento, nacionalidad)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id_autor, nombre, apellido`,
        [nombre, apellido, biografia || null, fecha_nacimiento || null, nacionalidad || null]
      );
      
      // Registrar en bitácora
      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_nuevos)
         VALUES ($1, 'crear_autor', 'autor', $2, $3::jsonb)`,
        [req.usuario.id_usuario, result.rows[0].id_autor, JSON.stringify({ nombre, apellido })]
      );
      
      res.status(201).json({
        message: 'Autor creado exitosamente',
        autor: result.rows[0]
      });
    } catch (error) {
      console.error('Error crear autor:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // EDITAR AUTOR
  // =====================================================
  async editar(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellido, biografia, fecha_nacimiento, nacionalidad, activo } = req.body;
      
      // Verificar que el autor existe
      const autorExistente = await pool.query(
        'SELECT * FROM autor WHERE id_autor = $1',
        [id]
      );
      
      if (autorExistente.rows.length === 0) {
        return res.status(404).json({ message: 'Autor no encontrado' });
      }
      
      const activoBool = activo !== undefined ? activo : true;
      
      const result = await pool.query(
        `UPDATE autor 
         SET nombre = $1, apellido = $2, biografia = $3, 
             fecha_nacimiento = $4, nacionalidad = $5, activo = $6
         WHERE id_autor = $7
         RETURNING *`,
        [nombre, apellido, biografia || null, fecha_nacimiento || null, nacionalidad || null, activoBool, id]
      );
      
      // Registrar en bitácora
      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_anteriores, datos_nuevos)
         VALUES ($1, 'editar_autor', 'autor', $2, $3::jsonb, $4::jsonb)`,
        [req.usuario.id_usuario, id, JSON.stringify(autorExistente.rows[0]), JSON.stringify(result.rows[0])]
      );
      
      res.json({
        message: 'Autor actualizado exitosamente',
        autor: result.rows[0]
      });
    } catch (error) {
      console.error('Error editar autor:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // ELIMINAR AUTOR (lógico)
  // =====================================================
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar que el autor existe
      const autorExistente = await pool.query(
        'SELECT * FROM autor WHERE id_autor = $1',
        [id]
      );
      
      if (autorExistente.rows.length === 0) {
        return res.status(404).json({ message: 'Autor no encontrado' });
      }
      
      // Verificar si tiene libros asociados
      const librosAsociados = await pool.query(
        'SELECT COUNT(*) FROM libro WHERE id_autor = $1 AND activo = true',
        [id]
      );
      
      if (parseInt(librosAsociados.rows[0].count) > 0) {
        return res.status(400).json({
          message: `No se puede eliminar el autor porque tiene ${librosAsociados.rows[0].count} libro(s) asociados`
        });
      }
      
      await pool.query(
        'UPDATE autor SET activo = false WHERE id_autor = $1',
        [id]
      );
      
      // Registrar en bitácora
      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_anteriores)
         VALUES ($1, 'eliminar_autor', 'autor', $2, $3::jsonb)`,
        [req.usuario.id_usuario, id, JSON.stringify(autorExistente.rows[0])]
      );
      
      res.json({ message: 'Autor eliminado exitosamente' });
    } catch (error) {
      console.error('Error eliminar autor:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

export default new AutorController();