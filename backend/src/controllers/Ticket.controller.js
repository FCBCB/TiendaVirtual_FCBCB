import pool from '../db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── FUNCIÓN INDEPENDIENTE PARA VERIFICAR DISPONIBILIDAD ──────────────────
function verificarDisponibilidadTicket(ticket) {
  const ahora = new Date();
  const fechaEvento = new Date(ticket.fecha_evento);
  const diaSemana = fechaEvento.getDay(); // 0 = Domingo, 6 = Sábado
  
  // Verificar si es domingo (cerrado)
  if (diaSemana === 0) {
    return {
      disponible: false,
      razon: 'Cerrado los domingos',
      codigo: 'cerrado_domingo'
    };
  }
  
  // Verificar si la fecha ya pasó
  if (fechaEvento < new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())) {
    return {
      disponible: false,
      razon: 'Evento finalizado',
      codigo: 'pasado'
    };
  }
  
  // Verificar si es hoy y la hora actual
  if (fechaEvento.getFullYear() === ahora.getFullYear() &&
      fechaEvento.getMonth() === ahora.getMonth() &&
      fechaEvento.getDate() === ahora.getDate()) {
    
    const horaInicio = ticket.hora_inicio;
    const horaFin = ticket.hora_fin;
    const horaActual = ahora.getHours() + ':' + String(ahora.getMinutes()).padStart(2, '0');
    
    // Si ya pasó la hora de cierre
    if (horaActual > horaFin) {
      return {
        disponible: false,
        razon: 'Evento finalizado por hoy',
        codigo: 'pasado'
      };
    }
    
    // Si aún no ha comenzado
    if (horaActual < horaInicio) {
      return {
        disponible: true,
        razon: 'Próximamente',
        codigo: 'proximamente',
        horario: `${horaInicio} - ${horaFin}`
      };
    }
    
    // Está dentro del horario
    return {
      disponible: true,
      razon: 'Disponible ahora',
      codigo: 'disponible',
      horario: `${horaInicio} - ${horaFin}`
    };
  }
  
  // Es un día futuro
  return {
    disponible: true,
    razon: 'Próximamente',
    codigo: 'proximamente',
    horario: `${ticket.hora_inicio} - ${ticket.hora_fin}`
  };
}

// ─── CLASE TICKET CONTROLLER ──────────────────────────────────────────────
class TicketController {
  // =====================================================
  // LISTAR TICKETS CON SUS REPOSITORIOS Y STOCK
  // =====================================================
  async listar(req, res) {
    try {
      const usuario = req.usuario || {};
      
      let query = `
        SELECT 
          p.id_producto,
          p.tipo_producto,
          p.nombre,
          p.descripcion_general,
          p.descripcion_especifica,
          p.precio,
          p.imagen_principal,
          p.activo,
          p.fecha_creacion,
          p.descuento_porcentaje,
          p.precio_con_descuento,
          p.aplica_descuento,
          t.ubicacion,
          t.descripcion_adicional,
          t.fecha_evento,
          t.hora_inicio,
          t.hora_fin,
          t.capacidad_maxima,
          t.asientos_disponibles,
          COALESCE(SUM(dp.stock), 0) as stock_total,
          CASE 
            WHEN t.fecha_evento < CURRENT_DATE THEN 'pasado'
            WHEN t.fecha_evento = CURRENT_DATE AND t.hora_fin < CURRENT_TIME THEN 'pasado'
            WHEN EXTRACT(DOW FROM t.fecha_evento) IN (0) THEN 'cerrado_domingo'
            WHEN t.fecha_evento = CURRENT_DATE AND t.hora_inicio <= CURRENT_TIME AND t.hora_fin >= CURRENT_TIME THEN 'disponible'
            WHEN t.fecha_evento = CURRENT_DATE AND t.hora_inicio > CURRENT_TIME THEN 'proximamente'
            ELSE 'disponible'
          END as estado_evento
        FROM producto p
        JOIN ticket t ON p.id_producto = t.id_producto
        LEFT JOIN disponibilidad_producto dp ON p.id_producto = dp.id_producto
        WHERE p.tipo_producto = 'ticket' AND p.activo = true
      `;
      
      const params = [];
      
      if (usuario.rol === 'responsable' && usuario.id_repositorio_asignado) {
        query += ` AND dp.id_repositorio = $${params.length + 1}`;
        params.push(usuario.id_repositorio_asignado);
      }
      
      query += ` GROUP BY p.id_producto, t.id_producto ORDER BY t.fecha_evento ASC, t.hora_inicio ASC`;
      
      const result = await pool.query(query, params);
      const tickets = result.rows;
      
      const ticketsConRepositorios = await Promise.all(
        tickets.map(async (ticket) => {
          const reposResult = await pool.query(
            `SELECT 
               r.id_repositorio,
               r.nombre,
               r.sigla,
               r.direccion,
               r.ubicacion_gps,
               r.departamento,
               dp.stock,
               dp.estado as estado_disponibilidad
             FROM disponibilidad_producto dp
             JOIN repositorio r ON dp.id_repositorio = r.id_repositorio
             WHERE dp.id_producto = $1 AND r.activo = true`,
            [ticket.id_producto]
          );
          
          return {
            ...ticket,
            repositorios_disponibles: reposResult.rows,
            disponible_para_venta: verificarDisponibilidadTicket(ticket)
          };
        })
      );
      
      res.json({
        tickets: ticketsConRepositorios,
        total: ticketsConRepositorios.length,
        rol: usuario.rol || 'publico'
      });
    } catch (error) {
      console.error('Error listar tickets:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // LISTAR TICKETS POR REPOSITORIO
  // =====================================================
  async listarPorRepositorio(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || {};
      
      if (usuario.rol === 'responsable' && usuario.id_repositorio_asignado != id) {
        return res.status(403).json({
          message: 'No tienes permisos para ver tickets de este repositorio'
        });
      }
      
      const result = await pool.query(
        `SELECT 
           p.id_producto,
           p.nombre,
           p.descripcion_general,
           p.descripcion_especifica,
           p.precio,
           p.imagen_principal,
           p.activo,
           p.descuento_porcentaje,
           p.precio_con_descuento,
           p.aplica_descuento,
           t.ubicacion,
           t.descripcion_adicional,
           t.fecha_evento,
           t.hora_inicio,
           t.hora_fin,
           t.capacidad_maxima,
           t.asientos_disponibles,
           dp.id_disponibilidad,
           dp.stock,
           dp.estado as estado_disponibilidad,
           CASE 
             WHEN t.fecha_evento < CURRENT_DATE THEN 'pasado'
             WHEN t.fecha_evento = CURRENT_DATE AND t.hora_fin < CURRENT_TIME THEN 'pasado'
             WHEN EXTRACT(DOW FROM t.fecha_evento) IN (0) THEN 'cerrado_domingo'
             WHEN t.fecha_evento = CURRENT_DATE AND t.hora_inicio <= CURRENT_TIME AND t.hora_fin >= CURRENT_TIME THEN 'disponible'
             WHEN t.fecha_evento = CURRENT_DATE AND t.hora_inicio > CURRENT_TIME THEN 'proximamente'
             ELSE 'disponible'
           END as estado_evento
         FROM producto p
         JOIN ticket t ON p.id_producto = t.id_producto
         JOIN disponibilidad_producto dp ON p.id_producto = dp.id_producto
         WHERE p.tipo_producto = 'ticket' 
           AND p.activo = true
           AND dp.id_repositorio = $1
         ORDER BY t.fecha_evento ASC, t.hora_inicio ASC`,
        [id]
      );
      
      res.json({ tickets: result.rows });
    } catch (error) {
      console.error('Error listar tickets por repositorio:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // OBTENER TICKET POR ID
  // =====================================================
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || {};
      
      const result = await pool.query(
        `SELECT 
           p.id_producto,
           p.tipo_producto,
           p.nombre,
           p.descripcion_general,
           p.descripcion_especifica,
           p.precio,
           p.imagen_principal,
           p.activo,
           p.fecha_creacion,
           p.descuento_porcentaje,
           p.precio_con_descuento,
           p.aplica_descuento,
           t.ubicacion,
           t.descripcion_adicional,
           t.fecha_evento,
           t.hora_inicio,
           t.hora_fin,
           t.capacidad_maxima,
           t.asientos_disponibles,
           COALESCE(SUM(dp.stock), 0) as stock_total
         FROM producto p
         JOIN ticket t ON p.id_producto = t.id_producto
         LEFT JOIN disponibilidad_producto dp ON p.id_producto = dp.id_producto
         WHERE p.id_producto = $1 AND p.tipo_producto = 'ticket'
         GROUP BY p.id_producto, t.id_producto`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Ticket no encontrado' });
      }
      
      const ticket = result.rows[0];
      
      const reposResult = await pool.query(
        `SELECT 
           r.id_repositorio,
           r.nombre,
           r.sigla,
           r.direccion,
           r.ubicacion_gps,
           r.departamento,
           dp.stock,
           dp.estado as estado_disponibilidad
         FROM disponibilidad_producto dp
         JOIN repositorio r ON dp.id_repositorio = r.id_repositorio
         WHERE dp.id_producto = $1 AND r.activo = true`,
        [id]
      );
      
      ticket.repositorios_disponibles = reposResult.rows;
      ticket.disponible_para_venta = verificarDisponibilidadTicket(ticket);
      
      if (usuario.rol === 'responsable') {
        const tienePermiso = ticket.repositorios_disponibles.some(
          r => r.id_repositorio === usuario.id_repositorio_asignado
        );
        if (!tienePermiso) {
          return res.status(403).json({
            message: 'No tienes permisos para ver este ticket'
          });
        }
      }
      
      res.json({ ticket });
    } catch (error) {
      console.error('Error obtener ticket:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // LISTAR TICKETS DISPONIBLES PARA HOY
  // =====================================================
  async listarDisponiblesHoy(req, res) {
    try {
      const usuario = req.usuario || {};
      const hoy = new Date();
      const diaSemana = hoy.getDay();
      
      // Si es domingo, no hay tickets disponibles
      if (diaSemana === 0) {
        return res.json({
          tickets: [],
          total: 0,
          mensaje: 'Los museos están cerrados los domingos',
          disponible: false
        });
      }
      
      const fechaStr = hoy.toISOString().split('T')[0];
      const horaActual = hoy.getHours() + ':' + String(hoy.getMinutes()).padStart(2, '0');
      
      let query = `
        SELECT 
          p.id_producto,
          p.nombre,
          p.descripcion_general,
          p.precio,
          p.imagen_principal,
          p.descuento_porcentaje,
          p.precio_con_descuento,
          p.aplica_descuento,
          t.ubicacion,
          t.descripcion_adicional,
          t.fecha_evento,
          t.hora_inicio,
          t.hora_fin,
          t.capacidad_maxima,
          t.asientos_disponibles,
          COALESCE(SUM(dp.stock), 0) as stock_total
        FROM producto p
        JOIN ticket t ON p.id_producto = t.id_producto
        LEFT JOIN disponibilidad_producto dp ON p.id_producto = dp.id_producto
        WHERE p.tipo_producto = 'ticket' 
          AND p.activo = true
          AND t.fecha_evento = $1
          AND t.hora_fin > $2
          AND EXTRACT(DOW FROM t.fecha_evento) NOT IN (0)
        GROUP BY p.id_producto, t.id_producto
        ORDER BY t.hora_inicio ASC
      `;
      
      const params = [fechaStr, horaActual];
      
      if (usuario.rol === 'responsable' && usuario.id_repositorio_asignado) {
        query += ` AND dp.id_repositorio = $${params.length + 1}`;
        params.push(usuario.id_repositorio_asignado);
      }
      
      const result = await pool.query(query, params);
      
      const tickets = result.rows.map(ticket => {
        const disponibilidad = verificarDisponibilidadTicket(ticket);
        return {
          ...ticket,
          disponible_para_venta: disponibilidad
        };
      });
      
      res.json({
        tickets,
        total: tickets.length,
        fecha: fechaStr,
        dia: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][diaSemana]
      });
    } catch (error) {
      console.error('Error listar tickets disponibles hoy:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // LISTAR REPOSITORIOS DISPONIBLES
  // =====================================================
  async listarRepositoriosDisponibles(req, res) {
    try {
      const result = await pool.query(
        `SELECT id_repositorio, nombre, sigla, direccion, ubicacion_gps, departamento
         FROM repositorio 
         WHERE activo = true
         ORDER BY nombre`
      );
      
      res.json({ repositorios: result.rows });
    } catch (error) {
      console.error('Error listarRepositoriosDisponibles:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // CREAR TICKET
  // =====================================================
  async crear(req, res) {
    try {
      const {
        nombre,
        descripcion_general,
        descripcion_especifica,
        precio,
        ubicacion,
        descripcion_adicional,
        fecha_evento,
        hora_inicio,
        hora_fin,
        capacidad_maxima,
        repositorios,
        descuento_porcentaje,
        fecha_inicio_descuento,
        fecha_fin_descuento,
        tipo_descuento
      } = req.body;

      const usuario = req.usuario || {};

      console.log('📦 Body recibido:', req.body);

      // Validar campos requeridos
      if (!nombre || !precio || !fecha_evento || !hora_inicio || !hora_fin) {
        return res.status(400).json({
          message: 'Nombre, precio, fecha, hora de inicio y hora de fin son requeridos'
        });
      }

      // Validar que hora_inicio < hora_fin
      if (hora_inicio >= hora_fin) {
        return res.status(400).json({
          message: 'La hora de inicio debe ser menor a la hora de fin'
        });
      }

      // Validar que la fecha no sea domingo
      const fechaObj = new Date(fecha_evento);
      if (fechaObj.getDay() === 0) {
        return res.status(400).json({
          message: 'Los eventos no pueden ser programados en domingo (los museos están cerrados)'
        });
      }

      // Parsear repositorios
      let repositoriosList = repositorios;
      if (typeof repositorios === 'string') {
        try {
          repositoriosList = JSON.parse(repositorios);
        } catch (e) {
          console.error('Error parsing repositorios:', e);
          return res.status(400).json({
            message: 'Formato de repositorios inválido'
          });
        }
      }

      if (!repositoriosList || !repositoriosList.length) {
        return res.status(400).json({
          message: 'Debe seleccionar al menos un repositorio'
        });
      }

      // Verificar permisos para responsable
      if (usuario.rol === 'responsable') {
        const tienePermiso = repositoriosList.some(
          r => parseInt(r.id_repositorio) === parseInt(usuario.id_repositorio_asignado)
        );
        if (!tienePermiso) {
          return res.status(403).json({
            message: 'Solo puedes agregar tickets a tu repositorio asignado'
          });
        }
      }

      // Manejar imagen
      let imagen_url = null;
      if (req.file) {
        imagen_url = `/uploads/tickets/${path.basename(req.file.path)}`;
        console.log('✅ Imagen del ticket guardada en:', imagen_url);
      }

      // Calcular descuento
      const descuento = parseFloat(descuento_porcentaje) || 0;
      const fechaInicio = fecha_inicio_descuento || null;
      const fechaFin = fecha_fin_descuento || null;
      const aplicaDescuento = descuento > 0 && 
        (fechaInicio === null || new Date(fechaInicio) <= new Date()) &&
        (fechaFin === null || new Date(fechaFin) >= new Date());

      // 1. Insertar en PRODUCTO
      const productoResult = await pool.query(
        `INSERT INTO producto 
         (tipo_producto, nombre, descripcion_general, descripcion_especifica, precio, 
          imagen_principal, creado_por,
          descuento_porcentaje, fecha_inicio_descuento, fecha_fin_descuento, 
          tipo_descuento, aplica_descuento)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id_producto`,
        ['ticket', nombre, descripcion_general || null, descripcion_especifica || null,
         precio, imagen_url, usuario.id_usuario || null,
         descuento, fechaInicio, fechaFin,
         tipo_descuento || 'normal', aplicaDescuento]
      );

      const id_producto = productoResult.rows[0].id_producto;

      // 2. Insertar en TICKET
      await pool.query(
        `INSERT INTO ticket 
         (id_producto, ubicacion, descripcion_adicional, fecha_evento, 
          hora_inicio, hora_fin, capacidad_maxima, asientos_disponibles)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id_producto, ubicacion || null, descripcion_adicional || null, 
         fecha_evento, hora_inicio, hora_fin, 
         capacidad_maxima || null, capacidad_maxima || null]
      );

      // 3. Crear disponibilidad en cada repositorio
      for (const repo of repositoriosList) {
        await pool.query(
          `INSERT INTO disponibilidad_producto 
           (id_repositorio, id_producto, stock, estado, actualizado_por)
           VALUES ($1, $2, $3, $4, $5)`,
          [repo.id_repositorio, id_producto, repo.stock || 0, 'disponible', usuario.id_usuario || null]
        );
      }

      // 4. Registrar en bitácora
      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_nuevos)
         VALUES ($1, 'crear_ticket', 'producto', $2, $3::jsonb)`,
        [usuario.id_usuario || null, id_producto, JSON.stringify({ nombre, fecha_evento, precio })]
      );

      res.status(201).json({
        message: 'Ticket creado exitosamente',
        id_producto: id_producto,
        imagen: imagen_url
      });
    } catch (error) {
      console.error('Error crear ticket:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // EDITAR TICKET
  // =====================================================
  async editar(req, res) {
    try {
      const { id } = req.params;
      const {
        nombre,
        descripcion_general,
        descripcion_especifica,
        precio,
        ubicacion,
        descripcion_adicional,
        fecha_evento,
        hora_inicio,
        hora_fin,
        capacidad_maxima,
        repositorios,
        imagen_actual,
        activo,
        descuento_porcentaje,
        fecha_inicio_descuento,
        fecha_fin_descuento,
        tipo_descuento
      } = req.body;

      const usuario = req.usuario || {};

      // Verificar que el producto existe
      const productoExistente = await pool.query(
        `SELECT p.*, t.* 
         FROM producto p
         JOIN ticket t ON p.id_producto = t.id_producto
         WHERE p.id_producto = $1 AND p.tipo_producto = 'ticket'`,
        [id]
      );

      if (productoExistente.rows.length === 0) {
        return res.status(404).json({ message: 'Ticket no encontrado' });
      }

      // Validar que la fecha no sea domingo
      if (fecha_evento) {
        const fechaObj = new Date(fecha_evento);
        if (fechaObj.getDay() === 0) {
          return res.status(400).json({
            message: 'Los eventos no pueden ser programados en domingo (los museos están cerrados)'
          });
        }
      }

      // Parsear repositorios
      let repositoriosList = repositorios;
      if (typeof repositorios === 'string') {
        try {
          repositoriosList = JSON.parse(repositorios);
        } catch (e) {
          console.error('Error parsing repositorios:', e);
          return res.status(400).json({
            message: 'Formato de repositorios inválido'
          });
        }
      }

      // Verificar permisos para responsable
      if (usuario.rol === 'responsable') {
        const tienePermiso = repositoriosList.some(
          r => parseInt(r.id_repositorio) === parseInt(usuario.id_repositorio_asignado)
        );
        if (!tienePermiso) {
          return res.status(403).json({
            message: 'Solo puedes editar tickets de tu repositorio asignado'
          });
        }
      }

      // Manejar imagen
      let imagen_url = imagen_actual || productoExistente.rows[0].imagen_principal;

      if (req.file) {
        if (imagen_actual && imagen_actual.startsWith('/uploads')) {
          const oldPath = path.join(__dirname, '../..', imagen_actual);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
            console.log('🗑️ Imagen anterior eliminada:', oldPath);
          }
        }
        imagen_url = `/uploads/tickets/${path.basename(req.file.path)}`;
        console.log('✅ Nueva imagen guardada:', imagen_url);
      }

      const activoBool = activo !== undefined ? activo : true;
      const descuento = parseFloat(descuento_porcentaje) || 0;
      const fechaInicio = fecha_inicio_descuento || null;
      const fechaFin = fecha_fin_descuento || null;
      const aplicaDescuento = descuento > 0 && 
        (fechaInicio === null || new Date(fechaInicio) <= new Date()) &&
        (fechaFin === null || new Date(fechaFin) >= new Date());

      // 1. Actualizar PRODUCTO
      await pool.query(
        `UPDATE producto 
         SET nombre = $1, descripcion_general = $2, descripcion_especifica = $3, 
             precio = $4, imagen_principal = $5, activo = $6,
             descuento_porcentaje = $7, fecha_inicio_descuento = $8, 
             fecha_fin_descuento = $9, tipo_descuento = $10, aplica_descuento = $11
         WHERE id_producto = $12`,
        [nombre, descripcion_general || null, descripcion_especifica || null,
         precio, imagen_url, activoBool,
         descuento, fechaInicio, fechaFin,
         tipo_descuento || 'normal', aplicaDescuento, id]
      );

      // 2. Actualizar TICKET
      await pool.query(
        `UPDATE ticket 
         SET ubicacion = $1, descripcion_adicional = $2, fecha_evento = $3, 
             hora_inicio = $4, hora_fin = $5, capacidad_maxima = $6, 
             asientos_disponibles = $7
         WHERE id_producto = $8`,
        [ubicacion || null, descripcion_adicional || null, fecha_evento,
         hora_inicio, hora_fin, capacidad_maxima || null,
         capacidad_maxima || null, id]
      );

      // 3. Eliminar disponibilidades existentes
      await pool.query(
        'DELETE FROM disponibilidad_producto WHERE id_producto = $1',
        [id]
      );

      // 4. Crear nuevas disponibilidades
      for (const repo of repositoriosList) {
        await pool.query(
          `INSERT INTO disponibilidad_producto 
           (id_repositorio, id_producto, stock, estado, actualizado_por)
           VALUES ($1, $2, $3, $4, $5)`,
          [repo.id_repositorio, id, repo.stock || 0, 'disponible', usuario.id_usuario || null]
        );
      }

      // 5. Registrar en bitácora
      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_anteriores, datos_nuevos)
         VALUES ($1, 'editar_ticket', 'producto', $2, $3::jsonb, $4::jsonb)`,
        [
          usuario.id_usuario || null,
          id,
          JSON.stringify(productoExistente.rows[0]),
          JSON.stringify({ nombre, fecha_evento, precio })
        ]
      );

      res.json({
        message: 'Ticket actualizado exitosamente',
        imagen: imagen_url
      });
    } catch (error) {
      console.error('Error editar ticket:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // ELIMINAR TICKET (lógico)
  // =====================================================
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || {};

      const productoExistente = await pool.query(
        `SELECT p.id_producto, p.activo
         FROM producto p
         WHERE p.id_producto = $1 AND p.tipo_producto = 'ticket'`,
        [id]
      );

      if (productoExistente.rows.length === 0) {
        return res.status(404).json({ message: 'Ticket no encontrado' });
      }

      if (usuario.rol === 'responsable') {
        const reposResult = await pool.query(
          `SELECT id_repositorio 
           FROM disponibilidad_producto 
           WHERE id_producto = $1`,
          [id]
        );
        
        const repositoriosIds = reposResult.rows.map(r => r.id_repositorio);
        if (!repositoriosIds.includes(parseInt(usuario.id_repositorio_asignado))) {
          return res.status(403).json({
            message: 'No tienes permisos para eliminar este ticket'
          });
        }
      }

      await pool.query(
        `UPDATE producto SET activo = false WHERE id_producto = $1`,
        [id]
      );

      await pool.query(
        `INSERT INTO bitacora (id_usuario, accion, tabla, registro_id, datos_anteriores)
         VALUES ($1, 'eliminar_ticket', 'producto', $2, $3::jsonb)`,
        [usuario.id_usuario || null, id, JSON.stringify(productoExistente.rows[0])]
      );

      res.json({ message: 'Ticket eliminado exitosamente' });
    } catch (error) {
      console.error('Error eliminar ticket:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // ACTUALIZAR STOCK
  // =====================================================
  async actualizarStock(req, res) {
    try {
      const { id } = req.params;
      const { stock, id_repositorio } = req.body;
      const usuario = req.usuario || {};

      if (stock === undefined || stock < 0) {
        return res.status(400).json({ message: 'Stock no válido' });
      }

      if (!id_repositorio) {
        return res.status(400).json({ message: 'Repositorio requerido' });
      }

      const productoExistente = await pool.query(
        `SELECT id_producto FROM producto WHERE id_producto = $1 AND tipo_producto = 'ticket'`,
        [id]
      );

      if (productoExistente.rows.length === 0) {
        return res.status(404).json({ message: 'Ticket no encontrado' });
      }

      // Verificar que no se exceda la capacidad máxima
      const ticketInfo = await pool.query(
        `SELECT capacidad_maxima FROM ticket WHERE id_producto = $1`,
        [id]
      );

      if (ticketInfo.rows.length > 0 && ticketInfo.rows[0].capacidad_maxima) {
        const capacidadMaxima = ticketInfo.rows[0].capacidad_maxima;
        if (stock > capacidadMaxima) {
          return res.status(400).json({
            message: `El stock no puede exceder la capacidad máxima de ${capacidadMaxima}`
          });
        }
      }

      await pool.query(
        `UPDATE disponibilidad_producto 
         SET stock = $1, estado = $2, actualizado_por = $3, ultima_actualizacion = CURRENT_TIMESTAMP
         WHERE id_producto = $4 AND id_repositorio = $5`,
        [
          stock,
          stock === 0 ? 'agotado' : 'disponible',
          usuario.id_usuario || null,
          id,
          id_repositorio
        ]
      );

      // Actualizar asientos disponibles en ticket
      await pool.query(
        `UPDATE ticket 
         SET asientos_disponibles = (
           SELECT COALESCE(SUM(stock), 0) 
           FROM disponibilidad_producto 
           WHERE id_producto = $1
         )
         WHERE id_producto = $1`,
        [id]
      );

      res.json({
        message: 'Stock actualizado exitosamente',
        stock,
        estado: stock === 0 ? 'agotado' : 'disponible'
      });
    } catch (error) {
      console.error('Error actualizar stock:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // =====================================================
  // VERIFICAR DISPONIBILIDAD DE TICKET (Endpoint)
  // =====================================================
  async verificarDisponibilidad(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT 
           p.id_producto,
           p.nombre,
           t.fecha_evento,
           t.hora_inicio,
           t.hora_fin,
           COALESCE(SUM(dp.stock), 0) as stock_total
         FROM producto p
         JOIN ticket t ON p.id_producto = t.id_producto
         LEFT JOIN disponibilidad_producto dp ON p.id_producto = dp.id_producto
         WHERE p.id_producto = $1 AND p.tipo_producto = 'ticket' AND p.activo = true
         GROUP BY p.id_producto, t.id_producto`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Ticket no encontrado' });
      }

      const ticket = result.rows[0];
      const disponibilidad = verificarDisponibilidadTicket(ticket);

      res.json({
        ticket: {
          id: ticket.id_producto,
          nombre: ticket.nombre,
          fecha_evento: ticket.fecha_evento,
          hora_inicio: ticket.hora_inicio,
          hora_fin: ticket.hora_fin,
          stock_total: ticket.stock_total
        },
        disponibilidad
      });
    } catch (error) {
      console.error('Error verificar disponibilidad:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

export default new TicketController();