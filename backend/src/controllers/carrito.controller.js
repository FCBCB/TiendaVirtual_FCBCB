// src/controllers/carrito.controller.js
import pool from '../db.js';
import { v4 as uuidv4 } from 'uuid';

// ✅ FUNCIONES AUXILIARES INDEPENDIENTES
async function getOrCreateCarrito(id_usuario, token, req) {
  let id_carrito;
  
  if (id_usuario) {
    const result = await pool.query(
      `SELECT id_carrito FROM CARRITO 
       WHERE id_usuario = $1 AND activo = TRUE
       ORDER BY fecha_creacion DESC LIMIT 1`,
      [id_usuario]
    );
    id_carrito = result.rows[0]?.id_carrito;
  }
  
  if (!id_carrito && token) {
    const result = await pool.query(
      `SELECT id_carrito FROM CARRITO 
       WHERE token_carrito = $1 AND activo = TRUE`,
      [token]
    );
    id_carrito = result.rows[0]?.id_carrito;
  }
  
  if (!id_carrito) {
    const nuevoToken = token || uuidv4();
    const result = await pool.query(
      `SELECT crear_carrito($1, $2, $3, $4) as id_carrito`,
      [id_usuario || null, nuevoToken, req?.ip || null, req?.headers?.['user-agent'] || null]
    );
    id_carrito = result.rows[0].id_carrito;
  }
  
  return id_carrito;
}

// ✅ getCarritoCompleto SIN descuento_aplicado
async function getCarritoCompleto(id_carrito) {
  const result = await pool.query(
    `SELECT 
       c.id_carrito,
       c.fecha_creacion,
       c.fecha_expiracion,
       c.total_items,
       c.subtotal,
       c.descuentos,
       c.total,
       c.activo,
       COALESCE(
         (SELECT json_agg(
            jsonb_build_object(
              'id_carrito_item', ci.id_carrito_item,
              'id_producto', ci.id_producto,
              'id_repositorio', ci.id_repositorio,
              'nombre_repositorio', r.nombre,
              'nombre_producto', ci.nombre_producto,
              'imagen_producto', ci.imagen_producto,
              'tipo_producto', ci.tipo_producto,
              'cantidad', ci.cantidad,
              'precio_unitario', ci.precio_unitario,
              'subtotal', ci.subtotal,
              'fecha_agregado', ci.fecha_agregado,
              'stock', dp.stock
            )
          )
          FROM CARRITO_ITEM ci
          LEFT JOIN DISPONIBILIDAD_PRODUCTO dp ON ci.id_disponibilidad = dp.id_disponibilidad
          LEFT JOIN REPOSITORIO r ON ci.id_repositorio = r.id_repositorio
          WHERE ci.id_carrito = c.id_carrito
         ),
         '[]'::json
       ) as items
     FROM CARRITO c
     WHERE c.id_carrito = $1`,
    [id_carrito]
  );
  
  return result.rows[0] || null;
}

function calcularHorasRestantes(fechaExpiracion) {
  if (!fechaExpiracion) return 0;
  const expiracion = new Date(fechaExpiracion);
  const ahora = new Date();
  const diff = expiracion - ahora;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
}

// ─── CLASE CARRITO CONTROLLER ──────────────────────────────────────────────
class CarritoController {
  // =====================================================
  // OBTENER CARRITO DEL USUARIO ACTUAL
  // =====================================================
  async obtenerCarrito(req, res) {
    try {
      const usuario = req.usuario || {};
      const token = req.headers['x-cart-token'] || req.cookies?.cart_token;
      
      let id_carrito;
      
      if (usuario.id_usuario) {
        const result = await pool.query(
          `SELECT id_carrito FROM CARRITO 
           WHERE id_usuario = $1 AND activo = TRUE
           ORDER BY fecha_creacion DESC LIMIT 1`,
          [usuario.id_usuario]
        );
        id_carrito = result.rows[0]?.id_carrito;
      }
      
      if (!id_carrito && token) {
        const result = await pool.query(
          `SELECT id_carrito FROM CARRITO 
           WHERE token_carrito = $1 AND activo = TRUE`,
          [token]
        );
        id_carrito = result.rows[0]?.id_carrito;
      }
      
      if (!id_carrito) {
        const nuevoToken = token || uuidv4();
        const result = await pool.query(
          `SELECT crear_carrito($1, $2, $3, $4) as id_carrito`,
          [
            usuario.id_usuario || null,
            nuevoToken,
            req.ip || null,
            req.headers['user-agent'] || null
          ]
        );
        id_carrito = result.rows[0].id_carrito;
        
        if (!token) {
          res.setHeader('X-Cart-Token', nuevoToken);
        }
      }
      
      const carrito = await getCarritoCompleto(id_carrito);
      
      res.json({
        carrito: carrito,
        expiracion: carrito?.fecha_expiracion || null,
        horas_restantes: calcularHorasRestantes(carrito?.fecha_expiracion)
      });
    } catch (error) {
      console.error('Error obtener carrito:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // AGREGAR PRODUCTO AL CARRITO
  // =====================================================
  async agregarItem(req, res) {
    try {
      const usuario = req.usuario || {};
      const { id_producto, id_repositorio, cantidad = 1 } = req.body;
      const token = req.headers['x-cart-token'] || req.cookies?.cart_token;
      
      if (!id_producto || !id_repositorio) {
        return res.status(400).json({ message: 'Producto y repositorio son requeridos' });
      }
      
      const productoCheck = await pool.query(
        `SELECT 
           p.id_producto, p.nombre, p.tipo_producto, p.imagen_principal,
           p.precio, p.descuento_porcentaje, p.precio_con_descuento,
           p.aplica_descuento,
           dp.id_disponibilidad, dp.stock, dp.id_repositorio
         FROM PRODUCTO p
         JOIN DISPONIBILIDAD_PRODUCTO dp ON p.id_producto = dp.id_producto
         WHERE p.id_producto = $1 
           AND dp.id_repositorio = $2
           AND p.activo = true
           AND dp.estado = 'disponible'`,
        [id_producto, id_repositorio]
      );
      
      if (productoCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Producto no disponible' });
      }
      
      const producto = productoCheck.rows[0];
      
      if (cantidad > producto.stock) {
        return res.status(400).json({ 
          message: `Stock insuficiente. Disponible: ${producto.stock}` 
        });
      }
      
      // ✅ CALCULAR PRECIO CORRECTAMENTE
      let precioUnitario;
      
      if (producto.aplica_descuento === true && parseFloat(producto.descuento_porcentaje) > 0) {
        precioUnitario = parseFloat(producto.precio_con_descuento) || parseFloat(producto.precio);
      } else {
        precioUnitario = parseFloat(producto.precio);
      }
      
      let subtotal = precioUnitario * cantidad;
      
      let id_carrito = await getOrCreateCarrito(usuario.id_usuario, token, req);
      
      // Verificar si el item ya existe en el carrito
      const existingItem = await pool.query(
        `SELECT id_carrito_item, cantidad 
         FROM CARRITO_ITEM 
         WHERE id_carrito = $1 AND id_producto = $2 AND id_repositorio = $3`,
        [id_carrito, id_producto, id_repositorio]
      );
      
      if (existingItem.rows.length > 0) {
        const nuevaCantidad = existingItem.rows[0].cantidad + cantidad;
        const nuevoSubtotal = precioUnitario * nuevaCantidad;
        
        await pool.query(
          `UPDATE CARRITO_ITEM 
           SET cantidad = $1, subtotal = $2, fecha_actualizacion = CURRENT_TIMESTAMP
           WHERE id_carrito_item = $3`,
          [nuevaCantidad, nuevoSubtotal, existingItem.rows[0].id_carrito_item]
        );
      } else {
        // ✅ INSERT SIN descuento_aplicado
        await pool.query(
          `INSERT INTO CARRITO_ITEM (
            id_carrito, id_disponibilidad, id_producto, id_repositorio,
            cantidad, precio_unitario, subtotal,
            nombre_producto, imagen_producto, tipo_producto
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            id_carrito,
            producto.id_disponibilidad,
            id_producto,
            id_repositorio,
            cantidad,
            precioUnitario,
            subtotal,
            producto.nombre,
            producto.imagen_principal,
            producto.tipo_producto
          ]
        );
      }
      
      await pool.query('SELECT actualizar_totales_carrito($1)', [id_carrito]);
      
      const carrito = await getCarritoCompleto(id_carrito);
      
      res.json({
        message: 'Producto agregado al carrito',
        carrito: carrito
      });
    } catch (error) {
      console.error('Error agregar item:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // ACTUALIZAR CANTIDAD DE ITEM EN CARRITO
  // =====================================================
  async actualizarCantidad(req, res) {
    try {
      const { id_item } = req.params;
      const { cantidad } = req.body;
      const usuario = req.usuario || {};
      const token = req.headers['x-cart-token'] || req.cookies?.cart_token;
      
      if (!cantidad || cantidad < 0) {
        return res.status(400).json({ message: 'Cantidad no válida' });
      }
      
      let id_carrito = await getOrCreateCarrito(usuario.id_usuario, token, req);
      
      const itemCheck = await pool.query(
        `SELECT ci.*, dp.stock 
         FROM CARRITO_ITEM ci
         JOIN DISPONIBILIDAD_PRODUCTO dp ON ci.id_disponibilidad = dp.id_disponibilidad
         WHERE ci.id_carrito_item = $1 AND ci.id_carrito = $2`,
        [id_item, id_carrito]
      );
      
      if (itemCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Item no encontrado' });
      }
      
      const item = itemCheck.rows[0];
      
      if (cantidad === 0) {
        await pool.query(
          'DELETE FROM CARRITO_ITEM WHERE id_carrito_item = $1',
          [id_item]
        );
      } else {
        if (cantidad > item.stock) {
          return res.status(400).json({ 
            message: `Stock insuficiente. Disponible: ${item.stock}` 
          });
        }
        
        const nuevoSubtotal = item.precio_unitario * cantidad;
        
        await pool.query(
          `UPDATE CARRITO_ITEM 
           SET cantidad = $1, subtotal = $2, fecha_actualizacion = CURRENT_TIMESTAMP
           WHERE id_carrito_item = $3`,
          [cantidad, nuevoSubtotal, id_item]
        );
      }
      
      await pool.query('SELECT actualizar_totales_carrito($1)', [id_carrito]);
      
      const carrito = await getCarritoCompleto(id_carrito);
      
      res.json({
        message: cantidad === 0 ? 'Item eliminado del carrito' : 'Cantidad actualizada',
        carrito: carrito
      });
    } catch (error) {
      console.error('Error actualizar cantidad:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // ELIMINAR ITEM DEL CARRITO
  // =====================================================
  async eliminarItem(req, res) {
    try {
      const { id_item } = req.params;
      const usuario = req.usuario || {};
      const token = req.headers['x-cart-token'] || req.cookies?.cart_token;
      
      let id_carrito = await getOrCreateCarrito(usuario.id_usuario, token, req);
      
      const result = await pool.query(
        'DELETE FROM CARRITO_ITEM WHERE id_carrito_item = $1 AND id_carrito = $2 RETURNING id_carrito_item',
        [id_item, id_carrito]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Item no encontrado' });
      }
      
      await pool.query('SELECT actualizar_totales_carrito($1)', [id_carrito]);
      
      const carrito = await getCarritoCompleto(id_carrito);
      
      res.json({
        message: 'Item eliminado del carrito',
        carrito: carrito
      });
    } catch (error) {
      console.error('Error eliminar item:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // VACIAR CARRITO COMPLETO
  // =====================================================
  async vaciarCarrito(req, res) {
    try {
      const usuario = req.usuario || {};
      const token = req.headers['x-cart-token'] || req.cookies?.cart_token;
      
      let id_carrito = await getOrCreateCarrito(usuario.id_usuario, token, req);
      
      await pool.query(
        'DELETE FROM CARRITO_ITEM WHERE id_carrito = $1',
        [id_carrito]
      );
      
      await pool.query('SELECT actualizar_totales_carrito($1)', [id_carrito]);
      
      const carrito = await getCarritoCompleto(id_carrito);
      
      res.json({
        message: 'Carrito vaciado exitosamente',
        carrito: carrito
      });
    } catch (error) {
      console.error('Error vaciar carrito:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // CONTAR ITEMS EN EL CARRITO
  // =====================================================
  async contarItems(req, res) {
    try {
      const usuario = req.usuario || {};
      const token = req.headers['x-cart-token'] || req.cookies?.cart_token;
      
      if (!usuario.id_usuario && !token) {
        return res.json({ count: 0 });
      }
      
      let query = `
        SELECT COALESCE(SUM(cantidad), 0) as total_items
        FROM CARRITO_ITEM ci
        JOIN CARRITO c ON ci.id_carrito = c.id_carrito
        WHERE c.activo = TRUE
      `;
      const params = [];
      
      if (usuario.id_usuario) {
        query += ` AND c.id_usuario = $${params.length + 1}`;
        params.push(usuario.id_usuario);
      } else if (token) {
        query += ` AND c.token_carrito = $${params.length + 1}`;
        params.push(token);
      }
      
      const result = await pool.query(query, params);
      
      res.json({ count: parseInt(result.rows[0]?.total_items || 0) });
    } catch (error) {
      console.error('Error contar items:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

export default new CarritoController();