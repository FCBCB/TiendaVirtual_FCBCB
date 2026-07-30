import express from 'express';
import axios from 'axios';

const router = express.Router();

const API_REMOTA = 'http://agendacultural.fcbcb.gob.bo';

// Ruta para parametros
router.post('/parametros', async (req, res) => {
  try {
    const { consulta } = req.body;
    console.log(`[PROXY] Consultando parametros: ${consulta}`);
    
    const response = await axios.post(`${API_REMOTA}/api/api_parametros.php`, {
      consulta
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    
    console.log(`[PROXY] Parametros recibidos: ${consulta}`);
    res.json(response.data);
  } catch (error) {
    console.error('[PROXY] Error:', error.message);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener parametros',
      [req.body.consulta]: []
    });
  }
});

// ✅ Ruta para eventos - CORREGIDA (sin loop)
router.post('/eventos', async (req, res) => {
  try {
    const filtros = req.body;
    console.log('[PROXY] 📅 Consultando eventos...');
    
    // Validar que los filtros existen
    if (!filtros.fecha_inicio || !filtros.fecha_fin) {
      console.warn('[PROXY] Faltan fechas, usando valores por defecto');
      const hoy = new Date();
      const inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - 30);
      const fin = new Date(hoy);
      fin.setDate(hoy.getDate() + 90);
      
      filtros.fecha_inicio = inicio.toISOString().split('T')[0];
      filtros.fecha_fin = fin.toISOString().split('T')[0];
    }
    
    const payload = {
      fecha_inicio: filtros.fecha_inicio,
      fecha_fin: filtros.fecha_fin,
      idRepositorio: Number(filtros.idRepositorio) || 0,
      idEntidad: Number(filtros.idEntidad) || 0,
      idCategoria: Number(filtros.idCategoria) || 0,
    };
    
    console.log('[PROXY] 📤 Payload:', JSON.stringify(payload));
    
    // ✅ PRIMER INTENTO: POST a api_public.php
    try {
      const response = await axios.post(`${API_REMOTA}/api/api_public.php`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000
      });
      
      console.log('[PROXY] ✅ Status:', response.status);
      
      if (response.data) {
        // Si la respuesta tiene eventos, devolverlos
        if (response.data.eventos && Array.isArray(response.data.eventos)) {
          console.log(`[PROXY] 📊 Eventos encontrados: ${response.data.eventos.length}`);
          return res.json({
            success: true,
            eventos: response.data.eventos,
            total: response.data.eventos.length
          });
        }
        
        // Si la respuesta tiene data con eventos
        if (response.data.data && Array.isArray(response.data.data)) {
          console.log(`[PROXY] 📊 Eventos encontrados en data: ${response.data.data.length}`);
          return res.json({
            success: true,
            eventos: response.data.data,
            total: response.data.data.length
          });
        }
        
        // Si la respuesta es un array directamente
        if (Array.isArray(response.data)) {
          console.log(`[PROXY] 📊 Eventos encontrados (array): ${response.data.length}`);
          return res.json({
            success: true,
            eventos: response.data,
            total: response.data.length
          });
        }
      }
      
      // Si llegamos aquí, no hay eventos en la respuesta
      console.log('[PROXY] ℹ️ No se encontraron eventos');
      return res.json({
        success: true,
        eventos: [],
        total: 0,
        mensaje: 'No hay eventos en el período seleccionado'
      });
      
    } catch (postError) {
      console.error('[PROXY] ❌ Error en POST:', postError.message);
      
      // ✅ SEGUNDO INTENTO: GET con parámetros (solo si POST falló)
      try {
        console.log('[PROXY] 🔄 Intentando con GET...');
        const params = new URLSearchParams({
          fecha_inicio: payload.fecha_inicio,
          fecha_fin: payload.fecha_fin,
          idRepositorio: payload.idRepositorio,
          idEntidad: payload.idEntidad,
          idCategoria: payload.idCategoria,
        });
        
        const response2 = await axios.get(`${API_REMOTA}/api/api_public.php?${params.toString()}`, {
          timeout: 15000
        });
        
        console.log('[PROXY] ✅ GET Status:', response2.status);
        
        if (response2.data) {
          if (response2.data.eventos && Array.isArray(response2.data.eventos)) {
            console.log(`[PROXY] 📊 Eventos encontrados (GET): ${response2.data.eventos.length}`);
            return res.json({
              success: true,
              eventos: response2.data.eventos,
              total: response2.data.eventos.length
            });
          }
          if (response2.data.data && Array.isArray(response2.data.data)) {
            console.log(`[PROXY] 📊 Eventos encontrados en data (GET): ${response2.data.data.length}`);
            return res.json({
              success: true,
              eventos: response2.data.data,
              total: response2.data.data.length
            });
          }
        }
        
        // No hay eventos
        return res.json({
          success: true,
          eventos: [],
          total: 0,
          mensaje: 'No hay eventos en el período seleccionado'
        });
        
      } catch (getError) {
        console.error('[PROXY] ❌ Error en GET:', getError.message);
        
        // ✅ Devolver array vacío en lugar de error 500 para evitar loop
        return res.json({
          success: true,
          eventos: [],
          total: 0,
          mensaje: 'Error al obtener eventos: ' + getError.message
        });
      }
    }
    
  } catch (error) {
    console.error('[PROXY] ❌ Error general:', error.message);
    
    // ✅ SIEMPRE devolver 200 con array vacío, NUNCA 500
    return res.status(200).json({
      success: true,
      eventos: [],
      total: 0,
      mensaje: 'Error al obtener eventos: ' + error.message
    });
  }
});

// Ruta de prueba
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Proxy funcionando correctamente'
  });
});

export default router;