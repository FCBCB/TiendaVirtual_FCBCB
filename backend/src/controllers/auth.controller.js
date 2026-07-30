import pool from '../db.js';
import { OAuth2Client } from 'google-auth-library';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  findUserByEmail, 
  findUserByUsername,
  findUserById,
  createUser,
  createUserWithGoogle
} from '../services/auth.service.js';

// Configurar cliente de Google
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

class AuthController {
  // ============================================
  // REGISTRO DE RESPONSABLE (ADMIN GENERAL)
  // ============================================
  async registerResponsable(req, res) {
    try {
      const { 
        username, 
        email, 
        password, 
        nombre, 
        apellido_paterno, 
        apellido_materno, 
        celular,
        cargo,
        fecha_contratacion,
        id_repositorio 
      } = req.body;

      if (!username || !email || !password || !nombre || !apellido_paterno) {
        return res.status(400).json({ 
          message: 'Faltan campos requeridos: username, email, password, nombre, apellido_paterno' 
        });
      }

      const usuarioExistente = await findUserByEmail(email);
      if (usuarioExistente) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }

      const usernameExistente = await findUserByUsername(username);
      if (usernameExistente) {
        return res.status(400).json({ message: 'El username ya está en uso' });
      }

      if (id_repositorio) {
        const result = await pool.query(
          'SELECT id_repositorio FROM repositorio WHERE id_repositorio = $1 AND activo = true',
          [id_repositorio]
        );
        if (result.rows.length === 0) {
          return res.status(400).json({ message: 'Repositorio no encontrado o inactivo' });
        }
      }

      const password_hash = await hashPassword(password);

      const newUser = await createUser({
        username,
        email,
        password_hash,
        id_rol: 2,
        estado: 'pendiente_aprobacion',
        creado_por: req.usuario?.id_usuario || null
      });

      const id_usuario = newUser.id_usuario;

      await pool.query(
        `INSERT INTO perfil_usuario 
         (id_usuario, nombre, apellido_paterno, apellido_materno, celular, cargo, fecha_contratacion)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id_usuario, nombre, apellido_paterno, apellido_materno || null, celular || null, cargo || null, fecha_contratacion || null]
      );

      if (id_repositorio) {
        await pool.query(
          `INSERT INTO repositorio_responsable (id_repositorio, id_responsable, fecha_asignacion)
           VALUES ($1, $2, CURRENT_TIMESTAMP)`,
          [id_repositorio, id_usuario]
        );
      }

      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_nuevos)
         VALUES ($1, 'crear_responsable', 'usuario', $2, $3::jsonb)`,
        [req.usuario?.id_usuario || null, id_usuario, JSON.stringify({ username, email })]
      );

      res.status(201).json({
        message: 'Responsable registrado exitosamente. Esperando aprobación del administrador',
        id_usuario,
        estado: 'pendiente_aprobacion'
      });
    } catch (error) {
      console.error('Error en registro responsable:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // ============================================
  // LOGIN CON GOOGLE (CLIENTES) - VERSIÓN MEJORADA CON VERIFICACIÓN DE TOKEN
  // ============================================
async loginWithGoogle(req, res) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Token de Google no proporcionado' });
    }

    // Verificar el token con Google
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch (error) {
      console.error('Error verificando token de Google:', error);
      return res.status(401).json({ message: 'Token de Google inválido' });
    }

    const { email, name, picture, sub: google_id } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Email no proporcionado por Google' });
    }

    // Buscar usuario por email
    let usuario = await findUserByEmail(email);

    if (!usuario) {
      // Crear nuevo usuario cliente con Google
      const result = await pool.query(
        `INSERT INTO usuario (email, google_id, foto_perfil_google, id_rol, estado)
         VALUES ($1, $2, $3, (SELECT id_rol FROM rol WHERE nombre_rol = 'cliente'), 'activo')
         RETURNING id_usuario, email, estado`,
        [email, google_id, picture || null]
      );

      const newUser = result.rows[0];

      // ✅ CORRECCIÓN: No incluir foto_perfil_google en perfil_usuario
      // Solo insertar nombre en perfil_usuario
      await pool.query(
        `INSERT INTO perfil_usuario (id_usuario, nombre)
         VALUES ($1, $2)`,
        [newUser.id_usuario, name || email.split('@')[0]]
      );

      usuario = await findUserById(newUser.id_usuario);
      
      console.log(`✅ Nuevo cliente creado con Google: ${email}`);
    } else {
      // Si el usuario existe pero no tiene google_id, actualizarlo
      if (!usuario.google_id) {
        await pool.query(
          'UPDATE usuario SET google_id = $1, foto_perfil_google = $2 WHERE id_usuario = $3',
          [google_id, picture || null, usuario.id_usuario]
        );
        console.log(`✅ Usuario actualizado con Google ID: ${email}`);
      }
      
      // Verificar que el usuario está activo
      if (usuario.estado !== 'activo') {
        let mensaje = 'Usuario pendiente de aprobación';
        if (usuario.estado === 'inactivo') {
          mensaje = 'Usuario inactivo. Contacte al administrador';
        }
        if (usuario.estado === 'suspendido') {
          mensaje = 'Usuario suspendido. Contacte al administrador';
        }
        return res.status(403).json({ message: mensaje });
      }
    }

    // Generar token JWT
    const token = generateToken({
      id_usuario: usuario.id_usuario,
      username: usuario.username || email.split('@')[0],
      email: usuario.email,
      id_rol: usuario.id_rol
    });

    // Actualizar último acceso
    await pool.query(
      'UPDATE usuario SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id_usuario = $1',
      [usuario.id_usuario]
    );

    // Obtener perfil del cliente
    const perfilResult = await pool.query(
      'SELECT * FROM perfil_usuario WHERE id_usuario = $1',
      [usuario.id_usuario]
    );
    const perfil = perfilResult.rows[0] || {};

    res.json({
      message: 'Login con Google exitoso',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        nombre: perfil.nombre || name || email.split('@')[0],
        foto_perfil: usuario.foto_perfil_google || null,
        id_rol: usuario.id_rol,
        rol: usuario.nombre_rol,
        estado: usuario.estado
      }
    });
  } catch (error) {
    console.error('Error en login con Google:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

  // ============================================
  // LOGIN TRADICIONAL (ADMIN Y RESPONSABLE)
  // ============================================
  async login(req, res) {
    try {
      const { username, email, password } = req.body;
      
      let usuario = null;
      if (username) {
        usuario = await findUserByUsername(username);
      } else if (email) {
        usuario = await findUserByEmail(email);
      } else {
        return res.status(400).json({ message: 'Debe proporcionar username o email' });
      }

      if (!usuario) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const isMatch = await comparePassword(password, usuario.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      if (usuario.estado !== 'activo') {
        let mensaje = 'Usuario pendiente de aprobación';
        if (usuario.estado === 'inactivo') {
          mensaje = 'Usuario inactivo. Contacte al administrador';
        }
        if (usuario.estado === 'suspendido') {
          mensaje = 'Usuario suspendido. Contacte al administrador';
        }
        return res.status(401).json({ message: mensaje });
      }

      const token = generateToken({
        id_usuario: usuario.id_usuario,
        username: usuario.username,
        email: usuario.email,
        id_rol: usuario.id_rol
      });

      let datosAdicionales = {};
      
      const perfilResult = await pool.query(
        'SELECT * FROM perfil_usuario WHERE id_usuario = $1',
        [usuario.id_usuario]
      );
      
      if (perfilResult.rows.length) {
        datosAdicionales = perfilResult.rows[0];
      }

      if (usuario.id_rol === 2) {
        const reposResult = await pool.query(
          `SELECT r.id_repositorio, r.nombre, r.sigla, rr.fecha_asignacion
           FROM repositorio_responsable rr
           JOIN repositorio r ON rr.id_repositorio = r.id_repositorio
           WHERE rr.id_responsable = $1 AND rr.activo = true AND r.activo = true`,
          [usuario.id_usuario]
        );
        datosAdicionales.repositorios = reposResult.rows;
      }

      await pool.query(
        'UPDATE usuario SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id_usuario = $1',
        [usuario.id_usuario]
      );

      res.json({
        message: 'Login exitoso',
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          username: usuario.username,
          email: usuario.email,
          id_rol: usuario.id_rol,
          rol: usuario.nombre_rol,
          estado: usuario.estado,
          ...datosAdicionales
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // ============================================
  // OBTENER PERFIL DEL USUARIO AUTENTICADO
  // ============================================
  async getProfile(req, res) {
    try {
      const { id_usuario } = req.usuario;
      
      const result = await pool.query(
        `SELECT u.id_usuario, u.username, u.email, u.estado, u.fecha_registro, u.ultimo_acceso, 
                r.nombre_rol, r.descripcion as rol_descripcion,
                pu.*
         FROM usuario u
         JOIN rol r ON u.id_rol = r.id_rol
         LEFT JOIN perfil_usuario pu ON u.id_usuario = pu.id_usuario
         WHERE u.id_usuario = $1`,
        [id_usuario]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const usuario = result.rows[0];

      let repositorios = [];
      if (usuario.id_rol === 2) {
        const reposResult = await pool.query(
          `SELECT r.id_repositorio, r.nombre, r.sigla, rr.fecha_asignacion
           FROM repositorio_responsable rr
           JOIN repositorio r ON rr.id_repositorio = r.id_repositorio
           WHERE rr.id_responsable = $1 AND rr.activo = true AND r.activo = true`,
          [id_usuario]
        );
        repositorios = reposResult.rows;
      }

      res.json({
        usuario: {
          ...usuario,
          repositorios
        }
      });
    } catch (error) {
      console.error('Error en getProfile:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // ============================================
  // OBTENER USUARIOS PENDIENTES DE APROBACIÓN
  // ============================================
  async getPendientesAprobacion(req, res) {
    try {
      if (req.usuario.id_rol !== 1) {
        return res.status(403).json({ message: 'Acceso denegado' });
      }

      const result = await pool.query(
        `SELECT 
           u.id_usuario,
           u.username,
           u.email,
           u.fecha_registro,
           u.creado_por,
           u_creador.username as creador_username,
           pu.nombre,
           pu.apellido_paterno,
           pu.apellido_materno,
           pu.celular,
           pu.cargo,
           array_agg(DISTINCT rr.id_repositorio) as repositorios_ids,
           array_agg(DISTINCT r.nombre) as repositorios_nombres
         FROM usuario u
         LEFT JOIN perfil_usuario pu ON u.id_usuario = pu.id_usuario
         LEFT JOIN repositorio_responsable rr ON u.id_usuario = rr.id_responsable AND rr.activo = true
         LEFT JOIN repositorio r ON rr.id_repositorio = r.id_repositorio
         LEFT JOIN usuario u_creador ON u.creado_por = u_creador.id_usuario
         WHERE u.estado = 'pendiente_aprobacion'
         AND u.id_rol = 2
         GROUP BY u.id_usuario, u_creador.username, pu.id_perfil
         ORDER BY u.fecha_registro ASC`
      );

      res.json({
        pendientes: result.rows
      });
    } catch (error) {
      console.error('Error en getPendientesAprobacion:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // ============================================
  // APROBAR USUARIO
  // ============================================
  async aprobarUsuario(req, res) {
    try {
      const { id_usuario } = req.params;

      if (req.usuario.id_rol !== 1) {
        return res.status(403).json({ message: 'Acceso denegado' });
      }

      const userResult = await pool.query(
        'SELECT id_usuario, estado FROM usuario WHERE id_usuario = $1 AND estado = $2',
        [id_usuario, 'pendiente_aprobacion']
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado o no está pendiente' });
      }

      await pool.query(
        `UPDATE usuario 
         SET estado = 'activo', id_usuario_aprobador = $1, fecha_aprobacion = CURRENT_TIMESTAMP
         WHERE id_usuario = $2`,
        [req.usuario.id_usuario, id_usuario]
      );

      const permisoResult = await pool.query(
        'SELECT id_permiso FROM permiso_aprobacion WHERE nombre_permiso = $1',
        ['crear_responsable']
      );
      const id_permiso = permisoResult.rows[0]?.id_permiso || null;

      await pool.query(
        `INSERT INTO historial_aprobacion 
         (id_permiso, id_solicitante, id_aprobador, id_registro_afectado, tabla_afectada, estado, fecha_resolucion)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [
          id_permiso,
          id_usuario,
          req.usuario.id_usuario,
          id_usuario,
          'usuario',
          'aprobado'
        ]
      );

      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_nuevos)
         VALUES ($1, 'aprobar_usuario', 'usuario', $2, $3::jsonb)`,
        [
          req.usuario.id_usuario,
          id_usuario,
          JSON.stringify({ estado: 'activo', aprobado_por: req.usuario.id_usuario })
        ]
      );

      res.json({
        message: 'Usuario aprobado exitosamente',
        estado: 'activo'
      });
    } catch (error) {
      console.error('Error en aprobarUsuario:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // ============================================
  // RECHAZAR USUARIO
  // ============================================
  async rechazarUsuario(req, res) {
    try {
      const { id_usuario } = req.params;
      const { comentario } = req.body;

      if (req.usuario.id_rol !== 1) {
        return res.status(403).json({ message: 'Acceso denegado' });
      }

      const userResult = await pool.query(
        'SELECT id_usuario, estado FROM usuario WHERE id_usuario = $1 AND estado = $2',
        [id_usuario, 'pendiente_aprobacion']
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado o no está pendiente' });
      }

      await pool.query(
        `UPDATE usuario 
         SET estado = 'inactivo', id_usuario_aprobador = $1, fecha_aprobacion = CURRENT_TIMESTAMP
         WHERE id_usuario = $2`,
        [req.usuario.id_usuario, id_usuario]
      );

      const permisoResult = await pool.query(
        'SELECT id_permiso FROM permiso_aprobacion WHERE nombre_permiso = $1',
        ['crear_responsable']
      );
      const id_permiso = permisoResult.rows[0]?.id_permiso || null;

      await pool.query(
        `INSERT INTO historial_aprobacion 
         (id_permiso, id_solicitante, id_aprobador, id_registro_afectado, tabla_afectada, estado, comentario, fecha_resolucion)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
        [
          id_permiso,
          id_usuario,
          req.usuario.id_usuario,
          id_usuario,
          'usuario',
          'rechazado',
          comentario || 'Rechazado por el administrador'
        ]
      );

      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_nuevos)
         VALUES ($1, 'rechazar_usuario', 'usuario', $2, $3::jsonb)`,
        [
          req.usuario.id_usuario,
          id_usuario,
          JSON.stringify({ estado: 'inactivo', rechazado_por: req.usuario.id_usuario, comentario })
        ]
      );

      res.json({
        message: 'Usuario rechazado exitosamente',
        estado: 'inactivo'
      });
    } catch (error) {
      console.error('Error en rechazarUsuario:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

export default new AuthController();