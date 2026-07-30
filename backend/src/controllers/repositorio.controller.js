import pool from '../db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RepositorioController {
  // =====================================================
  // LISTAR REPOSITORIOS ACTIVOS (PÚBLICO)
  // =====================================================
  async listar(req, res) {
    try {
      const result = await pool.query(
        `SELECT r.*, 
                u.username as admin_creador,
                pu.nombre as admin_nombre,
                (SELECT COUNT(*) FROM repositorio_responsable rr 
                 WHERE rr.id_repositorio = r.id_repositorio AND rr.activo = true) as numero_responsables
         FROM repositorio r
         LEFT JOIN usuario u ON r.id_admin_creador = u.id_usuario
         LEFT JOIN perfil_usuario pu ON u.id_usuario = pu.id_usuario
         WHERE r.activo = true
         ORDER BY r.nombre ASC`
      );
      
      res.json({ repositorios: result.rows });
    } catch (error) {
      console.error('Error listar repositorios:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // LISTAR TODOS LOS REPOSITORIOS (ADMIN)
  // =====================================================
  async listarTodos(req, res) {
    try {
      const result = await pool.query(
        `SELECT r.*, 
                u.username as admin_creador,
                pu.nombre as admin_nombre,
                (SELECT COUNT(*) FROM repositorio_responsable rr 
                 WHERE rr.id_repositorio = r.id_repositorio AND rr.activo = true) as numero_responsables
         FROM repositorio r
         LEFT JOIN usuario u ON r.id_admin_creador = u.id_usuario
         LEFT JOIN perfil_usuario pu ON u.id_usuario = pu.id_usuario
         ORDER BY r.nombre ASC`
      );
      
      res.json({ repositorios: result.rows });
    } catch (error) {
      console.error('Error listar todos repositorios:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // OBTENER REPOSITORIO POR ID
  // =====================================================
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT r.*, 
                u.username as admin_creador,
                pu.nombre as admin_nombre,
                COALESCE(
                  json_agg(DISTINCT jsonb_build_object(
                    'id_usuario', rr.id_responsable,
                    'nombre', rpu.nombre,
                    'apellido_paterno', rpu.apellido_paterno,
                    'apellido_materno', rpu.apellido_materno,
                    'cargo', rpu.cargo,
                    'fecha_asignacion', rr.fecha_asignacion
                  )) FILTER (WHERE rr.id_responsable IS NOT NULL),
                  '[]'
                ) as responsables
         FROM repositorio r
         LEFT JOIN usuario u ON r.id_admin_creador = u.id_usuario
         LEFT JOIN perfil_usuario pu ON u.id_usuario = pu.id_usuario
         LEFT JOIN repositorio_responsable rr ON r.id_repositorio = rr.id_repositorio AND rr.activo = true
         LEFT JOIN perfil_usuario rpu ON rr.id_responsable = rpu.id_usuario
         WHERE r.id_repositorio = $1
         GROUP BY r.id_repositorio, u.username, pu.nombre`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Repositorio no encontrado' });
      }

      res.json({ repositorio: result.rows[0] });
    } catch (error) {
      console.error('Error obtener repositorio:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // CREAR REPOSITORIO (ADMIN)
  // =====================================================
  async crear(req, res) {
    try {
      const { 
        nombre, 
        sigla, 
        direccion, 
        telefono, 
        horario_atencion, 
        departamento, 
        ubicacion_gps
      } = req.body;

      // Validar campos requeridos
      if (!nombre || !direccion) {
        return res.status(400).json({ message: 'Nombre y dirección son requeridos' });
      }

      // Verificar si la sigla ya existe
      if (sigla) {
        const existente = await pool.query(
          'SELECT id_repositorio FROM repositorio WHERE sigla = $1',
          [sigla]
        );
        if (existente.rows.length > 0) {
          return res.status(400).json({ message: 'La sigla ya está en uso' });
        }
      }

      // Manejar archivos subidos - MULTER YA GUARDA LOS ARCHIVOS AUTOMÁTICAMENTE
      let portada_url = null;
      let logo_url = null;

      if (req.files) {
        if (req.files.portada && req.files.portada[0]) {
          const portada = req.files.portada[0];
          portada_url = `/uploads/repositorios/${path.basename(portada.path)}`;
          console.log('✅ Portada guardada en:', portada_url);
        }
        
        if (req.files.logo && req.files.logo[0]) {
          const logo = req.files.logo[0];
          logo_url = `/uploads/repositorios/${path.basename(logo.path)}`;
          console.log('✅ Logo guardado en:', logo_url);
        }
      }

      const result = await pool.query(
        `INSERT INTO repositorio 
         (nombre, sigla, direccion, telefono, horario_atencion, departamento, 
          ubicacion_gps, portada_representativa, logo_repositorio, id_admin_creador) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id_repositorio, nombre, fecha_creacion`,
        [
          nombre, 
          sigla || null, 
          direccion, 
          telefono || null, 
          horario_atencion || null, 
          departamento || null, 
          ubicacion_gps || null, 
          portada_url, 
          logo_url,
          req.usuario.id_usuario
        ]
      );

      const repositorio = result.rows[0];

      // Registrar en bitácora
      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_nuevos)
         VALUES ($1, 'crear_repositorio', 'repositorio', $2, $3::jsonb)`,
        [
          req.usuario.id_usuario,
          repositorio.id_repositorio,
          JSON.stringify({ nombre, sigla, departamento })
        ]
      );

      res.status(201).json({
        message: 'Repositorio creado exitosamente',
        id_repositorio: repositorio.id_repositorio,
        portada: portada_url,
        logo: logo_url
      });
    } catch (error) {
      console.error('Error crear repositorio:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // EDITAR REPOSITORIO (ADMIN)
  // =====================================================
  async editar(req, res) {
    try {
      const { id } = req.params;
      const { 
        nombre, 
        sigla, 
        direccion, 
        telefono, 
        horario_atencion, 
        departamento, 
        ubicacion_gps,
        activo,
        portada_actual,
        logo_actual
      } = req.body;

      // Verificar que el repositorio existe
      const repositorioExistente = await pool.query(
        'SELECT * FROM repositorio WHERE id_repositorio = $1',
        [id]
      );
      
      if (repositorioExistente.rows.length === 0) {
        return res.status(404).json({ message: 'Repositorio no encontrado' });
      }

      // Verificar si la sigla ya existe (excluyendo el actual)
      if (sigla) {
        const existente = await pool.query(
          'SELECT id_repositorio FROM repositorio WHERE sigla = $1 AND id_repositorio != $2',
          [sigla, id]
        );
        if (existente.rows.length > 0) {
          return res.status(400).json({ message: 'La sigla ya está en uso' });
        }
      }

      // Manejar archivos subidos
      let portada_url = portada_actual || null;
      let logo_url = logo_actual || null;

      if (req.files) {
        if (req.files.portada && req.files.portada[0]) {
          // Eliminar portada anterior si existe
          if (portada_actual && portada_actual.startsWith('/uploads')) {
            const oldPath = path.join(__dirname, '../..', portada_actual);
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
              console.log('🗑️ Portada anterior eliminada:', oldPath);
            }
          }
          const portada = req.files.portada[0];
          portada_url = `/uploads/repositorios/${path.basename(portada.path)}`;
          console.log('✅ Nueva portada guardada:', portada_url);
        }
        
        if (req.files.logo && req.files.logo[0]) {
          // Eliminar logo anterior si existe
          if (logo_actual && logo_actual.startsWith('/uploads')) {
            const oldPath = path.join(__dirname, '../..', logo_actual);
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
              console.log('🗑️ Logo anterior eliminado:', oldPath);
            }
          }
          const logo = req.files.logo[0];
          logo_url = `/uploads/repositorios/${path.basename(logo.path)}`;
          console.log('✅ Nuevo logo guardado:', logo_url);
        }
      }

      // Convertir activo a booleano
      const activoBool = activo === 'true' || activo === true;

      const result = await pool.query(
        `UPDATE repositorio 
         SET nombre = $1, sigla = $2, direccion = $3, telefono = $4, 
             horario_atencion = $5, departamento = $6, ubicacion_gps = $7,
             portada_representativa = $8, logo_repositorio = $9, activo = $10
         WHERE id_repositorio = $11
         RETURNING *`,
        [
          nombre, 
          sigla || null, 
          direccion, 
          telefono || null, 
          horario_atencion || null,
          departamento || null, 
          ubicacion_gps || null, 
          portada_url, 
          logo_url, 
          activoBool,
          id
        ]
      );

      // Registrar en bitácora
      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_anteriores, datos_nuevos)
         VALUES ($1, 'editar_repositorio', 'repositorio', $2, $3::jsonb, $4::jsonb)`,
        [
          req.usuario.id_usuario,
          id,
          JSON.stringify(repositorioExistente.rows[0]),
          JSON.stringify(result.rows[0])
        ]
      );

      res.json({
        message: 'Repositorio actualizado exitosamente',
        portada: portada_url,
        logo: logo_url
      });
    } catch (error) {
      console.error('Error editar repositorio:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // ELIMINAR REPOSITORIO (LÓGICO)
  // =====================================================
  async eliminar(req, res) {
    try {
      const { id } = req.params;

      const repositorio = await pool.query(
        'SELECT id_repositorio, activo FROM repositorio WHERE id_repositorio = $1',
        [id]
      );
      
      if (repositorio.rows.length === 0) {
        return res.status(404).json({ message: 'Repositorio no encontrado' });
      }

      if (!repositorio.rows[0].activo) {
        return res.status(400).json({ message: 'El repositorio ya está inactivo' });
      }

      await pool.query(
        'UPDATE repositorio SET activo = false WHERE id_repositorio = $1',
        [id]
      );

      // Registrar en bitácora
      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_anteriores)
         VALUES ($1, 'eliminar_repositorio', 'repositorio', $2, $3::jsonb)`,
        [
          req.usuario.id_usuario,
          id,
          JSON.stringify({ activo: false })
        ]
      );

      res.json({ message: 'Repositorio eliminado exitosamente' });
    } catch (error) {
      console.error('Error eliminar repositorio:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // ELIMINAR REPOSITORIO FÍSICAMENTE (SOLO ADMIN)
  // =====================================================
  async eliminarFisico(req, res) {
    try {
      const { id } = req.params;

      // Verificar que el repositorio existe
      const repositorio = await pool.query(
        'SELECT * FROM repositorio WHERE id_repositorio = $1',
        [id]
      );
      
      if (repositorio.rows.length === 0) {
        return res.status(404).json({ message: 'Repositorio no encontrado' });
      }

      // Verificar si tiene responsables activos
      const responsables = await pool.query(
        'SELECT id_responsable FROM repositorio_responsable WHERE id_repositorio = $1 AND activo = true',
        [id]
      );
      
      if (responsables.rows.length > 0) {
        return res.status(400).json({
          message: 'No se puede eliminar el repositorio porque tiene responsables asociados'
        });
      }

      // Verificar si tiene productos disponibles
      const productos = await pool.query(
        'SELECT id_disponibilidad FROM disponibilidad_producto WHERE id_repositorio = $1 AND stock > 0',
        [id]
      );
      
      if (productos.rows.length > 0) {
        return res.status(400).json({
          message: 'No se puede eliminar el repositorio porque tiene productos con stock'
        });
      }

      // Eliminar repositorio
      await pool.query('DELETE FROM repositorio WHERE id_repositorio = $1', [id]);

      // Registrar en bitácora
      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_anteriores)
         VALUES ($1, 'eliminar_repositorio_fisico', 'repositorio', $2, $3::jsonb)`,
        [
          req.usuario.id_usuario,
          id,
          JSON.stringify(repositorio.rows[0])
        ]
      );

      res.json({ message: 'Repositorio eliminado físicamente' });
    } catch (error) {
      console.error('Error eliminar repositorio físico:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

export default new RepositorioController();