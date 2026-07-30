import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// 🔍 DEBUG: Verificar variables de entorno
console.log('🔍 Variables de entorno cargadas:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'No definida');

// Crear pool de conexiones para PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tienda_virtual',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Función para probar conexión
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    
    // Verificar en qué base de datos estamos conectados
    const dbResult = await client.query('SELECT current_database() as db');
    console.log(`📊 Conectado a la base de datos: ${dbResult.rows[0].db}`);
    
    // Verificar tablas importantes
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`📋 Tablas en la base de datos (${tables.rows.length}):`);
    const tablasImportantes = ['usuario', 'rol', 'repositorio', 'producto', 'venta'];
    
    tables.rows.forEach(row => {
      const tableName = row.table_name;
      const icon = tablasImportantes.includes(tableName) ? '✅' : '📄';
      console.log(`   ${icon} ${tableName}`);
    });
    
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Error al conectar a PostgreSQL:', err.message);
    console.error('🔧 Detalles:', err);
    return false;
  }
};

// Función para ejecutar queries con parámetros
export const query = (text, params) => pool.query(text, params);

// Exportar pool por defecto
export default pool;