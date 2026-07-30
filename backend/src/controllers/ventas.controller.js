
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';

// ============================================
// 1. CREAR VENTA (desde el carrito)
// ============================================
export const crearVenta = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { 
      id_cliente, 
      items, 
      monto_total, 
      tipo_entrega = 'recojo_local',
      direccion_entrega,
      ciudad_entrega,
      departamento_entrega,
      referencia_entrega,
      observaciones
    } = req.body;

    // Validaciones básicas
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El carrito está vacío'
      });
    }

    if (!id_cliente) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente es requerido'
      });
    }

    // Verificar que el cliente existe
    const clienteCheck = await client.query(
      'SELECT id_usuario FROM USUARIO WHERE id_usuario = $1 AND estado = $2',
      [id_cliente, 'activo']
    );

    if (clienteCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado o inactivo'
      });
    }

    // Obtener el repositorio del primer item (todos deben ser del mismo repositorio)
    const primerItem = items[0];
    const id_repositorio = primerItem.id_repositorio;

    // Verificar que todos los items son del mismo repositorio
    const repositorios = new Set(items.map(item => item.id_repositorio));
    if (repositorios.size > 1) {
      return res.status(400).json({
        success: false,
        message: 'Todos los productos deben ser del mismo repositorio'
      });
    }

    // Verificar que el repositorio existe
    const repositorioCheck = await client.query(
      'SELECT id_repositorio, nombre FROM REPOSITORIO WHERE id_repositorio = $1 AND activo = $2',
      [id_repositorio, true]
    );

    if (repositorioCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Repositorio no encontrado'
      });
    }

    // Iniciar transacción
    await client.query('BEGIN');

    // Crear la venta
    const ventaResult = await client.query(
      `INSERT INTO VENTA (
        id_cliente, 
        id_repositorio, 
        tipo_entrega, 
        monto_total,
        direccion_entrega,
        ciudad_entrega,
        departamento_entrega,
        referencia_entrega,
        observaciones,
        estado_venta,
        fecha_venta
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      RETURNING id_venta`,
      [
        id_cliente,
        id_repositorio,
        tipo_entrega,
        monto_total,
        direccion_entrega || null,
        ciudad_entrega || null,
        departamento_entrega || null,
        referencia_entrega || null,
        observaciones || null,
        'pendiente_pago'
      ]
    );

    const id_venta = ventaResult.rows[0].id_venta;

    // Insertar los detalles de la venta
    for (const item of items) {
      // Verificar stock disponible
      const stockCheck = await client.query(
        `SELECT stock, id_disponibilidad 
         FROM DISPONIBILIDAD_PRODUCTO 
         WHERE id_producto = $1 AND id_repositorio = $2`,
        [item.id_producto, id_repositorio]
      );

      if (stockCheck.rows.length === 0) {
        throw new Error(`Producto ${item.nombre_producto || item.id_producto} no disponible en este repositorio`);
      }

      const disponibilidad = stockCheck.rows[0];
      
      if (disponibilidad.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para ${item.nombre_producto || item.id_producto}. Disponible: ${disponibilidad.stock}`);
      }

      // Reducir stock
      await client.query(
        `UPDATE DISPONIBILIDAD_PRODUCTO 
         SET stock = stock - $1, 
             ultima_actualizacion = CURRENT_TIMESTAMP,
             actualizado_por = $2
         WHERE id_disponibilidad = $3`,
        [item.cantidad, id_cliente, disponibilidad.id_disponibilidad]
      );

      // Insertar detalle de venta
      await client.query(
        `INSERT INTO DETALLE_VENTA (
          id_venta,
          id_disponibilidad,
          cantidad,
          precio_unitario,
          subtotal,
          nombre_producto,
          tipo_producto,
          imagen_producto
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          id_venta,
          disponibilidad.id_disponibilidad,
          item.cantidad,
          item.precio_unitario,
          item.subtotal || (item.cantidad * item.precio_unitario),
          item.nombre_producto || null,
          item.tipo_producto || null,
          item.imagen_producto || null
        ]
      );
    }

    // Generar código de transacción para el pago QR
    const codigo_transaccion = 'QR-' + Date.now().toString(36).toUpperCase() + '-' + uuidv4().slice(0, 6).toUpperCase();

    // Crear registro de pago QR
    const qrResult = await client.query(
      `INSERT INTO PAGO_QR (
        id_venta,
        monto,
        moneda,
        glosa,
        codigo_transaccion,
        fecha_generacion,
        fecha_expiracion,
        estado_pago
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '15 minutes', $6)
      RETURNING id_pago, codigo_transaccion`,
      [
        id_venta,
        monto_total,
        'PEN',
        `Pago de venta #${id_venta}`,
        codigo_transaccion,
        'generado'
      ]
    );

    // Limpiar el carrito del usuario
    if (req.body.id_carrito) {
      await client.query(
        `UPDATE CARRITO SET activo = FALSE WHERE id_carrito = $1`,
        [req.body.id_carrito]
      );
    }

    // Confirmar transacción
    await client.query('COMMIT');

    // Obtener la venta completa para la respuesta
    const ventaCompleta = await client.query(
      `SELECT 
        v.*,
        u.email as cliente_email,
        pf.nombre as cliente_nombre,
        pf.apellido_paterno as cliente_apellido,
        r.nombre as repositorio_nombre,
        r.sigla as repositorio_sigla,
        pq.codigo_transaccion,
        pq.estado_pago,
        pq.fecha_expiracion
      FROM VENTA v
      JOIN USUARIO u ON v.id_cliente = u.id_usuario
      JOIN PERFIL_USUARIO pf ON u.id_usuario = pf.id_usuario
      JOIN REPOSITORIO r ON v.id_repositorio = r.id_repositorio
      LEFT JOIN PAGO_QR pq ON v.id_venta = pq.id_venta
      WHERE v.id_venta = $1`,
      [id_venta]
    );

    // Obtener los detalles de la venta
    const detalles = await client.query(
      `SELECT 
        dv.*,
        dp.stock as stock_actual
      FROM DETALLE_VENTA dv
      JOIN DISPONIBILIDAD_PRODUCTO dp ON dv.id_disponibilidad = dp.id_disponibilidad
      WHERE dv.id_venta = $1`,
      [id_venta]
    );

    res.status(201).json({
      success: true,
      message: 'Venta creada exitosamente',
      venta: {
        ...ventaCompleta.rows[0],
        detalles: detalles.rows
      },
      pago_qr: {
        id_pago: qrResult.rows[0].id_pago,
        codigo_transaccion: qrResult.rows[0].codigo_transaccion,
        monto: monto_total,
        fecha_expiracion: new Date(Date.now() + 15 * 60000).toISOString(),
        qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${codigo_transaccion}`
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear venta:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al procesar la venta'
    });
  } finally {
    client.release();
  }
};

// ============================================
// 2. OBTENER VENTAS DE UN CLIENTE
// ============================================
export const obtenerVentasCliente = async (req, res) => {
  try {
    const { id_cliente } = req.params;
    const { limit = 20, offset = 0, estado } = req.query;

    let query = `
      SELECT 
        v.*,
        r.nombre as repositorio_nombre,
        r.sigla as repositorio_sigla,
        pq.estado_pago,
        pq.codigo_transaccion,
        e.estado_envio,
        e.numero_guia,
        COUNT(dv.id_detalle) as total_productos
      FROM VENTA v
      JOIN REPOSITORIO r ON v.id_repositorio = r.id_repositorio
      LEFT JOIN PAGO_QR pq ON v.id_venta = pq.id_venta
      LEFT JOIN ENVIO e ON v.id_venta = e.id_venta
      LEFT JOIN DETALLE_VENTA dv ON v.id_venta = dv.id_venta
      WHERE v.id_cliente = $1
    `;

    const params = [id_cliente];
    let paramIndex = 2;

    if (estado) {
      query += ` AND v.estado_venta = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }

    query += `
      GROUP BY v.id_venta, r.nombre, r.sigla, pq.estado_pago, pq.codigo_transaccion, e.estado_envio, e.numero_guia
      ORDER BY v.fecha_venta DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      ventas: result.rows,
      total: result.rowCount
    });

  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las ventas'
    });
  }
};

// ============================================
// 3. OBTENER DETALLE DE UNA VENTA
// ============================================
export const obtenerVentaPorId = async (req, res) => {
  try {
    const { id_venta } = req.params;

    const ventaResult = await pool.query(
      `SELECT 
        v.*,
        u.id_usuario as cliente_id,
        u.email as cliente_email,
        pf.nombre as cliente_nombre,
        pf.apellido_paterno as cliente_apellido,
        pf.celular as cliente_celular,
        pf.direccion_principal as cliente_direccion,
        r.id_repositorio,
        r.nombre as repositorio_nombre,
        r.sigla as repositorio_sigla,
        r.direccion as repositorio_direccion,
        r.telefono as repositorio_telefono,
        pq.id_pago,
        pq.codigo_transaccion,
        pq.estado_pago,
        pq.fecha_pago,
        pq.imagen_qr,
        e.id_envio,
        e.estado_envio,
        e.numero_guia,
        e.empresa_transporte,
        e.fecha_estimada_entrega
      FROM VENTA v
      JOIN USUARIO u ON v.id_cliente = u.id_usuario
      JOIN PERFIL_USUARIO pf ON u.id_usuario = pf.id_usuario
      JOIN REPOSITORIO r ON v.id_repositorio = r.id_repositorio
      LEFT JOIN PAGO_QR pq ON v.id_venta = pq.id_venta
      LEFT JOIN ENVIO e ON v.id_venta = e.id_venta
      WHERE v.id_venta = $1`,
      [id_venta]
    );

    if (ventaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    // Obtener detalles de la venta
    const detallesResult = await pool.query(
      `SELECT 
        dv.*,
        dp.stock as stock_actual,
        p.nombre as producto_nombre_completo,
        p.tipo_producto,
        p.imagen_principal
      FROM DETALLE_VENTA dv
      JOIN DISPONIBILIDAD_PRODUCTO dp ON dv.id_disponibilidad = dp.id_disponibilidad
      JOIN PRODUCTO p ON dp.id_producto = p.id_producto
      WHERE dv.id_venta = $1`,
      [id_venta]
    );

    res.json({
      success: true,
      venta: {
        ...ventaResult.rows[0],
        detalles: detallesResult.rows
      }
    });

  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la venta'
    });
  }
};

// ============================================
// 4. ACTUALIZAR ESTADO DE VENTA
// ============================================
export const actualizarEstadoVenta = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id_venta } = req.params;
    const { estado, observaciones } = req.body;
    const id_usuario = req.usuario?.id_usuario;

    // Validar estado permitido
    const estadosPermitidos = [
      'pendiente_pago', 'pagado', 'preparando', 
      'enviado', 'entregado', 'cancelado', 'verificando'
    ];

    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido'
      });
    }

    await client.query('BEGIN');

    // Verificar que la venta existe
    const ventaCheck = await client.query(
      'SELECT id_venta, estado_venta FROM VENTA WHERE id_venta = $1',
      [id_venta]
    );

    if (ventaCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    const estadoAnterior = ventaCheck.rows[0].estado_venta;

    // Actualizar estado de la venta
    await client.query(
      `UPDATE VENTA 
       SET estado_venta = $1, 
           fecha_actualizacion = CURRENT_TIMESTAMP,
           observaciones = COALESCE($2, observaciones)
       WHERE id_venta = $3`,
      [estado, observaciones, id_venta]
    );

    // Si el estado es 'pagado', actualizar el pago
    if (estado === 'pagado') {
      await client.query(
        `UPDATE PAGO_QR 
         SET estado_pago = 'pagado',
             fecha_pago = CURRENT_TIMESTAMP,
             confirmado_por = $1,
             fecha_confirmacion = CURRENT_TIMESTAMP
         WHERE id_venta = $2`,
        [id_usuario, id_venta]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Estado de venta actualizado exitosamente',
      estado_anterior: estadoAnterior,
      estado_nuevo: estado
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar estado de venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado de la venta'
    });
  } finally {
    client.release();
  }
};

// ============================================
// 5. CONFIRMAR PAGO QR (para responsables)
// ============================================
export const confirmarPagoQR = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id_venta } = req.params;
    const id_usuario = req.usuario?.id_usuario;

    await client.query('BEGIN');

    // Verificar que la venta existe
    const ventaCheck = await client.query(
      `SELECT v.id_venta, v.estado_venta, pq.estado_pago
       FROM VENTA v
       LEFT JOIN PAGO_QR pq ON v.id_venta = pq.id_venta
       WHERE v.id_venta = $1`,
      [id_venta]
    );

    if (ventaCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    const venta = ventaCheck.rows[0];

    if (venta.estado_venta === 'pagado') {
      return res.status(400).json({
        success: false,
        message: 'Esta venta ya está pagada'
      });
    }

    if (venta.estado_venta !== 'pendiente_pago' && venta.estado_venta !== 'verificando') {
      return res.status(400).json({
        success: false,
        message: `No se puede confirmar pago para una venta en estado ${venta.estado_venta}`
      });
    }

    // Actualizar estado de venta a 'pagado'
    await client.query(
      `UPDATE VENTA 
       SET estado_venta = 'pagado', 
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_venta = $1`,
      [id_venta]
    );

    // Actualizar estado de pago
    await client.query(
      `UPDATE PAGO_QR 
       SET estado_pago = 'pagado',
           fecha_pago = CURRENT_TIMESTAMP,
           confirmado_por = $1,
           fecha_confirmacion = CURRENT_TIMESTAMP
       WHERE id_venta = $2`,
      [id_usuario, id_venta]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Pago confirmado exitosamente',
      venta_id: id_venta,
      estado: 'pagado'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al confirmar pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al confirmar el pago'
    });
  } finally {
    client.release();
  }
};

// ============================================
// 6. OBTENER VENTAS POR REPOSITORIO (para responsables)
// ============================================
export const obtenerVentasRepositorio = async (req, res) => {
  try {
    const { id_repositorio } = req.params;
    const { limit = 20, offset = 0, estado } = req.query;

    let query = `
      SELECT 
        v.id_venta,
        v.fecha_venta,
        v.monto_total,
        v.estado_venta,
        v.tipo_entrega,
        u.id_usuario as cliente_id,
        u.email as cliente_email,
        pf.nombre as cliente_nombre,
        pf.apellido_paterno as cliente_apellido,
        pf.celular as cliente_celular,
        pf.direccion_principal as cliente_direccion,
        pq.estado_pago,
        pq.codigo_transaccion,
        COUNT(dv.id_detalle) as total_productos
      FROM VENTA v
      JOIN USUARIO u ON v.id_cliente = u.id_usuario
      JOIN PERFIL_USUARIO pf ON u.id_usuario = pf.id_usuario
      LEFT JOIN PAGO_QR pq ON v.id_venta = pq.id_venta
      LEFT JOIN DETALLE_VENTA dv ON v.id_venta = dv.id_venta
      WHERE v.id_repositorio = $1
    `;

    const params = [id_repositorio];
    let paramIndex = 2;

    if (estado) {
      query += ` AND v.estado_venta = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }

    query += `
      GROUP BY v.id_venta, u.id_usuario, u.email, pf.nombre, pf.apellido_paterno, 
               pf.celular, pf.direccion_principal, pq.estado_pago, pq.codigo_transaccion
      ORDER BY v.fecha_venta DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      ventas: result.rows,
      total: result.rowCount
    });

  } catch (error) {
    console.error('Error al obtener ventas del repositorio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las ventas'
    });
  }
};
// ============================================
// 7. OBTENER TODAS LAS VENTAS (para admin)
// ============================================
export const obtenerTodasLasVentas = async (req, res) => {
  try {
    const { limit = 100, offset = 0, estado } = req.query;

    let query = `
      SELECT 
        v.id_venta,
        v.fecha_venta,
        v.monto_total,
        v.estado_venta,
        v.tipo_entrega,
        v.direccion_entrega,
        v.observaciones,
        v.fecha_actualizacion,
        u.id_usuario as cliente_id,
        u.email as cliente_email,
        pf.nombre as cliente_nombre,
        pf.apellido_paterno as cliente_apellido,
        pf.celular as cliente_celular,
        pf.direccion_principal as cliente_direccion,
        r.id_repositorio,
        r.nombre as repositorio_nombre,
        r.sigla as repositorio_sigla,
        r.direccion as repositorio_direccion,
        pq.id_pago,
        pq.codigo_transaccion,
        pq.estado_pago,
        pq.fecha_pago,
        pq.imagen_qr,
        e.id_envio,
        e.estado_envio,
        e.numero_guia,
        e.empresa_transporte,
        e.fecha_estimada_entrega,
        COUNT(dv.id_detalle) as total_productos,
        COALESCE(SUM(dv.subtotal), 0) as total_venta
      FROM VENTA v
      JOIN USUARIO u ON v.id_cliente = u.id_usuario
      LEFT JOIN PERFIL_USUARIO pf ON u.id_usuario = pf.id_usuario
      JOIN REPOSITORIO r ON v.id_repositorio = r.id_repositorio
      LEFT JOIN PAGO_QR pq ON v.id_venta = pq.id_venta
      LEFT JOIN ENVIO e ON v.id_venta = e.id_venta
      LEFT JOIN DETALLE_VENTA dv ON v.id_venta = dv.id_venta
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (estado && estado !== 'todos') {
      query += ` AND v.estado_venta = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }

    query += `
      GROUP BY v.id_venta, u.id_usuario, u.email, pf.nombre, pf.apellido_paterno, 
               pf.celular, pf.direccion_principal, r.id_repositorio, r.nombre, 
               r.sigla, r.direccion, pq.id_pago, pq.codigo_transaccion, 
               pq.estado_pago, pq.fecha_pago, pq.imagen_qr, e.id_envio, 
               e.estado_envio, e.numero_guia, e.empresa_transporte, 
               e.fecha_estimada_entrega
      ORDER BY v.fecha_venta DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Obtener los detalles de cada venta
    const ventasConDetalles = [];
    for (const venta of result.rows) {
      const detalles = await pool.query(
        `SELECT 
          dv.*,
          dp.stock as stock_actual,
          p.nombre as producto_nombre_completo,
          p.tipo_producto,
          p.imagen_principal
        FROM DETALLE_VENTA dv
        JOIN DISPONIBILIDAD_PRODUCTO dp ON dv.id_disponibilidad = dp.id_disponibilidad
        JOIN PRODUCTO p ON dp.id_producto = p.id_producto
        WHERE dv.id_venta = $1`,
        [venta.id_venta]
      );
      
      ventasConDetalles.push({
        ...venta,
        detalles: detalles.rows
      });
    }

    res.json({
      success: true,
      ventas: ventasConDetalles,
      total: result.rowCount,
      total_general: result.rowCount
    });

  } catch (error) {
    console.error('Error al obtener todas las ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las ventas'
    });
  }
};