import pool from '../db.js';

class CategoriaController {
  // =====================================================
  // LISTAR CATEGORÍAS
  // =====================================================
  async listar(req, res) {
    try {
      const result = await pool.query(
        `SELECT id_categoria, nombre, descripcion, activo
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
  // LISTAR TODAS LAS CATEGORÍAS (INCLUYE INACTIVAS - ADMIN)
  // =====================================================
  async listarTodos(req, res) {
    try {
      const result = await pool.query(
        `SELECT c.*,
                (SELECT COUNT(*) FROM libro WHERE id_categoria = c.id_categoria AND activo = true) as total_libros
         FROM categoria_libro c
         ORDER BY c.nombre`
      );
      
      res.json({ categorias: result.rows });
    } catch (error) {
      console.error('Error listar todas categorías:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // OBTENER CATEGORÍA POR ID
  // =====================================================
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        `SELECT c.*,
                (SELECT COUNT(*) FROM libro WHERE id_categoria = c.id_categoria AND activo = true) as total_libros
         FROM categoria_libro c
         WHERE c.id_categoria = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      res.json({ categoria: result.rows[0] });
    } catch (error) {
      console.error('Error obtener categoría:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // CREAR CATEGORÍA
  // =====================================================
  async crear(req, res) {
    try {
      const { nombre, descripcion } = req.body;
      
      if (!nombre) {
        return res.status(400).json({ message: 'Nombre de la categoría es requerido' });
      }
      
      // Verificar si ya existe
      const existente = await pool.query(
        'SELECT id_categoria FROM categoria_libro WHERE nombre = $1',
        [nombre]
      );
      
      if (existente.rows.length > 0) {
        return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
      }
      
      const result = await pool.query(
        `INSERT INTO categoria_libro (nombre, descripcion)
         VALUES ($1, $2)
         RETURNING id_categoria, nombre, descripcion`,
        [nombre, descripcion || null]
      );
      
      // Registrar en bitácora
      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_nuevos)
         VALUES ($1, 'crear_categoria', 'categoria_libro', $2, $3::jsonb)`,
        [req.usuario.id_usuario, result.rows[0].id_categoria, JSON.stringify({ nombre })]
      );
      
      res.status(201).json({
        message: 'Categoría creada exitosamente',
        categoria: result.rows[0]
      });
    } catch (error) {
      console.error('Error crear categoría:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // EDITAR CATEGORÍA
  // =====================================================
  async editar(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, activo } = req.body;
      
      // Verificar que la categoría existe
      const categoriaExistente = await pool.query(
        'SELECT * FROM categoria_libro WHERE id_categoria = $1',
        [id]
      );
      
      if (categoriaExistente.rows.length === 0) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      // Verificar nombre duplicado
      if (nombre) {
        const existente = await pool.query(
          'SELECT id_categoria FROM categoria_libro WHERE nombre = $1 AND id_categoria != $2',
          [nombre, id]
        );
        if (existente.rows.length > 0) {
          return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
        }
      }
      
      const activoBool = activo !== undefined ? activo : true;
      
      const result = await pool.query(
        `UPDATE categoria_libro 
         SET nombre = $1, descripcion = $2, activo = $3
         WHERE id_categoria = $4
         RETURNING *`,
        [nombre, descripcion || null, activoBool, id]
      );
      
      // Registrar en bitácora
      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_anteriores, datos_nuevos)
         VALUES ($1, 'editar_categoria', 'categoria_libro', $2, $3::jsonb, $4::jsonb)`,
        [req.usuario.id_usuario, id, JSON.stringify(categoriaExistente.rows[0]), JSON.stringify(result.rows[0])]
      );
      
      res.json({
        message: 'Categoría actualizada exitosamente',
        categoria: result.rows[0]
      });
    } catch (error) {
      console.error('Error editar categoría:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // ELIMINAR CATEGORÍA (lógico)
  // =====================================================
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      
      const categoriaExistente = await pool.query(
        'SELECT * FROM categoria_libro WHERE id_categoria = $1',
        [id]
      );
      
      if (categoriaExistente.rows.length === 0) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      // Verificar si tiene libros asociados
      const librosAsociados = await pool.query(
        'SELECT COUNT(*) FROM libro WHERE id_categoria = $1 AND activo = true',
        [id]
      );
      
      if (parseInt(librosAsociados.rows[0].count) > 0) {
        return res.status(400).json({
          message: `No se puede eliminar la categoría porque tiene ${librosAsociados.rows[0].count} libro(s) asociados`
        });
      }
      
      await pool.query(
        'UPDATE categoria_libro SET activo = false WHERE id_categoria = $1',
        [id]
      );
      
      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_anteriores)
         VALUES ($1, 'eliminar_categoria', 'categoria_libro', $2, $3::jsonb)`,
        [req.usuario.id_usuario, id, JSON.stringify(categoriaExistente.rows[0])]
      );
      
      res.json({ message: 'Categoría eliminada exitosamente' });
    } catch (error) {
      console.error('Error eliminar categoría:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

export default new CategoriaController();