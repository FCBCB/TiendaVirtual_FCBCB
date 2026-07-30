import pool from '../db.js';

class RoleMiddleware {
  // Verificar que sea ADMIN GENERAL (rol id = 1)
  esAdminGeneral(req, res, next) {
    if (!req.usuario) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (req.usuario.id_rol !== 1) {
      return res.status(403).json({ 
        message: 'Acceso denegado. Se requiere rol de ADMIN GENERAL' 
      });
    }

    next();
  }

  // Verificar que sea RESPONSABLE (rol id = 2)
  esResponsable(req, res, next) {
    if (!req.usuario) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (req.usuario.id_rol !== 2) {
      return res.status(403).json({ 
        message: 'Acceso denegado. Se requiere rol de RESPONSABLE' 
      });
    }

    next();
  }

  // Verificar que sea ADMIN GENERAL o RESPONSABLE
  esAdminOResponsable(req, res, next) {
    if (!req.usuario) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (req.usuario.id_rol !== 1 && req.usuario.id_rol !== 2) {
      return res.status(403).json({ 
        message: 'Acceso denegado. Se requiere rol de ADMIN o RESPONSABLE' 
      });
    }

    next();
  }

  // Verificar que sea CLIENTE (rol id = 3)
  esCliente(req, res, next) {
    if (!req.usuario) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (req.usuario.id_rol !== 3) {
      return res.status(403).json({ 
        message: 'Acceso denegado. Se requiere rol de CLIENTE' 
      });
    }

    next();
  }

  // Verificar que sea el mismo usuario o ADMIN GENERAL
  esMismoUsuarioOAdmin(req, res, next) {
    if (!req.usuario) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const idUsuario = parseInt(req.params.id_usuario);
    
    if (req.usuario.id_rol === 1) {
      return next();
    }
    
    if (req.usuario.id_usuario === idUsuario) {
      return next();
    }
    
    return res.status(403).json({ 
      message: 'Acceso denegado. No tienes permiso para esta acción' 
    });
  }

  // Verificar que el responsable pertenece al repositorio que intenta modificar
  async esResponsableDeSuRepositorio(req, res, next) {
    if (!req.usuario) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    // Si es ADMIN GENERAL, puede acceder
    if (req.usuario.id_rol === 1) {
      return next();
    }

    const id_repositorio = parseInt(req.params.id_repositorio) || 
                          parseInt(req.body.id_repositorio) || 
                          parseInt(req.query.id_repositorio);
    
    if (!id_repositorio) {
      return res.status(400).json({ message: 'ID de repositorio requerido' });
    }

    try {
      const result = await pool.query(
        `SELECT rr.id_repositorio 
         FROM repositorio_responsable rr
         WHERE rr.id_responsable = $1 AND rr.activo = true`,
        [req.usuario.id_usuario]
      );
      
      const repositorios = result.rows.map(row => row.id_repositorio);
      
      if (!repositorios.includes(id_repositorio)) {
        return res.status(403).json({ 
          message: 'No tienes permiso para este repositorio' 
        });
      }

      next();
    } catch (error) {
      console.error('Error verificando repositorio:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Verificar permisos específicos
  async verificarPermiso(req, res, next) {
    if (!req.usuario) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { nombre_permiso } = req.params;
    
    try {
      const result = await pool.query(
        `SELECT pa.* 
         FROM permiso_aprobacion pa
         WHERE pa.nombre_permiso = $1
         AND pa.id_rol_aprobador = $2
         AND pa.activo = true`,
        [nombre_permiso, req.usuario.id_rol]
      );
      
      if (result.rows.length === 0) {
        return res.status(403).json({ 
          message: `No tienes permiso para: ${nombre_permiso}` 
        });
      }

      req.permiso = result.rows[0];
      next();
    } catch (error) {
      console.error('Error verificando permiso:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

export default new RoleMiddleware();