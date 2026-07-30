import jwt from 'jsonwebtoken';
import pool from '../db.js';

// Middleware para verificar token
export const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      `SELECT u.id_usuario, u.username, u.email, u.id_rol, u.estado, r.nombre_rol
       FROM usuario u
       JOIN rol r ON u.id_rol = r.id_rol
       WHERE u.id_usuario = $1`,
      [decoded.id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];
    
    // Verificar estado
    if (usuario.estado !== 'activo') {
      return res.status(401).json({ 
        message: 'Usuario no activo. Contacte al administrador',
        estado: usuario.estado
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    console.error('Error en verificarToken:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    return res.status(500).json({ message: 'Error de autenticación' });
  }
};