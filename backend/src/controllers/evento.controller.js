import db from "../db.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EventoController {
// =====================================================
// LISTAR EVENTOS CON SUS REALIZACIONES
// =====================================================
async listar(req, res) {
  try {
    const usuario = req.usuario || {};
    const { rol, id_repositorio_asignado } = usuario;
    
    let eventosQuery = `
      SELECT e.*
      FROM evento_cultural e
      WHERE e.estado = 'activo'
    `;
    
    const params = [];
    
    // Si es responsable, filtrar por sus eventos disponibles
    if (rol === 'responsable' && id_repositorio_asignado) {
      eventosQuery += ` AND EXISTS (
        SELECT 1 FROM realizacion_evento re 
        WHERE re.id_evento = e.id_evento 
        AND re.id_repositorio = ?
      )`;
      params.push(id_repositorio_asignado);
    }
    
    eventosQuery += ` ORDER BY e.fecha_creacion DESC`;
    
    const [eventos] = await db.query(eventosQuery, params);
    
    // Para cada evento, obtener sus realizaciones
    const eventosConRealizaciones = await Promise.all(
      eventos.map(async (evento) => {
        const [realizaciones] = await db.query(
          `SELECT 
             re.id_realizacion,
             re.id_repositorio,
             re.fecha,
             re.hora_inicio,
             re.hora_fin,
             re.ubicacion_especifica,
             re.ubicacion_gps,
             re.cupos_disponibles,
             re.estado as estado_realizacion,
             r.nombre as repositorio_nombre,
             r.sigla as repositorio_sigla,
             r.direccion as repositorio_direccion,
             r.ubicacion_gps as repositorio_ubicacion_gps,
             r.departamento as repositorio_departamento
           FROM realizacion_evento re
           JOIN repositorio r ON re.id_repositorio = r.id_repositorio
           WHERE re.id_evento = ? AND r.estado = 'activo'
           ORDER BY re.fecha ASC, re.hora_inicio ASC`,
          [evento.id_evento]
        );
        
        return {
          ...evento,
          realizaciones: realizaciones
        };
      })
    );
    
    res.json({ 
      eventos: eventosConRealizaciones,
      total: eventosConRealizaciones.length,
      rol: rol || 'publico'
    });
  } catch (error) {
    console.error("Error listar eventos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}


// =====================================================
// LISTAR EVENTOS POR REPOSITORIO
// =====================================================
async listarPorRepositorio(req, res) {
  try {
    const { id } = req.params;
    const usuario = req.usuario || {};
    const { rol, id_repositorio_asignado } = usuario;
    
    // Verificar permisos solo si es responsable
    if (rol === 'responsable' && id_repositorio_asignado != id) {
      return res.status(403).json({ 
        message: "No tienes permisos para ver eventos de este repositorio" 
      });
    }
    
    const [rows] = await db.query(
      `SELECT e.*, 
              re.id_realizacion,
              re.fecha,
              re.hora_inicio,
              re.hora_fin,
              re.ubicacion_especifica,
              re.ubicacion_gps,
              re.cupos_disponibles,
              re.estado as estado_realizacion
       FROM evento_cultural e
       LEFT JOIN realizacion_evento re ON e.id_evento = re.id_evento
       WHERE re.id_repositorio = ? AND e.estado = 'activo'
       ORDER BY re.fecha ASC, re.hora_inicio ASC`,
      [id]
    );
    
    res.json({ eventos: rows });
  } catch (error) {
    console.error("Error listar eventos por repositorio:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}


// =====================================================
// OBTENER EVENTO POR ID CON SUS REALIZACIONES
// =====================================================
async obtenerPorId(req, res) {
  try {
    const { id } = req.params;
    const usuario = req.usuario || {};
    const { rol, id_repositorio_asignado } = usuario;
    
    const [eventos] = await db.query(
      `SELECT e.*
       FROM evento_cultural e
       WHERE e.id_evento = ? AND e.estado = 'activo'`,
      [id]
    );
    
    if (!eventos.length) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    
    const evento = eventos[0];
    
    // Obtener realizaciones
    const [realizaciones] = await db.query(
      `SELECT 
         re.id_realizacion,
         re.id_repositorio,
         re.fecha,
         re.hora_inicio,
         re.hora_fin,
         re.ubicacion_especifica,
         re.ubicacion_gps,
         re.cupos_disponibles,
         re.estado as estado_realizacion,
         r.nombre as repositorio_nombre,
         r.sigla as repositorio_sigla,
         r.direccion as repositorio_direccion,
         r.ubicacion_gps as repositorio_ubicacion_gps,
         r.departamento as repositorio_departamento
       FROM realizacion_evento re
       JOIN repositorio r ON re.id_repositorio = r.id_repositorio
       WHERE re.id_evento = ? AND r.estado = 'activo'
       ORDER BY re.fecha ASC, re.hora_inicio ASC`,
      [id]
    );
    
    evento.realizaciones = realizaciones;
    
    // Verificar permisos solo si es responsable
    if (rol === 'responsable') {
      const tienePermiso = evento.realizaciones.some(
        r => r.id_repositorio === id_repositorio_asignado
      );
      if (!tienePermiso) {
        return res.status(403).json({ 
          message: "No tienes permisos para ver este evento" 
        });
      }
    }
    
    res.json({ evento });
  } catch (error) {
    console.error("Error obtener evento:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

  // =====================================================
  // CREAR EVENTO CON MÚLTIPLES REALIZACIONES
  // =====================================================
  async crear(req, res) {
    try {
      const { 
        titulo,
        descripcion,
        tipo_evento,
        costo,
        requiere_inscripcion,
        cupo_maximo,
        realizaciones
      } = req.body;
      
      const { rol, id_repositorio_asignado } = req.usuario;
      
      console.log('📦 Body recibido:', req.body);
      console.log('📁 File recibido:', req.file);
      
      // Validar campos requeridos
      if (!titulo || !descripcion) {
        return res.status(400).json({ 
          message: "Título y descripción son requeridos" 
        });
      }
      
      // Parsear realizaciones si viene como string
      let realizacionesList = realizaciones;
      if (typeof realizaciones === 'string') {
        try {
          realizacionesList = JSON.parse(realizaciones);
        } catch (e) {
          console.error('Error parsing realizaciones:', e);
          return res.status(400).json({ 
            message: "Formato de realizaciones inválido" 
          });
        }
      }
      
      if (!realizacionesList || !realizacionesList.length) {
        return res.status(400).json({ 
          message: "Debe seleccionar al menos una fecha de realización" 
        });
      }
      
      // Verificar permisos para responsable
      if (rol === 'responsable') {
        const tienePermiso = realizacionesList.some(
          r => parseInt(r.id_repositorio) === parseInt(id_repositorio_asignado)
        );
        if (!tienePermiso) {
          return res.status(403).json({ 
            message: "Solo puedes agregar eventos a tu repositorio asignado" 
          });
        }
      }
      
      // Verificar que los repositorios existen
      for (const realizacion of realizacionesList) {
        const [repositorio] = await db.query(
          "SELECT id_repositorio FROM repositorio WHERE id_repositorio = ?",
          [realizacion.id_repositorio]
        );
        if (!repositorio.length) {
          return res.status(404).json({ 
            message: `Repositorio ${realizacion.id_repositorio} no encontrado` 
          });
        }
      }
      
      // Manejar imagen
      let imagen_portada = null;
      if (req.file) {
        imagen_portada = `/uploads/eventos/${path.basename(req.file.path)}`;
        console.log('✅ Imagen guardada en:', imagen_portada);
      }
      
      // Insertar evento
      const [result] = await db.query(
        `INSERT INTO evento_cultural 
         (titulo, descripcion, tipo_evento, costo, imagen_portada, 
          requiere_inscripcion, cupo_maximo, estado) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'activo')`,
        [titulo, descripcion, tipo_evento || null, costo || 0, imagen_portada,
         requiere_inscripcion === 'true' || requiere_inscripcion === true ? 1 : 0, 
         cupo_maximo || 0]
      );
      
      const id_evento = result.insertId;
      
      // Crear realizaciones con ubicacion_gps
      for (const realizacion of realizacionesList) {
        await db.query(
          `INSERT INTO realizacion_evento 
           (id_evento, id_repositorio, fecha, hora_inicio, hora_fin, 
            ubicacion_especifica, ubicacion_gps, cupos_disponibles, estado) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'programado')`,
          [id_evento, realizacion.id_repositorio, realizacion.fecha, 
           realizacion.hora_inicio, realizacion.hora_fin, 
           realizacion.ubicacion_especifica || null,
           realizacion.ubicacion_gps || null,
           realizacion.cupos_disponibles || 0]
        );
      }
      
      res.status(201).json({ 
        message: "Evento creado exitosamente",
        id_evento: id_evento,
        imagen: imagen_portada
      });
    } catch (error) {
      console.error("Error crear evento:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  // =====================================================
  // EDITAR EVENTO - Actualizar realizaciones
  // =====================================================
  async editar(req, res) {
    try {
      const { id } = req.params;
      const { 
        titulo,
        descripcion,
        tipo_evento,
        costo,
        requiere_inscripcion,
        cupo_maximo,
        realizaciones,
        imagen_actual
      } = req.body;
      
      const { rol, id_repositorio_asignado } = req.usuario;
      
      console.log('📦 Body recibido editar:', req.body);
      console.log('📁 File recibido editar:', req.file);
      
      // Verificar que el evento existe
      const [evento] = await db.query(
        "SELECT id_evento FROM evento_cultural WHERE id_evento = ?",
        [id]
      );
      
      if (!evento.length) {
        return res.status(404).json({ message: "Evento no encontrado" });
      }
      
      // Parsear realizaciones
      let realizacionesList = realizaciones;
      if (typeof realizaciones === 'string') {
        try {
          realizacionesList = JSON.parse(realizaciones);
        } catch (e) {
          console.error('Error parsing realizaciones:', e);
          return res.status(400).json({ 
            message: "Formato de realizaciones inválido" 
          });
        }
      }
      
      // Verificar permisos para responsable
      if (rol === 'responsable') {
        const tienePermiso = realizacionesList.some(
          r => parseInt(r.id_repositorio) === parseInt(id_repositorio_asignado)
        );
        if (!tienePermiso) {
          return res.status(403).json({ 
            message: "Solo puedes editar eventos de tu repositorio asignado" 
          });
        }
      }
      
      // Manejar imagen
      let imagen_portada = imagen_actual || null;
      
      if (req.file) {
        if (imagen_actual && imagen_actual.startsWith('/uploads')) {
          const oldPath = path.join(__dirname, "../..", imagen_actual);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
            console.log('🗑️ Imagen anterior eliminada:', oldPath);
          }
        }
        imagen_portada = `/uploads/eventos/${path.basename(req.file.path)}`;
        console.log('✅ Nueva imagen guardada:', imagen_portada);
      }
      
      // Actualizar evento
      await db.query(
        `UPDATE evento_cultural 
         SET titulo = ?, descripcion = ?, tipo_evento = ?, costo = ?,
             imagen_portada = ?, requiere_inscripcion = ?, cupo_maximo = ?
         WHERE id_evento = ?`,
        [titulo, descripcion, tipo_evento || null, costo || 0,
         imagen_portada, requiere_inscripcion === 'true' || requiere_inscripcion === true ? 1 : 0,
         cupo_maximo || 0, id]
      );
      
      // Eliminar realizaciones existentes
      await db.query(
        "DELETE FROM realizacion_evento WHERE id_evento = ?",
        [id]
      );
      
      // Crear nuevas realizaciones con ubicacion_gps
      for (const realizacion of realizacionesList) {
        await db.query(
          `INSERT INTO realizacion_evento 
           (id_evento, id_repositorio, fecha, hora_inicio, hora_fin, 
            ubicacion_especifica, ubicacion_gps, cupos_disponibles, estado) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'programado')`,
          [id, realizacion.id_repositorio, realizacion.fecha, 
           realizacion.hora_inicio, realizacion.hora_fin, 
           realizacion.ubicacion_especifica || null,
           realizacion.ubicacion_gps || null,
           realizacion.cupos_disponibles || 0]
        );
      }
      
      res.json({ 
        message: "Evento actualizado exitosamente",
        imagen: imagen_portada
      });
    } catch (error) {
      console.error("Error editar evento:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  // =====================================================
  // ELIMINAR EVENTO (lógico)
  // =====================================================
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const { rol, id_repositorio_asignado } = req.usuario;
      
      // Verificar que el evento existe y obtener sus realizaciones
      const [realizaciones] = await db.query(
        `SELECT re.id_repositorio
         FROM realizacion_evento re
         WHERE re.id_evento = ?`,
        [id]
      );
      
      const [evento] = await db.query(
        "SELECT id_evento FROM evento_cultural WHERE id_evento = ?",
        [id]
      );
      
      if (!evento.length) {
        return res.status(404).json({ message: "Evento no encontrado" });
      }
      
      const repositoriosIds = realizaciones.map(r => r.id_repositorio);
      
      // Verificar permisos para responsable
      if (rol === 'responsable') {
        if (!repositoriosIds.includes(id_repositorio_asignado)) {
          return res.status(403).json({ 
            message: "No tienes permisos para eliminar este evento" 
          });
        }
      }
      
      // Eliminación lógica
      await db.query(
        "UPDATE evento_cultural SET estado = 'inactivo' WHERE id_evento = ?",
        [id]
      );
      
      res.json({ message: "Evento eliminado exitosamente" });
    } catch (error) {
      console.error("Error eliminar evento:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

// =====================================================
// LISTAR REPOSITORIOS DISPONIBLES PARA EVENTOS
// =====================================================
async listarRepositoriosDisponibles(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT id_repositorio, nombre, sigla, direccion, ubicacion_gps, departamento
       FROM repositorio 
       WHERE estado = 'activo'
       ORDER BY nombre`
    );
    res.json({ repositorios: rows });
  } catch (error) {
    console.error("Error listarRepositoriosDisponibles:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}
  // =====================================================
  // ACTUALIZAR ESTADO DE REALIZACIÓN (solo admin)
  // =====================================================
  async actualizarEstadoRealizacion(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      if (!estado || !['programado', 'en_curso', 'finalizado', 'cancelado'].includes(estado)) {
        return res.status(400).json({ message: "Estado no válido" });
      }
      
      const [realizacion] = await db.query(
        "SELECT id_realizacion FROM realizacion_evento WHERE id_realizacion = ?",
        [id]
      );
      
      if (!realizacion.length) {
        return res.status(404).json({ message: "Realización no encontrada" });
      }
      
      await db.query(
        "UPDATE realizacion_evento SET estado = ? WHERE id_realizacion = ?",
        [estado, id]
      );
      
      res.json({ message: "Estado actualizado exitosamente" });
    } catch (error) {
      console.error("Error actualizar estado realización:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  // =====================================================
  // ACTUALIZAR ESTADO GENERAL DEL EVENTO (solo admin)
  // =====================================================
  async actualizarEstadoEvento(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      if (!estado || !['activo', 'inactivo', 'finalizado'].includes(estado)) {
        return res.status(400).json({ message: "Estado no válido" });
      }
      
      const [evento] = await db.query(
        "SELECT id_evento FROM evento_cultural WHERE id_evento = ?",
        [id]
      );
      
      if (!evento.length) {
        return res.status(404).json({ message: "Evento no encontrado" });
      }
      
      await db.query(
        "UPDATE evento_cultural SET estado = ? WHERE id_evento = ?",
        [estado, id]
      );
      
      res.json({ message: "Estado del evento actualizado exitosamente" });
    } catch (error) {
      console.error("Error actualizar estado evento:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}

export default new EventoController();