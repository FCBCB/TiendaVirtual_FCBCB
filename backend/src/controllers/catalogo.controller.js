import db from "../db.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CatalogoController {
// =====================================================
// LISTAR CATÁLOGOS CON SUS REPOSITORIOS
// =====================================================
async listar(req, res) {
  try {
    // Manejar cuando no hay usuario autenticado (app móvil)
    const usuario = req.usuario || {};
    const { rol, id_repositorio_asignado } = usuario;
    
    let catalogosQuery = `
      SELECT c.*
      FROM catalogo c
      WHERE c.estado = 'activo'
    `;
    
    const params = [];
    
    // Si es responsable, filtrar por sus catálogos disponibles
    if (rol === 'responsable' && id_repositorio_asignado) {
      catalogosQuery += ` AND EXISTS (
        SELECT 1 FROM disponibilidad_catalogo dc 
        WHERE dc.id_catalogo = c.id_catalogo 
        AND dc.id_repositorio = ?
      )`;
      params.push(id_repositorio_asignado);
    }
    
    catalogosQuery += ` ORDER BY c.fecha_creacion DESC`;
    
    const [catalogos] = await db.query(catalogosQuery, params);
    
    // Para cada catálogo, obtener sus repositorios disponibles y calcular stock total
    const catalogosConRepositorios = await Promise.all(
      catalogos.map(async (catalogo) => {
        const [repositorios] = await db.query(
          `SELECT 
             r.id_repositorio,
             r.nombre,
             r.sigla,
             r.direccion,
             r.ubicacion_gps,
             r.departamento,
             dc.stock,
             dc.estado as estado_disponibilidad
           FROM disponibilidad_catalogo dc
           JOIN repositorio r ON dc.id_repositorio = r.id_repositorio
           WHERE dc.id_catalogo = ? AND r.estado = 'activo'`,
          [catalogo.id_catalogo]
        );
        
        // Calcular stock total sumando todos los repositorios
        const stockTotal = repositorios.reduce((total, repo) => total + (repo.stock || 0), 0);
        
        // Asegurar que la reseña no venga con problemas de codificación
        const reseña = catalogo.reseña ? catalogo.reseña.toString() : null;
        
        return {
          ...catalogo,
          reseña: reseña,
          stock: stockTotal,
          repositorios_disponibles: repositorios
        };
      })
    );
    
    res.json({ 
      catalogos: catalogosConRepositorios,
      total: catalogosConRepositorios.length,
      rol: rol || 'publico'
    });
  } catch (error) {
    console.error("Error listar catálogos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

// =====================================================
// LISTAR CATÁLOGOS POR REPOSITORIO
// =====================================================
async listarPorRepositorio(req, res) {
  try {
    const { id } = req.params;
    const usuario = req.usuario || {};
    const { rol, id_repositorio_asignado } = usuario;
    
    // Verificar permisos solo si es responsable
    if (rol === 'responsable' && id_repositorio_asignado != id) {
      return res.status(403).json({ 
        message: "No tienes permisos para ver catálogos de este repositorio" 
      });
    }
    
    const [rows] = await db.query(
      `SELECT c.*, 
              dc.id_disponibilidad,
              dc.stock as stock_disponibilidad,
              dc.estado as estado_disponibilidad
       FROM catalogo c
       LEFT JOIN disponibilidad_catalogo dc ON c.id_catalogo = dc.id_catalogo
       WHERE dc.id_repositorio = ? AND c.estado = 'activo'
       ORDER BY c.fecha_creacion DESC`,
      [id]
    );
    
    res.json({ catalogos: rows });
  } catch (error) {
    console.error("Error listar catálogos por repositorio:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}


// =====================================================
// OBTENER CATÁLOGO POR ID CON TODOS SUS REPOSITORIOS
// =====================================================
async obtenerPorId(req, res) {
  try {
    const { id } = req.params;
    const usuario = req.usuario || {};
    const { rol, id_repositorio_asignado } = usuario;
    
    const [catalogos] = await db.query(
      `SELECT c.*
       FROM catalogo c
       WHERE c.id_catalogo = ? AND c.estado = 'activo'`,
      [id]
    );
    
    if (!catalogos.length) {
      return res.status(404).json({ message: "Catálogo no encontrado" });
    }
    
    const catalogo = catalogos[0];
    
    // Obtener repositorios disponibles
    const [repositorios] = await db.query(
      `SELECT 
         r.id_repositorio,
         r.nombre,
         r.sigla,
         r.direccion,
         r.ubicacion_gps,
         r.departamento,
         dc.stock,
         dc.estado as estado_disponibilidad
       FROM disponibilidad_catalogo dc
       JOIN repositorio r ON dc.id_repositorio = r.id_repositorio
       WHERE dc.id_catalogo = ? AND r.estado = 'activo'`,
      [id]
    );
    
    catalogo.repositorios_disponibles = repositorios;
    
    // Verificar permisos solo si es responsable
    if (rol === 'responsable') {
      const tienePermiso = catalogo.repositorios_disponibles.some(
        r => r.id_repositorio === id_repositorio_asignado
      );
      if (!tienePermiso) {
        return res.status(403).json({ 
          message: "No tienes permisos para ver este catálogo" 
        });
      }
    }
    
    res.json({ catalogo });
  } catch (error) {
    console.error("Error obtener catálogo:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}


// =====================================================
// CREAR CATÁLOGO CON MÚLTIPLES REPOSITORIOS
// =====================================================
async crear(req, res) {
  try {
    const { 
      titulo,
      curaduria,
      anio_publicacion,
      formato,
      precio,
      repositorios
    } = req.body;
    
    // Obtener reseña con manejo de codificación
    let reseña = req.body.reseña || req.body['reseÃ±a'] || null;
    
    const { rol, id_repositorio_asignado } = req.usuario;
    
    console.log('📦 Body recibido:', req.body);
    console.log('📁 File recibido:', req.file);
    console.log('📝 Reseña obtenida:', reseña);
    
    // Validar campos requeridos
    if (!titulo || !precio) {
      return res.status(400).json({ 
        message: "Título y precio son requeridos" 
      });
    }
    
    // Parsear repositorios si viene como string
    let repositoriosList = repositorios;
    if (typeof repositorios === 'string') {
      try {
        repositoriosList = JSON.parse(repositorios);
      } catch (e) {
        console.error('Error parsing repositorios:', e);
        return res.status(400).json({ 
          message: "Formato de repositorios inválido" 
        });
      }
    }
    
    if (!repositoriosList || !repositoriosList.length) {
      return res.status(400).json({ 
        message: "Debe seleccionar al menos un repositorio" 
      });
    }
    
    // Verificar permisos para responsable
    if (rol === 'responsable') {
      const tienePermiso = repositoriosList.some(
        r => parseInt(r.id_repositorio) === parseInt(id_repositorio_asignado)
      );
      if (!tienePermiso) {
        return res.status(403).json({ 
          message: "Solo puedes agregar catálogos a tu repositorio asignado" 
        });
      }
    }
    
    // Verificar que los repositorios existen
    for (const repo of repositoriosList) {
      const [repositorio] = await db.query(
        "SELECT id_repositorio FROM repositorio WHERE id_repositorio = ?",
        [repo.id_repositorio]
      );
      if (!repositorio.length) {
        return res.status(404).json({ 
          message: `Repositorio ${repo.id_repositorio} no encontrado` 
        });
      }
    }
    
    // Manejar portada
    let portada_url = null;
    if (req.file) {
      portada_url = `/uploads/catalogos/${path.basename(req.file.path)}`;
      console.log('✅ Portada guardada en:', portada_url);
    }
    
    // Insertar catálogo
    const [result] = await db.query(
      `INSERT INTO catalogo 
       (titulo, curaduria, reseña, anio_publicacion, formato, precio, portada_url, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'activo')`,
      [titulo, curaduria || null, reseña, anio_publicacion || null, 
       formato || null, precio, portada_url]
    );
    
    const id_catalogo = result.insertId;
    
    // Crear disponibilidad en cada repositorio
    for (const repo of repositoriosList) {
      await db.query(
        `INSERT INTO disponibilidad_catalogo 
         (id_catalogo, id_repositorio, stock, estado) 
         VALUES (?, ?, ?, ?)`,
        [id_catalogo, repo.id_repositorio, repo.stock || 0, 'disponible']
      );
    }
    
    res.status(201).json({ 
      message: "Catálogo creado exitosamente",
      id_catalogo: id_catalogo,
      portada: portada_url
    });
  } catch (error) {
    console.error("Error crear catálogo:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}
// =====================================================
// EDITAR CATÁLOGO - Actualizar repositorios
// =====================================================
async editar(req, res) {
  try {
    const { id } = req.params;
    const { 
      titulo,
      curaduria,
      anio_publicacion,
      formato,
      precio,
      repositorios,
      portada_actual
    } = req.body;
    
    // Obtener reseña con manejo de codificación
    let reseña = req.body.reseña || req.body['reseÃ±a'] || null;
    
    const { rol, id_repositorio_asignado } = req.usuario;
    
    console.log('📦 Body recibido editar:', req.body);
    console.log('📁 File recibido editar:', req.file);
    console.log('📝 Reseña obtenida editar:', reseña);
    
    // Verificar que el catálogo existe
    const [catalogo] = await db.query(
      "SELECT id_catalogo FROM catalogo WHERE id_catalogo = ?",
      [id]
    );
    
    if (!catalogo.length) {
      return res.status(404).json({ message: "Catálogo no encontrado" });
    }
    
    // Parsear repositorios
    let repositoriosList = repositorios;
    if (typeof repositorios === 'string') {
      try {
        repositoriosList = JSON.parse(repositorios);
      } catch (e) {
        console.error('Error parsing repositorios:', e);
        return res.status(400).json({ 
          message: "Formato de repositorios inválido" 
        });
      }
    }
    
    // Verificar permisos para responsable
    if (rol === 'responsable') {
      const tienePermiso = repositoriosList.some(
        r => parseInt(r.id_repositorio) === parseInt(id_repositorio_asignado)
      );
      if (!tienePermiso) {
        return res.status(403).json({ 
          message: "Solo puedes editar catálogos de tu repositorio asignado" 
        });
      }
    }
    
    // Manejar portada
    let portada_url = portada_actual || null;
    
    if (req.file) {
      if (portada_actual && portada_actual.startsWith('/uploads')) {
        const oldPath = path.join(__dirname, "../..", portada_actual);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
          console.log('🗑️ Portada anterior eliminada:', oldPath);
        }
      }
      portada_url = `/uploads/catalogos/${path.basename(req.file.path)}`;
      console.log('✅ Nueva portada guardada:', portada_url);
    }
    
    // Actualizar catálogo
    await db.query(
      `UPDATE catalogo 
       SET titulo = ?, curaduria = ?, reseña = ?, anio_publicacion = ?,
           formato = ?, precio = ?, portada_url = ?
       WHERE id_catalogo = ?`,
      [titulo, curaduria || null, reseña, anio_publicacion || null,
       formato || null, precio, portada_url, id]
    );
    
    // Eliminar disponibilidades existentes
    await db.query(
      "DELETE FROM disponibilidad_catalogo WHERE id_catalogo = ?",
      [id]
    );
    
    // Crear nuevas disponibilidades
    for (const repo of repositoriosList) {
      await db.query(
        `INSERT INTO disponibilidad_catalogo 
         (id_catalogo, id_repositorio, stock, estado) 
         VALUES (?, ?, ?, ?)`,
        [id, repo.id_repositorio, repo.stock || 0, 'disponible']
      );
    }
    
    res.json({ 
      message: "Catálogo actualizado exitosamente",
      portada: portada_url
    });
  } catch (error) {
    console.error("Error editar catálogo:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

  // =====================================================
  // ELIMINAR CATÁLOGO (lógico)
  // =====================================================
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const { rol, id_repositorio_asignado } = req.usuario;
      
      // Verificar que el catálogo existe y obtener sus repositorios
      const [repositorios] = await db.query(
        `SELECT dc.id_repositorio
         FROM disponibilidad_catalogo dc
         WHERE dc.id_catalogo = ?`,
        [id]
      );
      
      const [catalogo] = await db.query(
        "SELECT id_catalogo FROM catalogo WHERE id_catalogo = ?",
        [id]
      );
      
      if (!catalogo.length) {
        return res.status(404).json({ message: "Catálogo no encontrado" });
      }
      
      const repositoriosIds = repositorios.map(r => r.id_repositorio);
      
      // Verificar permisos para responsable
      if (rol === 'responsable') {
        if (!repositoriosIds.includes(id_repositorio_asignado)) {
          return res.status(403).json({ 
            message: "No tienes permisos para eliminar este catálogo" 
          });
        }
      }
      
      // Eliminación lógica
      await db.query(
        "UPDATE catalogo SET estado = 'inactivo' WHERE id_catalogo = ?",
        [id]
      );
      
      res.json({ message: "Catálogo eliminado exitosamente" });
    } catch (error) {
      console.error("Error eliminar catálogo:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

// =====================================================
// LISTAR REPOSITORIOS DISPONIBLES PARA CATÁLOGOS
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
  // ACTUALIZAR DISPONIBILIDAD (solo admin)
  // =====================================================
  async actualizarDisponibilidad(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      if (!estado || !['disponible', 'agotado'].includes(estado)) {
        return res.status(400).json({ message: "Estado no válido" });
      }
      
      const [catalogo] = await db.query(
        "SELECT id_catalogo FROM catalogo WHERE id_catalogo = ?",
        [id]
      );
      
      if (!catalogo.length) {
        return res.status(404).json({ message: "Catálogo no encontrado" });
      }
      
      await db.query(
        "UPDATE disponibilidad_catalogo SET estado = ? WHERE id_catalogo = ?",
        [estado, id]
      );
      
      res.json({ message: "Disponibilidad actualizada exitosamente" });
    } catch (error) {
      console.error("Error actualizar disponibilidad:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  // =====================================================
  // ACTUALIZAR STOCK (solo admin)
  // =====================================================
  async actualizarStock(req, res) {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      
      if (stock === undefined || stock < 0) {
        return res.status(400).json({ message: "Stock no válido" });
      }
      
      const [catalogo] = await db.query(
        "SELECT id_catalogo FROM catalogo WHERE id_catalogo = ?",
        [id]
      );
      
      if (!catalogo.length) {
        return res.status(404).json({ message: "Catálogo no encontrado" });
      }
      
      await db.query(
        "UPDATE disponibilidad_catalogo SET stock = ? WHERE id_catalogo = ?",
        [stock, id]
      );
      
      // Actualizar estado automáticamente si stock = 0
      if (stock === 0) {
        await db.query(
          "UPDATE disponibilidad_catalogo SET estado = 'agotado' WHERE id_catalogo = ?",
          [id]
        );
      } else if (stock > 0) {
        await db.query(
          "UPDATE disponibilidad_catalogo SET estado = 'disponible' WHERE id_catalogo = ?",
          [id]
        );
      }
      
      res.json({ message: "Stock actualizado exitosamente" });
    } catch (error) {
      console.error("Error actualizar stock:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}

export default new CatalogoController();