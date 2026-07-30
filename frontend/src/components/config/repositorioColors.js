// src/config/repositorioColors.js

// Colores predefinidos para repositorios específicos por sigla
export const REPOSITORIO_COLORS = {
  // Museos y centros culturales principales
  'MFM': { bg: '#8B4513', border: '#6B3410', text: '#FFFFFF', icon: '🏛️', name: 'Museo Fernando Montes' },
  'CNM': { bg: '#2E8B57', border: '#236B43', text: '#FFFFFF', icon: '💰', name: 'Casa Nacional de Moneda' },
  'MNA': { bg: '#CD853F', border: '#A46B32', text: '#FFFFFF', icon: '🏺', name: 'Museo Nacional de Arqueología' },
  'MUSEF': { bg: '#D2691E', border: '#A85418', text: '#FFFFFF', icon: '🗿', name: 'Museo de Etnografía y Folklore' },
  
  // Bibliotecas y archivos
  'BNB': { bg: '#4169E1', border: '#3454B4', text: '#FFFFFF', icon: '📚', name: 'Biblioteca Nacional' },
  'ARCHIVO': { bg: '#9370DB', border: '#7659AF', text: '#FFFFFF', icon: '📜', name: 'Archivo General' },
  
  // Centros culturales
  'CCC': { bg: '#FF6347', border: '#CC4F38', text: '#FFFFFF', icon: '🎭', name: 'Centro Cultural' },
  'CCE': { bg: '#20B2AA', border: '#1A8F88', text: '#FFFFFF', icon: '🎨', name: 'Centro Cultural España' },
  
  // Otros repositorios comunes
  'ALIANZA': { bg: '#FFA500', border: '#CC8400', text: '#1a1a1a', icon: '🤝', name: 'Alianza Francesa' },
  'GOETHE': { bg: '#4682B4', border: '#38688F', text: '#FFFFFF', icon: '🇩🇪', name: 'Instituto Goethe' },
  'default': { bg: '#19ADA0', border: '#0C6660', text: '#FFFFFF', icon: '📌' }
};

// Paleta de colores para asignar automáticamente a repositorios no mapeados
const AUTO_COLORS = [
  { bg: '#E74C3C', border: '#C0392B', text: '#FFFFFF' }, // Rojo
  { bg: '#3498DB', border: '#2980B9', text: '#FFFFFF' }, // Azul
  { bg: '#F39C12', border: '#D68910', text: '#FFFFFF' }, // Naranja
  { bg: '#9B59B6', border: '#7D3C98', text: '#FFFFFF' }, // Morado
  { bg: '#1ABC9C', border: '#148F77', text: '#FFFFFF' }, // Verde azulado
  { bg: '#E67E22', border: '#CA6F1E', text: '#FFFFFF' }, // Naranja oscuro
  { bg: '#2ECC71', border: '#239B56', text: '#FFFFFF' }, // Verde
  { bg: '#F1C40F', border: '#D4AC0D', text: '#1a1a1a' }, // Amarillo
  { bg: '#E84393', border: '#BA2C73', text: '#FFFFFF' }, // Rosa
  { bg: '#5D6D7E', border: '#4A5B6E', text: '#FFFFFF' }, // Gris azulado
];

// Cache para colores asignados a repositorios
const colorCache = new Map();

// Obtener color para un repositorio por su sigla o nombre
export const getRepositorioColor = (sigla, nombre = '') => {
  // Buscar por sigla primero
  if (sigla && REPOSITORIO_COLORS[sigla.toUpperCase()]) {
    const color = REPOSITORIO_COLORS[sigla.toUpperCase()];
    return { ...color, icon: color.icon || getRandomIcon() };
  }
  
  // Buscar por nombre (comparación flexible)
  const nombreLower = (nombre || '').toLowerCase();
  const matchByNombre = Object.entries(REPOSITORIO_COLORS).find(([key, value]) => {
    if (key === 'default') return false;
    return value.name?.toLowerCase().includes(nombreLower) || 
           nombreLower.includes(value.name?.toLowerCase());
  });
  
  if (matchByNombre) {
    const [, color] = matchByNombre;
    return { ...color, icon: color.icon || getRandomIcon() };
  }
  
  // Asignar color automático basado en sigla
  if (sigla) {
    if (colorCache.has(sigla)) {
      return colorCache.get(sigla);
    }
    
    // Generar un índice basado en el hash de la sigla
    const hash = sigla.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorIndex = hash % AUTO_COLORS.length;
    const autoColor = AUTO_COLORS[colorIndex];
    
    const newColor = {
      ...autoColor,
      icon: getRandomIcon(),
      name: nombre || sigla
    };
    
    colorCache.set(sigla, newColor);
    return newColor;
  }
  
  return { ...REPOSITORIO_COLORS.default, icon: '📌' };
};

// Iconos aleatorios para repositorios
const getRandomIcon = () => {
  const icons = ['🏛️', '📚', '🎨', '🏺', '🖼️', '📜', '🎭', '🏦', '🏫', '🏘️'];
  return icons[Math.floor(Math.random() * icons.length)];
};

// Obtener el repositorio a partir del lugar del evento
export const extractRepositorioInfo = (lugar, repositoriosList = []) => {
  if (!lugar) return { sigla: null, nombre: lugar };
  
  // Buscar en la lista de repositorios del sistema
  const foundRepo = repositoriosList.find(repo => {
    const nombreRepo = (repo.nombre || '').toLowerCase();
    const lugarLower = lugar.toLowerCase();
    const siglaRepo = (repo.sigla || '').toLowerCase();
    
    return nombreRepo.includes(lugarLower) || 
           lugarLower.includes(nombreRepo) ||
           (siglaRepo && lugarLower.includes(siglaRepo));
  });
  
  if (foundRepo) {
    return {
      sigla: foundRepo.sigla,
      nombre: foundRepo.nombre,
      id: foundRepo.id_repositorio
    };
  }
  
  // Extraer sigla del lugar (ej: "Museo Fernando Montes (MFM)")
  const siglaMatch = lugar.match(/\(([A-Z]+)\)/);
  if (siglaMatch) {
    return { sigla: siglaMatch[1], nombre: lugar };
  }
  
  return { sigla: null, nombre: lugar };
};