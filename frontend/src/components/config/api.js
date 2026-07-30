// ─────────────────────────────────────────────────────────────────────
// Detecta automáticamente si estás en localhost o en un túnel externo.
// Soporta: localhost, ngrok, dev tunnels de VS Code, etc.
// ─────────────────────────────────────────────────────────────────────

const BACKEND_PORT = 3000;
const FRONTEND_PORT = 5173;

// Función para detectar si estamos en un túnel de VS Code
const isDevTunnel = () => {
  const hostname = window.location.hostname;
  return hostname.includes('devtunnels.ms') || hostname.includes('brs.devtunnels.ms');
};

// Función para extraer la base del hostname (sin el puerto)
const getBaseHostname = () => {
  const hostname = window.location.hostname;
  if (isDevTunnel()) {
    const parts = hostname.split('-');
    if (parts.length > 1) {
      return parts[0];
    }
  }
  return hostname.split('.')[0];
};

const getApiUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:${BACKEND_PORT}`;
  }

  if (import.meta.env.DEV && hostname === 'localhost') {
    return '';
  }

  if (isDevTunnel()) {
    const baseId = getBaseHostname();
    const backendUrl = `${protocol}//${baseId}-${BACKEND_PORT}.${hostname.split('.').slice(1).join('.')}`;
    console.log('🔧 [Dev Tunnel] Backend URL:', backendUrl);
    return backendUrl;
  }

  if (hostname.includes('ngrok') || hostname.includes('localtunnel') || hostname.includes('serveo')) {
    return `${protocol}//${hostname}`;
  }

  if (hostname.includes('wayruru') || hostname.includes('fcbcb')) {
    return `${protocol}//${hostname}`;
  }

  console.warn('[API] No se pudo determinar la URL del backend, usando el mismo origen');
  return window.location.origin;
};

// URL base del backend
export const API_URL = getApiUrl();

// URL para archivos estáticos (uploads)
export const UPLOADS_URL = (() => {
  if (isDevTunnel()) {
    const protocol = window.location.protocol;
    const baseId = getBaseHostname();
    const hostParts = window.location.hostname.split('.');
    const domain = hostParts.slice(1).join('.');
    return `${protocol}//${baseId}-${BACKEND_PORT}.${domain}`;
  }
  return API_URL;
})();

// ✅ CACHÉ PARA getImageUrl (evita logs y cálculos repetidos)
const imageUrlCache = new Map();

// ✅ Función optimizada con caché
export const getImageUrl = (path) => {
  if (!path) return '';
  
  // ✅ Si ya tenemos la URL en caché, devolverla sin logs
  if (imageUrlCache.has(path)) {
    return imageUrlCache.get(path);
  }
  
  let result = '';
  
  if (path.startsWith('http')) {
    result = path;
  } else if (path.startsWith('/uploads')) {
    const baseUrl = UPLOADS_URL || window.location.origin;
    const cleanBase = baseUrl.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    result = `${cleanBase}/${cleanPath}`;
  } else {
    result = `${UPLOADS_URL}/uploads/${path}`;
  }
  
  // ✅ Guardar en caché
  imageUrlCache.set(path, result);
  
  // ✅ Solo log en desarrollo y SOLO LA PRIMERA VEZ
  if (import.meta.env.DEV && !imageUrlCache.has(path)) {
    console.log('🖼️ [getImageUrl]', { path, fullUrl: result });
  }
  
  return result;
};

// ✅ Función para limpiar caché (útil si cambian las imágenes)
export const clearImageCache = () => {
  imageUrlCache.clear();
  console.log('🧹 [Cache] Imágenes limpiadas');
};

// Log en desarrollo para verificar configuración
if (import.meta.env.DEV) {
  console.log(`🔧 [API Config]`);
  console.log(`   📍 Backend URL: ${API_URL || '(proxy Vite)'}`);
  console.log(`   📍 Uploads URL: ${UPLOADS_URL || '(proxy Vite)'}`);
  console.log(`   🌐 Hostname: ${window.location.hostname}`);
  console.log(`   🔌 Port: ${window.location.port}`);
  console.log(`   📦 Modo: ${import.meta.env.MODE}`);
  console.log(`   📍 Origen: ${window.location.origin}`);
  console.log(`   🚇 Es Dev Tunnel: ${isDevTunnel()}`);
  console.log(`   🆔 Base ID: ${getBaseHostname()}`);
}