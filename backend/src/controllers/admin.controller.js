import db from "../db.js";
import { hashPassword } from "../services/Auth.service.js";

class AdminController {
  // =====================================================
  // LISTAR USUARIOS
  // =====================================================
  async listarUsuarios(req, res) {
    try {
      const [rows] = await db.query(
        `SELECT u.id_usuario, u.username, u.email, u.estado, u.fecha_registro, u.ultimo_acceso,
                r.id_rol, r.nombre_rol,
                CASE 
                  WHEN r.id_rol = 1 THEN a.id_admin
                  WHEN r.id_rol = 2 THEN re.id_responsable
                END as perfil_id,
                CASE 
                  WHEN r.id_rol = 1 THEN a.nombre
                  WHEN r.id_rol = 2 THEN re.nombre
                END as nombre,
                CASE 
                  WHEN r.id_rol = 1 THEN a.apellido_paterno
                  WHEN r.id_rol = 2 THEN re.apellido_paterno
                END as apellido_paterno,
                CASE 
                  WHEN r.id_rol = 1 THEN a.apellido_materno
                  WHEN r.id_rol = 2 THEN re.apellido_materno
                END as apellido_materno,
                CASE 
                  WHEN r.id_rol = 1 THEN a.celular
                  WHEN r.id_rol = 2 THEN re.celular
                END as celular,
                CASE 
                  WHEN r.id_rol = 1 THEN a.foto_perfil
                  WHEN r.id_rol = 2 THEN re.foto_perfil
                END as foto_perfil,
                re.id_repositorio,
                rep.nombre as repositorio_nombre
         FROM usuario u
         JOIN rol r ON u.id_rol = r.id_rol
         LEFT JOIN administrador a ON u.id_usuario = a.id_usuario
         LEFT JOIN responsable re ON u.id_usuario = re.id_usuario
         LEFT JOIN repositorio rep ON re.id_repositorio = rep.id_repositorio
         ORDER BY u.fecha_registro DESC`
      );
      
      res.json({ usuarios: rows });
    } catch (error) {
      console.error("Error listarUsuarios:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  // =====================================================
  // OBTENER USUARIO POR ID
  // =====================================================
  async obtenerUsuario(req, res) {
    try {
      const { id_usuario } = req.params;
      
      const [rows] = await db.query(
        `SELECT u.id_usuario, u.username, u.email, u.estado, u.fecha_registro, u.ultimo_acceso,
                r.id_rol, r.nombre_rol,
                CASE 
                  WHEN r.id_rol = 1 THEN a.id_admin
                  WHEN r.id_rol = 2 THEN re.id_responsable
                END as perfil_id,
                CASE 
                  WHEN r.id_rol = 1 THEN a.nombre
                  WHEN r.id_rol = 2 THEN re.nombre
                END as nombre,
                CASE 
                  WHEN r.id_rol = 1 THEN a.apellido_paterno
                  WHEN r.id_rol = 2 THEN re.apellido_paterno
                END as apellido_paterno,
                CASE 
                  WHEN r.id_rol = 1 THEN a.apellido_materno
                  WHEN r.id_rol = 2 THEN re.apellido_materno
                END as apellido_materno,
                CASE 
                  WHEN r.id_rol = 1 THEN a.celular
                  WHEN r.id_rol = 2 THEN re.celular
                END as celular,
                CASE 
                  WHEN r.id_rol = 1 THEN a.foto_perfil
                  WHEN r.id_rol = 2 THEN re.foto_perfil
                END as foto_perfil,
                re.id_repositorio,
                rep.nombre as repositorio_nombre
         FROM usuario u
         JOIN rol r ON u.id_rol = r.id_rol
         LEFT JOIN administrador a ON u.id_usuario = a.id_usuario
         LEFT JOIN responsable re ON u.id_usuario = re.id_usuario
         LEFT JOIN repositorio rep ON re.id_repositorio = rep.id_repositorio
         WHERE u.id_usuario = ?`,
        [id_usuario]
      );
      
      if (!rows.length) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      res.json({ usuario: rows[0] });
    } catch (error) {
      console.error("Error obtenerUsuario:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  // =====================================================
  // CREAR USUARIO (ADMIN O RESPONSABLE)
  // =====================================================
  async crearUsuario(req, res) {
    try {
      const { 
        username, 
        email, 
        password, 
        nombre, 
        apellido_paterno, 
        apellido_materno, 
        celular, 
        id_rol,
        id_repositorio,
        estado 
      } = req.body;

      // Validar campos requeridos
      if (!username || !email || !password || !nombre || !apellido_paterno || !id_rol) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
      }

      // Verificar si el usuario ya existe
      const [usuarioExistente] = await db.query(
        "SELECT id_usuario FROM usuario WHERE email = ? OR username = ?",
        [email, username]
      );
      
      if (usuarioExistente.length) {
        return res.status(400).json({ message: "El email o username ya está registrado" });
      }

      // Verificar rol
      if (![1, 2].includes(parseInt(id_rol))) {
        return res.status(400).json({ message: "Rol inválido" });
      }

      // Verificar repositorio si es responsable
      if (parseInt(id_rol) === 2 && id_repositorio) {
        const [repositorio] = await db.query(
          "SELECT id_repositorio FROM repositorio WHERE id_repositorio = ?",
          [id_repositorio]
        );
        if (!repositorio.length) {
          return res.status(400).json({ message: "Repositorio no encontrado" });
        }
      }

      // Hashear contraseña
      const password_hash = await hashPassword(password);

      // Crear usuario
      const [result] = await db.query(
        `INSERT INTO usuario (username, email, password_hash, id_rol, estado) 
         VALUES (?, ?, ?, ?, ?)`,
        [username, email, password_hash, id_rol, estado || "activo"]
      );

      const id_usuario = result.insertId;

      // Crear registro según rol
      if (parseInt(id_rol) === 1) {
        await db.query(
          `INSERT INTO administrador (nombre, apellido_paterno, apellido_materno, celular, id_usuario) 
           VALUES (?, ?, ?, ?, ?)`,
          [nombre, apellido_paterno, apellido_materno || null, celular || null, id_usuario]
        );
      } else {
        await db.query(
          `INSERT INTO responsable (nombre, apellido_paterno, apellido_materno, celular, id_usuario, id_repositorio) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [nombre, apellido_paterno, apellido_materno || null, celular || null, id_usuario, id_repositorio || null]
        );
      }

      res.status(201).json({
        message: "Usuario creado exitosamente",
        id_usuario
      });
    } catch (error) {
      console.error("Error crearUsuario:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  // =====================================================
  // EDITAR USUARIO
  // =====================================================
  async editarUsuario(req, res) {
    try {
      const { id_usuario } = req.params;
      const { 
        username, 
        email, 
        password, 
        nombre, 
        apellido_paterno, 
        apellido_materno, 
        celular, 
        id_rol,
        id_repositorio,
        estado 
      } = req.body;

      // Verificar que el usuario existe
      const [usuario] = await db.query(
        "SELECT id_usuario, id_rol FROM usuario WHERE id_usuario = ?",
        [id_usuario]
      );

      if (!usuario.length) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const rolActual = usuario[0].id_rol;
      const nuevoRol = parseInt(id_rol) || rolActual;

      // Verificar repositorio si es responsable
      if (nuevoRol === 2 && id_repositorio) {
        const [repositorio] = await db.query(
          "SELECT id_repositorio FROM repositorio WHERE id_repositorio = ?",
          [id_repositorio]
        );
        if (!repositorio.length) {
          return res.status(400).json({ message: "Repositorio no encontrado" });
        }
      }

      // Actualizar usuario
      let updateQuery = "UPDATE usuario SET username = ?, email = ?, estado = ?, id_rol = ?";
      let params = [username, email, estado, nuevoRol];
      
      // Si se proporciona contraseña, actualizarla
      if (password) {
        const password_hash = await hashPassword(password);
        updateQuery += ", password_hash = ?";
        params.push(password_hash);
      }
      
      updateQuery += " WHERE id_usuario = ?";
      params.push(id_usuario);
      
      await db.query(updateQuery, params);
      if (nuevoRol === 1) {
        if (rolActual === 2) {
          await db.query("DELETE FROM responsable WHERE id_usuario = ?", [id_usuario]);
        }
        const [adminExistente] = await db.query(
          "SELECT id_admin FROM administrador WHERE id_usuario = ?",
          [id_usuario]
        );
        
        if (adminExistente.length) {
          await db.query(
            `UPDATE administrador 
             SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, celular = ? 
             WHERE id_usuario = ?`,
            [nombre, apellido_paterno, apellido_materno || null, celular || null, id_usuario]
          );
        } else {
          await db.query(
            `INSERT INTO administrador (nombre, apellido_paterno, apellido_materno, celular, id_usuario) 
             VALUES (?, ?, ?, ?, ?)`,
            [nombre, apellido_paterno, apellido_materno || null, celular || null, id_usuario]
          );
        }
      } else {
        // Si el usuario era administrador, eliminar su registro
        if (rolActual === 1) {
          await db.query("DELETE FROM administrador WHERE id_usuario = ?", [id_usuario]);
        }
        const [responsableExistente] = await db.query(
          "SELECT id_responsable FROM responsable WHERE id_usuario = ?",
          [id_usuario]
        );
        
        if (responsableExistente.length) {
          await db.query(
            `UPDATE responsable 
             SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, celular = ?, id_repositorio = ? 
             WHERE id_usuario = ?`,
            [nombre, apellido_paterno, apellido_materno || null, celular || null, id_repositorio || null, id_usuario]
          );
        } else {
          await db.query(
            `INSERT INTO responsable (nombre, apellido_paterno, apellido_materno, celular, id_usuario, id_repositorio) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre, apellido_paterno, apellido_materno || null, celular || null, id_usuario, id_repositorio || null]
          );
        }
      }

      res.json({ message: "Usuario actualizado exitosamente" });
    } catch (error) {
      console.error("Error editarUsuario:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  // =====================================================
  // ELIMINAR USUARIO
  // =====================================================
  async eliminarUsuario(req, res) {
    try {
      const { id_usuario } = req.params;

      const [usuario] = await db.query(
        "SELECT id_usuario FROM usuario WHERE id_usuario = ?",
        [id_usuario]
      );

      if (!usuario.length) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      await db.query("DELETE FROM usuario WHERE id_usuario = ?", [id_usuario]);

      res.json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
      console.error("Error eliminarUsuario:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  // =====================================================
  // CAMBIAR CONTRASEÑA DE USUARIO
  // =====================================================
  async cambiarPassword(req, res) {
    try {
      const { id_usuario } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
      }

      const [usuario] = await db.query(
        "SELECT id_usuario FROM usuario WHERE id_usuario = ?",
        [id_usuario]
      );

      if (!usuario.length) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const password_hash = await hashPassword(newPassword);

      await db.query(
        "UPDATE usuario SET password_hash = ? WHERE id_usuario = ?",
        [password_hash, id_usuario]
      );

      res.json({ message: "Contraseña actualizada exitosamente" });
    } catch (error) {
      console.error("Error cambiarPassword:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  // =====================================================
  // LISTAR RESPONSABLES PENDIENTES
  // =====================================================
  async listarPendientes(req, res) {
    try {
      const [rows] = await db.query(
        `SELECT u.id_usuario, u.username, u.email, u.fecha_registro,
                re.nombre, re.apellido_paterno, re.apellido_materno, re.celular,
                re.id_repositorio, rep.nombre as repositorio_nombre
         FROM usuario u
         JOIN responsable re ON u.id_usuario = re.id_usuario
         LEFT JOIN repositorio rep ON re.id_repositorio = rep.id_repositorio
         WHERE u.estado = 'pendiente' AND u.id_rol = 2
         ORDER BY u.fecha_registro DESC`
      );
      
      res.json({ pendientes: rows });
    } catch (error) {
      console.error("Error listarPendientes:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  // =====================================================
  // APROBAR RESPONSABLE
  // =====================================================
  async aprobarResponsable(req, res) {
    try {
      const { id_usuario } = req.params;
      const id_aprobador = req.usuario.id_usuario;

      const [usuario] = await db.query(
        "SELECT id_usuario, id_rol, estado FROM usuario WHERE id_usuario = ?",
        [id_usuario]
      );

      if (!usuario.length) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      if (usuario[0].id_rol !== 2) {
        return res.status(400).json({ message: "Solo se pueden aprobar responsables" });
      }

      if (usuario[0].estado !== "pendiente") {
        return res.status(400).json({ message: `El usuario ya está ${usuario[0].estado}` });
      }

      const [result] = await db.query(
        `UPDATE usuario 
         SET estado = 'activo', id_usuario_aprobador = ? 
         WHERE id_usuario = ?`,
        [id_aprobador, id_usuario]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({ message: "Usuario aprobado exitosamente" });
    } catch (error) {
      console.error("Error aprobarResponsable:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  // =====================================================
  // RECHAZAR RESPONSABLE
  // =====================================================
  async rechazarResponsable(req, res) {
    try {
      const { id_usuario } = req.params;
      const id_aprobador = req.usuario.id_usuario;

      const [usuario] = await db.query(
        "SELECT id_usuario, id_rol, estado FROM usuario WHERE id_usuario = ?",
        [id_usuario]
      );

      if (!usuario.length) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      if (usuario[0].id_rol !== 2) {
        return res.status(400).json({ message: "Solo se pueden rechazar responsables" });
      }

      if (usuario[0].estado !== "pendiente") {
        return res.status(400).json({ message: `El usuario ya está ${usuario[0].estado}` });
      }

      const [result] = await db.query(
        `UPDATE usuario 
         SET estado = 'inactivo', id_usuario_aprobador = ? 
         WHERE id_usuario = ?`,
        [id_aprobador, id_usuario]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({ message: "Usuario rechazado" });
    } catch (error) {
      console.error("Error rechazarResponsable:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  // =====================================================
  // CAMBIAR ESTADO DE USUARIO (activar/desactivar)
  // =====================================================
  async cambiarEstado(req, res) {
    try {
      const { id_usuario } = req.params;
      const { estado } = req.body;
      const id_aprobador = req.usuario.id_usuario;

      if (!["activo", "inactivo"].includes(estado)) {
        return res.status(400).json({ message: "Estado inválido" });
      }

      const [usuario] = await db.query(
        "SELECT id_usuario FROM usuario WHERE id_usuario = ?",
        [id_usuario]
      );

      if (!usuario.length) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const [result] = await db.query(
        `UPDATE usuario 
         SET estado = ?, id_usuario_aprobador = ? 
         WHERE id_usuario = ?`,
        [estado, id_aprobador, id_usuario]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({ 
        message: `Usuario ${estado === "activo" ? "activado" : "desactivado"} exitosamente` 
      });
    } catch (error) {
      console.error("Error cambiarEstado:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  // =====================================================
  // LISTAR REPOSITORIOS (para selects)
  // =====================================================
  async listarRepositorios(req, res) {
    try {
      const [rows] = await db.query(
        "SELECT id_repositorio, nombre, sigla FROM repositorio WHERE estado = 'activo' ORDER BY nombre"
      );
      res.json({ repositorios: rows });
    } catch (error) {
      console.error("Error listarRepositorios:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}

export default new AdminController();