import pool from '../db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MaterialGratuitoController {
  // =====================================================
  // LISTAR MATERIAL GRATUITO (PÚBLICO - SOLO VISIBLE)
  // =====================================================
  async listar(req, res) {
    try {
      const usuario = req.usuario || {};
      
      // Si es admin o responsable, ver todos los materiales (incluyendo ocultos)
      const esAdminOResponsable = usuario.rol === 'admin' || usuario.rol === 'responsable';
      
      let query = `
        SELECT 
          mg.id_material,
          mg.titulo,
          mg.descripcion,
          mg.tipo_material,
          mg.archivo_url,
          mg.imagen_portada,
          mg.fecha_publicacion,
          mg.fecha_actualizacion,
          mg.visibilidad,
          mg.descargas,
          mg.visitas,
          mg.palabras_clave,
          mg.anio_publicacion,
          mg.editorial,
          mg.idioma,
          mg.activo,
          mg.id_autor,
          mg.id_categoria,
          CONCAT(a.nombre, ' ', a.apellido) AS autor_nombre_completo,
          a.nombre AS autor_nombre,
          a.apellido AS autor_apellido,
          c.nombre AS categoria_nombre,
          r.nombre AS repositorio_nombre,
          r.sigla AS repositorio_sigla,
          pu.nombre AS creador_nombre,
          pu.apellido_paterno AS creador_apellido
        FROM material_gratuito mg
        LEFT JOIN autor a ON mg.id_autor = a.id_autor
        LEFT JOIN categoria_libro c ON mg.id_categoria = c.id_categoria
        LEFT JOIN repositorio r ON mg.id_repositorio = r.id_repositorio
        LEFT JOIN usuario u ON mg.creado_por = u.id_usuario
        LEFT JOIN perfil_usuario pu ON u.id_usuario = pu.id_usuario
        WHERE mg.activo = true
      `;
      
      const params = [];
      
      // Si no es admin ni responsable, solo mostrar materiales visibles
      if (!esAdminOResponsable) {
        query += ` AND mg.visibilidad = true`;
      }
      
      // Si es responsable, filtrar por su repositorio
      if (usuario.rol === 'responsable' && usuario.id_repositorio_asignado) {
        query += ` AND mg.id_repositorio = $${params.length + 1}`;
        params.push(usuario.id_repositorio_asignado);
      }
      
      query += ` ORDER BY mg.fecha_publicacion DESC`;
      
      const result = await pool.query(query, params);
      
      // Para cada material, obtener los repositorios adicionales (relación N a N)
      const materialesConRepositorios = await Promise.all(
        result.rows.map(async (material) => {
          const reposResult = await pool.query(
            `SELECT 
               mr.id_repositorio,
               r.nombre,
               r.sigla,
               r.direccion,
               r.departamento
             FROM material_repositorio mr
             JOIN repositorio r ON mr.id_repositorio = r.id_repositorio
             WHERE mr.id_material = $1 AND r.activo = true`,
            [material.id_material]
          );
          
          return {
            ...material,
            repositorios_adicionales: reposResult.rows
          };
        })
      );
      
      res.json({
        materiales: materialesConRepositorios,
        total: materialesConRepositorios.length,
        rol: usuario.rol || 'publico'
      });
    } catch (error) {
      console.error('Error listar material gratuito:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // LISTAR MATERIAL GRATUITO POR REPOSITORIO
  // =====================================================
  async listarPorRepositorio(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || {};
      const esAdminOResponsable = usuario.rol === 'admin' || usuario.rol === 'responsable';
      
      let query = `
        SELECT 
          mg.id_material,
          mg.titulo,
          mg.descripcion,
          mg.tipo_material,
          mg.archivo_url,
          mg.imagen_portada,
          mg.fecha_publicacion,
          mg.fecha_actualizacion,
          mg.visibilidad,
          mg.descargas,
          mg.visitas,
          mg.palabras_clave,
          mg.anio_publicacion,
          mg.editorial,
          mg.idioma,
          mg.activo,
          CONCAT(a.nombre, ' ', a.apellido) AS autor_nombre_completo,
          c.nombre AS categoria_nombre
        FROM material_gratuito mg
        LEFT JOIN autor a ON mg.id_autor = a.id_autor
        LEFT JOIN categoria_libro c ON mg.id_categoria = c.id_categoria
        WHERE mg.activo = true
      `;
      
      const params = [];
      
      if (usuario.rol === 'responsable' && usuario.id_repositorio_asignado != id) {
        return res.status(403).json({
          message: 'No tienes permisos para ver material de este repositorio'
        });
      }
      
      // Filtrar por repositorio principal o por relación N a N
      if (esAdminOResponsable) {
        query += ` AND (mg.id_repositorio = $${params.length + 1} OR EXISTS (
          SELECT 1 FROM material_repositorio mr 
          WHERE mr.id_material = mg.id_material 
          AND mr.id_repositorio = $${params.length + 1}
        ))`;
        params.push(id);
      } else {
        query += ` AND mg.visibilidad = true AND (mg.id_repositorio = $${params.length + 1} OR EXISTS (
          SELECT 1 FROM material_repositorio mr 
          WHERE mr.id_material = mg.id_material 
          AND mr.id_repositorio = $${params.length + 1}
        ))`;
        params.push(id);
      }
      
      query += ` ORDER BY mg.fecha_publicacion DESC`;
      
      const result = await pool.query(query, params);
      
      res.json({
        materiales: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error listar material por repositorio:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // OBTENER MATERIAL POR ID
  // =====================================================
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || {};
      
      // Registrar visita
      await pool.query('SELECT registrar_visita($1)', [id]);
      
      const result = await pool.query(
        `SELECT 
           mg.id_material,
           mg.titulo,
           mg.descripcion,
           mg.tipo_material,
           mg.archivo_url,
           mg.imagen_portada,
           mg.fecha_publicacion,
           mg.fecha_actualizacion,
           mg.visibilidad,
           mg.descargas,
           mg.visitas,
           mg.palabras_clave,
           mg.anio_publicacion,
           mg.editorial,
           mg.idioma,
           mg.activo,
           mg.id_autor,
           mg.id_categoria,
           mg.id_repositorio,
           CONCAT(a.nombre, ' ', a.apellido) AS autor_nombre_completo,
           a.nombre AS autor_nombre,
           a.apellido AS autor_apellido,
           a.biografia AS autor_biografia,
           a.nacionalidad AS autor_nacionalidad,
           c.nombre AS categoria_nombre,
           c.descripcion AS categoria_descripcion,
           r.nombre AS repositorio_nombre,
           r.sigla AS repositorio_sigla,
           r.direccion AS repositorio_direccion,
           pu.nombre AS creador_nombre,
           pu.apellido_paterno AS creador_apellido
         FROM material_gratuito mg
         LEFT JOIN autor a ON mg.id_autor = a.id_autor
         LEFT JOIN categoria_libro c ON mg.id_categoria = c.id_categoria
         LEFT JOIN repositorio r ON mg.id_repositorio = r.id_repositorio
         LEFT JOIN usuario u ON mg.creado_por = u.id_usuario
         LEFT JOIN perfil_usuario pu ON u.id_usuario = pu.id_usuario
         WHERE mg.id_material = $1 AND mg.activo = true`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Material no encontrado' });
      }
      
      const material = result.rows[0];
      
      // Verificar visibilidad para usuarios no autenticados o no admin
      if (!material.visibilidad) {
        const esAdminOResponsable = usuario.rol === 'admin' || usuario.rol === 'responsable';
        if (!esAdminOResponsable) {
          return res.status(403).json({ message: 'Material no disponible' });
        }
      }
      
      // Obtener repositorios adicionales
      const reposResult = await pool.query(
        `SELECT 
           mr.id_repositorio,
           r.nombre,
           r.sigla,
           r.direccion,
           r.departamento
         FROM material_repositorio mr
         JOIN repositorio r ON mr.id_repositorio = r.id_repositorio
         WHERE mr.id_material = $1 AND r.activo = true`,
        [id]
      );
      
      material.repositorios_adicionales = reposResult.rows;
      
      res.json({ material });
    } catch (error) {
      console.error('Error obtener material:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // OBTENER AUTORES (REUTILIZAR TABLA EXISTENTE)
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
  // OBTENER CATEGORÍAS (REUTILIZAR TABLA EXISTENTE)
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
        `SELECT id_repositorio, nombre, sigla, direccion, departamento
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
  // CREAR MATERIAL GRATUITO
  // =====================================================
  async crear(req, res) {
    try {
      const {
        titulo,
        descripcion,
        tipo_material,
        id_autor,
        id_categoria,
        id_repositorio,
        anio_publicacion,
        editorial,
        idioma,
        palabras_clave,
        visibilidad,
        repositorios_adicionales
      } = req.body;

      const usuario = req.usuario || {};

      console.log('📦 Body recibido:', req.body);
      console.log('📁 Files recibidos:', req.files);

      if (!titulo || !tipo_material || !id_repositorio) {
        return res.status(400).json({
          message: 'Título, tipo de material y repositorio son requeridos'
        });
      }

      // Verificar permisos para responsable
      if (usuario.rol === 'responsable' && parseInt(id_repositorio) !== parseInt(usuario.id_repositorio_asignado)) {
        return res.status(403).json({
          message: 'Solo puedes agregar material a tu repositorio asignado'
        });
      }

      // Manejar archivo subido
      let archivo_url = null;
      let imagen_portada = null;

      if (req.files) {
        if (req.files.archivo && req.files.archivo[0]) {
          const file = req.files.archivo[0];
          archivo_url = `/uploads/material/${path.basename(file.path)}`;
          console.log('✅ Archivo guardado en:', archivo_url);
        }
        
        if (req.files.portada && req.files.portada[0]) {
          const file = req.files.portada[0];
          imagen_portada = `/uploads/material/${path.basename(file.path)}`;
          console.log('✅ Portada guardada en:', imagen_portada);
        }
      }

      if (!archivo_url) {
        return res.status(400).json({ message: 'Debe subir un archivo' });
      }

      const visibilidadBool = visibilidad === 'true' || visibilidad === true;

      // Insertar material
      const result = await pool.query(
        `INSERT INTO material_gratuito 
         (titulo, descripcion, tipo_material, archivo_url, imagen_portada, 
          id_autor, id_categoria, id_repositorio, creado_por, 
          anio_publicacion, editorial, idioma, palabras_clave, visibilidad)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING id_material`,
        [
          titulo,
          descripcion || null,
          tipo_material,
          archivo_url,
          imagen_portada,
          id_autor || null,
          id_categoria || null,
          id_repositorio,
          usuario.id_usuario || null,
          anio_publicacion || null,
          editorial || null,
          idioma || 'es',
          palabras_clave || null,
          visibilidadBool
        ]
      );

      const id_material = result.rows[0].id_material;

      // Agregar repositorios adicionales (relación N a N)
      if (repositorios_adicionales) {
        let reposList = repositorios_adicionales;
        if (typeof reposList === 'string') {
          try {
            reposList = JSON.parse(reposList);
          } catch (e) {
            console.error('Error parsing repositorios_adicionales:', e);
          }
        }
        
        if (Array.isArray(reposList) && reposList.length > 0) {
          for (const repoId of reposList) {
            // Verificar que el repositorio existe
            const repoCheck = await pool.query(
              'SELECT id_repositorio FROM repositorio WHERE id_repositorio = $1 AND activo = true',
              [repoId]
            );
            if (repoCheck.rows.length > 0) {
              await pool.query(
                `INSERT INTO material_repositorio (id_material, id_repositorio)
                 VALUES ($1, $2)`,
                [id_material, repoId]
              );
            }
          }
        }
      }

      // Registrar en bitácora
      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_nuevos)
         VALUES ($1, 'crear_material', 'material_gratuito', $2, $3::jsonb)`,
        [usuario.id_usuario || null, id_material, JSON.stringify({ titulo, tipo_material })]
      );

      res.status(201).json({
        message: 'Material creado exitosamente',
        id_material: id_material,
        archivo: archivo_url,
        portada: imagen_portada
      });
    } catch (error) {
      console.error('Error crear material:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // EDITAR MATERIAL GRATUITO
  // =====================================================
  async editar(req, res) {
    try {
      const { id } = req.params;
      const {
        titulo,
        descripcion,
        tipo_material,
        id_autor,
        id_categoria,
        id_repositorio,
        anio_publicacion,
        editorial,
        idioma,
        palabras_clave,
        visibilidad,
        archivo_actual,
        portada_actual,
        repositorios_adicionales
      } = req.body;

      const usuario = req.usuario || {};

      // Verificar que el material existe
      const materialExistente = await pool.query(
        'SELECT * FROM material_gratuito WHERE id_material = $1',
        [id]
      );

      if (materialExistente.rows.length === 0) {
        return res.status(404).json({ message: 'Material no encontrado' });
      }

      // Verificar permisos para responsable
      if (usuario.rol === 'responsable') {
        const repositorioId = materialExistente.rows[0].id_repositorio;
        if (parseInt(repositorioId) !== parseInt(usuario.id_repositorio_asignado)) {
          return res.status(403).json({
            message: 'Solo puedes editar material de tu repositorio asignado'
          });
        }
      }

      // Manejar archivos
      let archivo_url = archivo_actual || materialExistente.rows[0].archivo_url;
      let imagen_portada = portada_actual || materialExistente.rows[0].imagen_portada;

      if (req.files) {
        if (req.files.archivo && req.files.archivo[0]) {
          // Eliminar archivo anterior
          if (archivo_actual && archivo_actual.startsWith('/uploads')) {
            const oldPath = path.join(__dirname, '../..', archivo_actual);
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
              console.log('🗑️ Archivo anterior eliminado:', oldPath);
            }
          }
          const file = req.files.archivo[0];
          archivo_url = `/uploads/material/${path.basename(file.path)}`;
          console.log('✅ Nuevo archivo guardado:', archivo_url);
        }
        
        if (req.files.portada && req.files.portada[0]) {
          if (portada_actual && portada_actual.startsWith('/uploads')) {
            const oldPath = path.join(__dirname, '../..', portada_actual);
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
              console.log('🗑️ Portada anterior eliminada:', oldPath);
            }
          }
          const file = req.files.portada[0];
          imagen_portada = `/uploads/material/${path.basename(file.path)}`;
          console.log('✅ Nueva portada guardada:', imagen_portada);
        }
      }

      const visibilidadBool = visibilidad === 'true' || visibilidad === true;

      // Actualizar material
      await pool.query(
        `UPDATE material_gratuito 
         SET titulo = $1, descripcion = $2, tipo_material = $3, 
             archivo_url = $4, imagen_portada = $5, 
             id_autor = $6, id_categoria = $7, id_repositorio = $8,
             anio_publicacion = $9, editorial = $10, idioma = $11, 
             palabras_clave = $12, visibilidad = $13
         WHERE id_material = $14`,
        [
          titulo,
          descripcion || null,
          tipo_material,
          archivo_url,
          imagen_portada,
          id_autor || null,
          id_categoria || null,
          id_repositorio,
          anio_publicacion || null,
          editorial || null,
          idioma || 'es',
          palabras_clave || null,
          visibilidadBool,
          id
        ]
      );

      // Actualizar repositorios adicionales
      await pool.query('DELETE FROM material_repositorio WHERE id_material = $1', [id]);

      if (repositorios_adicionales) {
        let reposList = repositorios_adicionales;
        if (typeof reposList === 'string') {
          try {
            reposList = JSON.parse(reposList);
          } catch (e) {
            console.error('Error parsing repositorios_adicionales:', e);
          }
        }
        
        if (Array.isArray(reposList) && reposList.length > 0) {
          for (const repoId of reposList) {
            const repoCheck = await pool.query(
              'SELECT id_repositorio FROM repositorio WHERE id_repositorio = $1 AND activo = true',
              [repoId]
            );
            if (repoCheck.rows.length > 0) {
              await pool.query(
                `INSERT INTO material_repositorio (id_material, id_repositorio)
                 VALUES ($1, $2)`,
                [id, repoId]
              );
            }
          }
        }
      }

      // Registrar en bitácora
      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_anteriores, datos_nuevos)
         VALUES ($1, 'editar_material', 'material_gratuito', $2, $3::jsonb, $4::jsonb)`,
        [
          usuario.id_usuario || null,
          id,
          JSON.stringify(materialExistente.rows[0]),
          JSON.stringify({ titulo, tipo_material })
        ]
      );

      res.json({
        message: 'Material actualizado exitosamente',
        archivo: archivo_url,
        portada: imagen_portada
      });
    } catch (error) {
      console.error('Error editar material:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // ELIMINAR MATERIAL (LÓGICO)
  // =====================================================
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || {};

      const materialExistente = await pool.query(
        'SELECT * FROM material_gratuito WHERE id_material = $1',
        [id]
      );

      if (materialExistente.rows.length === 0) {
        return res.status(404).json({ message: 'Material no encontrado' });
      }

      // Verificar permisos para responsable
      if (usuario.rol === 'responsable') {
        const repositorioId = materialExistente.rows[0].id_repositorio;
        if (parseInt(repositorioId) !== parseInt(usuario.id_repositorio_asignado)) {
          return res.status(403).json({
            message: 'Solo puedes eliminar material de tu repositorio asignado'
          });
        }
      }

      await pool.query(
        'UPDATE material_gratuito SET activo = false WHERE id_material = $1',
        [id]
      );

      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_anteriores)
         VALUES ($1, 'eliminar_material', 'material_gratuito', $2, $3::jsonb)`,
        [usuario.id_usuario || null, id, JSON.stringify(materialExistente.rows[0])]
      );

      res.json({ message: 'Material eliminado exitosamente' });
    } catch (error) {
      console.error('Error eliminar material:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // REGISTRAR DESCARGA
  // =====================================================
  async registrarDescarga(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || {};
      const ip = req.ip || req.connection.remoteAddress || '0.0.0.0';
      const userAgent = req.headers['user-agent'] || '';

      // Verificar que el material existe
      const materialExistente = await pool.query(
        'SELECT id_material, archivo_url FROM material_gratuito WHERE id_material = $1 AND activo = true',
        [id]
      );

      if (materialExistente.rows.length === 0) {
        return res.status(404).json({ message: 'Material no encontrado' });
      }

      // Verificar visibilidad
      const material = materialExistente.rows[0];
      const visibilidadResult = await pool.query(
        'SELECT visibilidad FROM material_gratuito WHERE id_material = $1',
        [id]
      );
      
      if (!visibilidadResult.rows[0].visibilidad) {
        const esAdminOResponsable = usuario.rol === 'admin' || usuario.rol === 'responsable';
        if (!esAdminOResponsable) {
          return res.status(403).json({ message: 'Material no disponible para descarga' });
        }
      }

      // Registrar descarga usando la función
      await pool.query(
        'SELECT registrar_descarga($1, $2, $3, $4)',
        [id, usuario.id_usuario || null, ip, userAgent]
      );

      res.json({
        message: 'Descarga registrada exitosamente',
        archivo_url: material.archivo_url
      });
    } catch (error) {
      console.error('Error registrar descarga:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // OBTENER URL DE DESCARGA DIRECTA
  // =====================================================
  async obtenerUrlDescarga(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || {};

      const result = await pool.query(
        'SELECT archivo_url, visibilidad FROM material_gratuito WHERE id_material = $1 AND activo = true',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Material no encontrado' });
      }

      const material = result.rows[0];

      if (!material.visibilidad) {
        const esAdminOResponsable = usuario.rol === 'admin' || usuario.rol === 'responsable';
        if (!esAdminOResponsable) {
          return res.status(403).json({ message: 'Material no disponible' });
        }
      }

      res.json({
        archivo_url: material.archivo_url
      });
    } catch (error) {
      console.error('Error obtener URL descarga:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

export default new MaterialGratuitoController();