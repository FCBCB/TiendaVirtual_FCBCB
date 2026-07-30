// src/components/eventos/eventosService.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const fetchParametros = async (tipo) => {
  try {
    console.log(`📡 Fetching ${tipo} desde proxy...`);
    
    const response = await fetch(`${API_BASE_URL}/api/eventos-proxy/parametros`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ consulta: tipo }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ ${tipo} recibidos:`, data[tipo]?.length || 0);
    return data.success ? data[tipo] : [];
  } catch (error) {
    console.error(`Error fetching ${tipo}:`, error);
    return [];
  }
};

export const fetchEventos = async (filtros) => {
  try {
    console.log('📡 Fetching eventos desde proxy...');
    console.log('📅 Filtros:', filtros);
    
    const payload = {
      fecha_inicio: filtros.fecha_inicio,
      fecha_fin: filtros.fecha_fin,
      idRepositorio: filtros.idRepositorio || 0,
      idEntidad: filtros.idEntidad || 0,
      idCategoria: filtros.idCategoria || 0,
    };
    
    const response = await fetch(`${API_BASE_URL}/api/eventos-proxy/eventos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Eventos recibidos: ${data.eventos?.length || 0}`);
      return data.eventos || [];
    } else {
      console.warn('⚠️ API respondió con success false:', data.mensaje);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching eventos:', error);
    return [];
  }
};

export const formatFechaEvento = (fecha) => {
  if (!fecha) return '';
  const [year, month, day] = fecha.split('-');
  return `${day}/${month}/${year}`;
};

export const normalizeTime = (timeStr) => {
  if (!timeStr) return '00:00:00';
  const str = String(timeStr).trim();
  return str.length === 5 ? `${str}:00` : str;
};

// Función para obtener un título descriptivo del evento
const getEventTitle = (evento) => {
  // Prioridad: categoría > tipo de evento > descripción corta
  if (evento.categoria?.nombreCategoria) {
    return evento.categoria.nombreCategoria;
  }
  
  // Extraer tipo de evento de la descripción
  const descripcion = evento.descripcion || '';
  const descLower = descripcion.toLowerCase();
  
  if (descLower.includes('visita')) return 'Visita Guiada';
  if (descLower.includes('taller')) return 'Taller';
  if (descLower.includes('conferencia')) return 'Conferencia';
  if (descLower.includes('concierto')) return 'Concierto';
  if (descLower.includes('exposición') || descLower.includes('exposicion')) return 'Exposición';
  if (descLower.includes('teatro')) return 'Teatro';
  if (descLower.includes('desfile')) return 'Desfile';
  if (descLower.includes('prensa')) return 'Conferencia de Prensa';
  
  // Si no hay categoría, usar primeros 35 caracteres de la descripción
  if (descripcion) {
    return descripcion.length > 35 
      ? descripcion.substring(0, 35) + '...' 
      : descripcion;
  }
  
  return 'Evento Cultural';
};

export const mapEventoToCalendar = (evento) => {
  const tieneHora = evento.horaInicio && String(evento.horaInicio).trim() !== '';
  const titulo = getEventTitle(evento);
  
  const calendarEvent = {
    id: String(evento.idEvento),
    title: titulo,
    extendedProps: {
      raw: evento,
      descripcion: evento.descripcion,
      lugar: evento.lugar,
      categoria: evento.categoria,
      repositorio: evento.repositorio,
      entidad: evento.entidad,
      participantes: evento.participantes,
      objetivoEsperado: evento.objetivoEsperado,
      color: evento.color,
    },
  };

  if (tieneHora) {
    calendarEvent.start = `${evento.fecha}T${normalizeTime(evento.horaInicio)}`;
    if (evento.horaFin && String(evento.horaFin).trim() !== '') {
      calendarEvent.end = `${evento.fecha}T${normalizeTime(evento.horaFin)}`;
    }
  } else {
    calendarEvent.start = evento.fecha;
    calendarEvent.allDay = true;
  }

  // Usar el color que viene de la API o asignar uno por defecto
  if (evento.color && String(evento.color).trim()) {
    // Convertir clases de Bootstrap a colores
    const colorMap = {
      'bg-success': '#28a745',
      'bg-primary': '#007bff',
      'bg-danger': '#dc3545',
      'bg-warning': '#ffc107',
      'bg-info': '#17a2b8',
      'border-success': '#28a745',
      'border-primary': '#007bff',
    };
    
    let bgColor = '#19ADA0'; // color por defecto
    for (const [className, color] of Object.entries(colorMap)) {
      if (evento.color.includes(className)) {
        bgColor = color;
        break;
      }
    }
    calendarEvent.backgroundColor = bgColor;
    calendarEvent.borderColor = bgColor;
  }

  return calendarEvent;
};