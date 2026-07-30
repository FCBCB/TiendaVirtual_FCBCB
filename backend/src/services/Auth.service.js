import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

// Hashear contraseña
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Comparar contraseña
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generar token JWT
export const generateToken = (userData) => {
  return jwt.sign(userData, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Buscar usuario por email
export const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT u.*, r.nombre_rol 
     FROM usuario u 
     JOIN rol r ON u.id_rol = r.id_rol 
     WHERE u.email = $1`,
    [email]
  );
  return result.rows[0] || null;
};

// Buscar usuario por username
export const findUserByUsername = async (username) => {
  const result = await pool.query(
    `SELECT u.*, r.nombre_rol 
     FROM usuario u 
     JOIN rol r ON u.id_rol = r.id_rol 
     WHERE u.username = $1`,
    [username]
  );
  return result.rows[0] || null;
};

// Buscar usuario por ID
export const findUserById = async (id_usuario) => {
  const result = await pool.query(
    `SELECT u.*, r.nombre_rol 
     FROM usuario u 
     JOIN rol r ON u.id_rol = r.id_rol 
     WHERE u.id_usuario = $1`,
    [id_usuario]
  );
  return result.rows[0] || null;
};

// Crear usuario
export const createUser = async (userData) => {
  const { username, email, password_hash, id_rol, estado = 'pendiente_aprobacion', creado_por = null } = userData;
  
  const result = await pool.query(
    `INSERT INTO usuario (username, email, password_hash, id_rol, estado, creado_por, fecha_creacion_interna)
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
     RETURNING id_usuario, username, email, estado`,
    [username, email, password_hash, id_rol, estado, creado_por]
  );
  
  return result.rows[0];
};

// Crear usuario con Google (para clientes)
export const createUserWithGoogle = async (userData) => {
  const { email, google_id, nombre, foto_perfil_google } = userData;
  
  // Verificar si ya existe usuario con ese email
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    // Actualizar google_id si es necesario
    if (!existingUser.google_id) {
      await pool.query(
        'UPDATE usuario SET google_id = $1, foto_perfil_google = $2 WHERE id_usuario = $3',
        [google_id, foto_perfil_google, existingUser.id_usuario]
      );
    }
    return existingUser;
  }
  
  // Crear nuevo usuario cliente con Google
  const result = await pool.query(
    `INSERT INTO usuario (email, google_id, foto_perfil_google, id_rol, estado)
     VALUES ($1, $2, $3, (SELECT id_rol FROM rol WHERE nombre_rol = 'cliente'), 'activo')
     RETURNING id_usuario, email, estado`,
    [email, google_id, foto_perfil_google]
  );
  
  const newUser = result.rows[0];
  
  // Crear perfil del cliente
  await pool.query(
    `INSERT INTO perfil_usuario (id_usuario, nombre, foto_perfil_google)
     VALUES ($1, $2, $3)`,
    [newUser.id_usuario, nombre, foto_perfil_google]
  );
  
  return newUser;
};