import pool from '../db.js';

class TicketMuseoController {
 // =====================================================
// LISTAR TICKETS DE TODOS LOS MUSEOS (PÚBLICO)
// =====================================================
async listarTicketsMuseos(req, res) {
  try {
    // ✅ El usuario puede ser null para peticiones públicas
    const usuario = req.usuario || {};
    
    let query = `
      SELECT 
        r.id_repositorio,
        r.nombre AS nombre_repositorio,
        r.sigla,
        r.direccion,
        r.telefono,
        r.departamento,
        r.ubicacion_gps,
        r.portada_representativa,
        r.logo_repositorio,
        r.activo AS repositorio_activo,
        p.id_producto,
        p.nombre AS nombre_ticket,
        p.descripcion_general,
        p.descripcion_especifica,
        p.imagen_principal,
        p.activo AS producto_activo,
        t.ubicacion AS ticket_ubicacion,
        t.descripcion_adicional,
        t.fecha_evento,
        t.hora_inicio,
        t.hora_fin,
        tr.id_ticket_repositorio,
        COALESCE(tr.precio_especial, p.precio) AS precio,
        COALESCE(tr.descuento_especial, 0) AS descuento,
        tr.venta_habilitada,
        tr.fecha_actualizacion,
        CASE 
          WHEN COALESCE(tr.descuento_especial, 0) > 0 
          THEN COALESCE(tr.precio_especial, p.precio) - (COALESCE(tr.precio_especial, p.precio) * COALESCE(tr.descuento_especial, 0) / 100)
          ELSE COALESCE(tr.precio_especial, p.precio)
        END AS precio_con_descuento,
        CASE 
          WHEN tr.venta_habilitada = TRUE THEN 'disponible'
          WHEN tr.venta_habilitada = FALSE THEN 'deshabilitado'
          WHEN tr.id_ticket_repositorio IS NULL THEN 'sin_ticket'
          ELSE 'no_disponible'
        END AS estado_ticket,
        CASE 
          WHEN EXTRACT(DOW FROM CURRENT_DATE) = 0 THEN 'cerrado_domingo'
          WHEN tr.venta_habilitada = TRUE THEN 'disponible'
          WHEN tr.id_ticket_repositorio IS NULL THEN 'sin_ticket'
          ELSE 'no_disponible'
        END AS disponibilidad_hoy
      FROM REPOSITORIO r
      LEFT JOIN TICKET_REPOSITORIO tr ON r.id_repositorio = tr.id_repositorio
      LEFT JOIN PRODUCTO p ON tr.id_producto = p.id_producto
      LEFT JOIN TICKET t ON p.id_producto = t.id_producto
      WHERE r.activo = true
    `;

    const params = [];

    // ✅ Si es responsable, solo ver sus repositorios asignados (solo si está autenticado)
    if (usuario.rol === 'responsable' && usuario.id_repositorio_asignado) {
      query += ` AND r.id_repositorio = $${params.length + 1}`;
      params.push(usuario.id_repositorio_asignado);
    }

    query += ` ORDER BY r.nombre ASC`;

    const result = await pool.query(query, params);

    // Procesar cada ticket para agregar información de disponibilidad
    const tickets = result.rows.map(ticket => {
      const hoy = new Date();
      const esDomingo = hoy.getDay() === 0;
      const disponible = ticket.venta_habilitada && !esDomingo;

      return {
        ...ticket,
        disponible_para_venta: {
          disponible: disponible,
          razon: esDomingo ? 'Cerrado los domingos' : 
                 !ticket.venta_habilitada ? 'Venta deshabilitada' : 'Disponible',
          codigo: esDomingo ? 'cerrado_domingo' :
                  !ticket.venta_habilitada ? 'deshabilitado' : 'disponible'
        }
      };
    });

    res.json({
      tickets: tickets,
      total: tickets.length,
      rol: usuario.rol || 'publico'
    });
  } catch (error) {
    console.error('Error listar tickets de museos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

  // =====================================================
  // OBTENER TICKET DE UN MUSEO ESPECÍFICO
  // =====================================================
  async obtenerTicketMuseo(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || {};

      const result = await pool.query(
        `SELECT 
          r.id_repositorio,
          r.nombre AS nombre_repositorio,
          r.sigla,
          r.direccion,
          r.telefono,
          r.departamento,
          r.ubicacion_gps,
          r.portada_representativa,
          r.logo_repositorio,
          r.activo AS repositorio_activo,
          p.id_producto,
          p.nombre AS nombre_ticket,
          p.descripcion_general,
          p.descripcion_especifica,
          p.imagen_principal,
          p.activo AS producto_activo,
          t.ubicacion AS ticket_ubicacion,
          t.descripcion_adicional,
          t.fecha_evento,
          t.hora_inicio,
          t.hora_fin,
          tr.id_ticket_repositorio,
          COALESCE(tr.precio_especial, p.precio) AS precio,
          COALESCE(tr.descuento_especial, 0) AS descuento,
          tr.venta_habilitada,
          tr.fecha_actualizacion,
          CASE 
            WHEN COALESCE(tr.descuento_especial, 0) > 0 
            THEN COALESCE(tr.precio_especial, p.precio) - (COALESCE(tr.precio_especial, p.precio) * COALESCE(tr.descuento_especial, 0) / 100)
            ELSE COALESCE(tr.precio_especial, p.precio)
          END AS precio_con_descuento
        FROM REPOSITORIO r
        LEFT JOIN TICKET_REPOSITORIO tr ON r.id_repositorio = tr.id_repositorio
        LEFT JOIN PRODUCTO p ON tr.id_producto = p.id_producto
        LEFT JOIN TICKET t ON p.id_producto = t.id_producto
        WHERE r.id_repositorio = $1 AND r.activo = true`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Museo no encontrado' });
      }

      const ticket = result.rows[0];
      const hoy = new Date();
      const esDomingo = hoy.getDay() === 0;
      const disponible = ticket.venta_habilitada && !esDomingo;

      ticket.disponible_para_venta = {
        disponible: disponible,
        razon: esDomingo ? 'Cerrado los domingos' : 
               !ticket.venta_habilitada ? 'Venta deshabilitada' : 'Disponible',
        codigo: esDomingo ? 'cerrado_domingo' :
                !ticket.venta_habilitada ? 'deshabilitado' : 'disponible'
      };

      res.json({ ticket });
    } catch (error) {
      console.error('Error obtener ticket de museo:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // ACTUALIZAR TICKET DE UN MUSEO
  // =====================================================
  async actualizarTicketMuseo(req, res) {
    try {
      const { id } = req.params;
      const { precio, descuento, venta_habilitada } = req.body;
      const usuario = req.usuario || {};

      // Verificar que el repositorio existe y está activo
      const repositorioExistente = await pool.query(
        'SELECT id_repositorio, nombre FROM REPOSITORIO WHERE id_repositorio = $1 AND activo = true',
        [id]
      );

      if (repositorioExistente.rows.length === 0) {
        return res.status(404).json({ message: 'Museo no encontrado' });
      }

      // Construir la consulta de actualización dinámicamente
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (precio !== undefined && precio !== null) {
        updates.push(`precio_especial = $${paramCount++}`);
        values.push(precio);
      }
      if (descuento !== undefined && descuento !== null) {
        updates.push(`descuento_especial = $${paramCount++}`);
        values.push(descuento);
      }
      if (venta_habilitada !== undefined && venta_habilitada !== null) {
        updates.push(`venta_habilitada = $${paramCount++}`);
        values.push(venta_habilitada);
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: 'No se enviaron campos para actualizar' });
      }

      // Agregar actualizado_por y fecha_actualizacion
      updates.push(`actualizado_por = $${paramCount++}`);
      values.push(usuario.id_usuario || null);
      updates.push(`fecha_actualizacion = CURRENT_TIMESTAMP`);

      values.push(id);

      // Verificar si existe el ticket_repositorio
      const existe = await pool.query(
        'SELECT id_ticket_repositorio, id_producto FROM TICKET_REPOSITORIO WHERE id_repositorio = $1',
        [id]
      );

      let result;

      if (existe.rows.length === 0) {
        // Crear ticket por defecto usando la función de BD
        await pool.query(
          'SELECT crear_ticket_defecto_repositorio($1, $2)',
          [id, usuario.id_usuario || null]
        );
        
        // Ahora actualizar
        const query = `
          UPDATE TICKET_REPOSITORIO 
          SET ${updates.join(', ')}
          WHERE id_repositorio = $${paramCount}
          RETURNING 
            id_ticket_repositorio,
            precio_especial,
            descuento_especial,
            venta_habilitada
        `;
        
        result = await pool.query(query, values);
      } else {
        const query = `
          UPDATE TICKET_REPOSITORIO 
          SET ${updates.join(', ')}
          WHERE id_repositorio = $${paramCount}
          RETURNING 
            id_ticket_repositorio,
            precio_especial,
            descuento_especial,
            venta_habilitada
        `;
        
        result = await pool.query(query, values);
      }

      // Si se actualizó el precio, actualizar también en PRODUCTO
      if (precio !== undefined && precio !== null && existe.rows.length > 0) {
        const idProducto = existe.rows[0].id_producto;
        await pool.query(
          'UPDATE PRODUCTO SET precio = $1 WHERE id_producto = $2',
          [precio, idProducto]
        );
      }

      // Registrar en bitácora
      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_nuevos)
         VALUES ($1, 'actualizar_ticket_museo', 'TICKET_REPOSITORIO', $2, $3::jsonb)`,
        [
          usuario.id_usuario || null,
          id,
          JSON.stringify({ 
            precio: precio,
            descuento: descuento,
            venta_habilitada: venta_habilitada
          })
        ]
      );

      res.json({
        message: 'Ticket actualizado exitosamente',
        ticket: result.rows[0] || { message: 'Ticket creado y actualizado' }
      });
    } catch (error) {
      console.error('Error actualizar ticket de museo:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // HABILITAR/DESHABILITAR VENTA
  // =====================================================
  async toggleVenta(req, res) {
    try {
      const { id } = req.params;
      const { habilitar } = req.body;
      const usuario = req.usuario || {};

      if (habilitar === undefined || habilitar === null) {
        return res.status(400).json({ message: 'El campo "habilitar" es requerido' });
      }

      // Verificar que el repositorio existe
      const existe = await pool.query(
        'SELECT id_repositorio FROM REPOSITORIO WHERE id_repositorio = $1 AND activo = true',
        [id]
      );

      if (existe.rows.length === 0) {
        return res.status(404).json({ message: 'Museo no encontrado' });
      }

      // Usar la función de BD para toggle
      const result = await pool.query(
        'SELECT * FROM toggle_venta_ticket_repositorio($1, $2, $3)',
        [id, habilitar, usuario.id_usuario || null]
      );

      // Registrar en bitácora
      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_nuevos)
         VALUES ($1, 'toggle_venta_ticket', 'TICKET_REPOSITORIO', $2, $3::jsonb)`,
        [
          usuario.id_usuario || null,
          id,
          JSON.stringify({ 
            venta_habilitada: habilitar,
            accion: habilitar ? 'Habilitar venta' : 'Deshabilitar venta'
          })
        ]
      );

      res.json({
        message: result.rows[0]?.mensaje || (habilitar ? 'Venta habilitada' : 'Venta deshabilitada'),
        venta_habilitada: result.rows[0]?.venta_habilitada || habilitar
      });
    } catch (error) {
      console.error('Error toggle venta:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // LISTAR TICKETS DISPONIBLES PARA HOY (PÚBLICO)
  // =====================================================
  async listarDisponiblesHoy(req, res) {
    try {
      const hoy = new Date();
      const esDomingo = hoy.getDay() === 0;

      // Si es domingo, no hay tickets disponibles
      if (esDomingo) {
        return res.json({
          tickets: [],
          total: 0,
          mensaje: 'Los museos están cerrados los domingos',
          disponible: false
        });
      }

      const result = await pool.query(
        `SELECT 
          r.id_repositorio,
          r.nombre AS nombre_repositorio,
          r.sigla,
          r.direccion,
          r.telefono,
          r.departamento,
          r.ubicacion_gps,
          r.portada_representativa,
          r.logo_repositorio,
          p.id_producto,
          p.nombre AS nombre_ticket,
          p.descripcion_general,
          p.imagen_principal,
          COALESCE(tr.precio_especial, p.precio) AS precio,
          COALESCE(tr.descuento_especial, 0) AS descuento,
          tr.venta_habilitada,
          CASE 
            WHEN COALESCE(tr.descuento_especial, 0) > 0 
            THEN COALESCE(tr.precio_especial, p.precio) - (COALESCE(tr.precio_especial, p.precio) * COALESCE(tr.descuento_especial, 0) / 100)
            ELSE COALESCE(tr.precio_especial, p.precio)
          END AS precio_con_descuento,
          t.fecha_evento,
          t.hora_inicio,
          t.hora_fin
        FROM REPOSITORIO r
        JOIN TICKET_REPOSITORIO tr ON r.id_repositorio = tr.id_repositorio
        JOIN PRODUCTO p ON tr.id_producto = p.id_producto
        JOIN TICKET t ON p.id_producto = t.id_producto
        WHERE r.activo = true 
          AND tr.venta_habilitada = true
          AND p.activo = true
        ORDER BY r.nombre ASC`
      );

      const tickets = result.rows.map(ticket => ({
        ...ticket,
        disponible_para_venta: {
          disponible: true,
          razon: 'Disponible ahora',
          codigo: 'disponible',
          horario: `${ticket.hora_inicio} - ${ticket.hora_fin}`
        }
      }));

      res.json({
        tickets,
        total: tickets.length,
        fecha: hoy.toISOString().split('T')[0],
        dia: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][hoy.getDay()]
      });
    } catch (error) {
      console.error('Error listar tickets disponibles hoy:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // LISTAR REPOSITORIOS CON TICKETS (PÚBLICO)
  // =====================================================
  async listarRepositoriosConTickets(req, res) {
    try {
      const result = await pool.query(
        `SELECT 
          r.id_repositorio,
          r.nombre,
          r.sigla,
          r.direccion,
          r.telefono,
          r.departamento,
          r.ubicacion_gps,
          r.portada_representativa,
          r.logo_repositorio,
          r.activo,
          COALESCE(tr.precio_especial, p.precio) AS precio_ticket,
          tr.venta_habilitada,
          tr.descuento_especial,
          CASE 
            WHEN tr.venta_habilitada = TRUE THEN 'disponible'
            ELSE 'no_disponible'
          END AS estado_ticket
        FROM REPOSITORIO r
        LEFT JOIN TICKET_REPOSITORIO tr ON r.id_repositorio = tr.id_repositorio
        LEFT JOIN PRODUCTO p ON tr.id_producto = p.id_producto
        WHERE r.activo = true
        ORDER BY r.nombre ASC`
      );

      res.json({
        repositorios: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error listar repositorios con tickets:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

export default new TicketMuseoController();