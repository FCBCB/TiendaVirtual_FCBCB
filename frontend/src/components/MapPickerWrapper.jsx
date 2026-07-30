// MapPickerWrapper.jsx
// Envuelve MapContainer con un key dinámico para que Leaflet
// siempre monte/desmonte limpiamente sin dejar nodos huérfanos.
// Úsalo en lugar de poner MapContainer directo en el modal.

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import { MagnifyingGlassIcon, GlobeAltIcon, MapPinIcon } from '@heroicons/react/24/outline';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix de iconos (solo una vez a nivel módulo)
if (!L.Icon.Default.prototype._leaflet_id) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(`${lat},${lng}`);
    },
  });
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente interno que contiene el mapa real.
// Se monta solo cuando isOpen=true, se desmonta cuando isOpen=false.
// El key={mapKey} fuerza un remount limpio cada vez que se abre el modal.
// ─────────────────────────────────────────────────────────────────────────────
const MapInner = ({ value, onChange, isDark, height = '350px' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapCenter, setMapCenter] = useState([-16.5, -68.15]);
  const [mapZoom, setMapZoom] = useState(6);
  const mapRef = useRef(null);
  const searchRef = useRef(null);
  const timeoutRef = useRef(null);

  // Sincronizar centro cuando cambia el valor externo
  useEffect(() => {
    if (value) {
      const [lat, lng] = value.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter([lat, lng]);
        setMapZoom(15);
      }
    }
  }, [value]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Limpieza del timeout al desmontar
  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const searchLocation = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&countrycodes=bo&accept-language=es`
      );
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (e) {
      console.error('Error buscando:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (q.length >= 3) {
      timeoutRef.current = setTimeout(() => searchLocation(q), 500);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectLocation = (loc) => {
    const coords = `${loc.lat},${loc.lon}`;
    onChange(coords);
    setSearchQuery(loc.display_name);
    const lat = parseFloat(loc.lat);
    const lng = parseFloat(loc.lon);
    setMapCenter([lat, lng]);
    setMapZoom(15);
    setSuggestions([]);
    setShowSuggestions(false);
    if (mapRef.current) mapRef.current.flyTo([lat, lng], 15);
  };

  const handleMapClick = async (coords) => {
    onChange(coords);
    const [lat, lng] = coords.split(',');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&accept-language=es`
      );
      const data = await res.json();
      if (data.display_name) setSearchQuery(data.display_name);
    } catch (e) { /* silencioso */ }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
        onChange(coords);
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        setMapZoom(15);
        setLoading(false);
      },
      () => setLoading(false)
    );
  };

  const centerBolivia = () => {
    setMapCenter([-16.5, -68.15]);
    setMapZoom(6);
    if (mapRef.current) mapRef.current.flyTo([-16.5, -68.15], 6);
  };

  const marker = value
    ? value.split(',').map(Number).filter((n) => !isNaN(n))
    : null;

  return (
    <div className="space-y-3">
      {/* Buscador */}
      <div className="relative" ref={searchRef}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar dirección en Bolivia..."
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all
                ${isDark
                  ? 'bg-black/50 border border-white/20 text-white placeholder-gray-400'
                  : 'bg-white border border-gray-300 text-gray-800'
                }`}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-teal-500" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={getCurrentLocation}
            className="px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            title="Mi ubicación"
          >
            📍
          </button>
        </div>

        {/* Sugerencias flotantes */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            className={`absolute left-0 right-0 rounded-lg shadow-xl z-[500] overflow-hidden
              ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            style={{ top: '100%', marginTop: '4px', maxHeight: '250px', overflowY: 'auto' }}
          >
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => selectLocation(sug)}
                className={`w-full text-left px-3 py-2 text-xs transition-colors border-b last:border-b-0
                  ${isDark
                    ? 'hover:bg-gray-700 border-gray-700 text-white'
                    : 'hover:bg-gray-50 border-gray-100 text-gray-800'
                  }`}
              >
                <div className="flex items-start gap-2">
                  <MapPinIcon className={`w-3 h-3 mt-0.5 flex-shrink-0 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                  <span className="truncate">{sug.display_name.split(',').slice(0, 3).join(', ')}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={centerBolivia}
          className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors
            ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
        >
          <GlobeAltIcon className="w-3 h-3" />
          Bolivia
        </button>
        {value && (
          <button
            type="button"
            onClick={() => {
              if (mapRef.current && marker?.length === 2) {
                mapRef.current.flyTo(marker, 16);
              }
            }}
            className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors
              ${isDark ? 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-400' : 'bg-teal-100 hover:bg-teal-200 text-teal-700'}`}
          >
            <MapPinIcon className="w-3 h-3" />
            Centrar
          </button>
        )}
      </div>

      {/* Mapa — el key en MapContainer hace que Leaflet inicie limpio */}
      <div
        className={`rounded-lg overflow-hidden border ${isDark ? 'border-white/20' : 'border-gray-300'}`}
        style={{ height, minHeight: '280px' }}
      >
        <MapContainer
          ref={mapRef}
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {marker?.length === 2 && (
            <Marker position={marker}>
              <Popup>
                <div className="text-xs">
                  <strong>📍 Ubicación</strong><br />
                  {value}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Coordenadas actuales */}
      {value && (
        <div className={`p-2 rounded-lg text-xs font-mono ${isDark ? 'bg-teal-500/10 border border-teal-500/30 text-teal-400' : 'bg-teal-50 border border-teal-200 text-teal-600'}`}>
          {value}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT PRINCIPAL — úsalo en lugar del MapPicker que tenías
//
// Props:
//   isOpen  : boolean  — si el modal que contiene el mapa está abierto
//   value   : string   — coordenadas "lat,lng"
//   onChange: fn       — recibe el string "lat,lng"
//   isDark  : boolean
//   height  : string   — altura del mapa (default "350px")
// ─────────────────────────────────────────────────────────────────────────────
const MapPickerWrapper = ({ isOpen, value, onChange, isDark, height = '350px' }) => {
  const [mapKey, setMapKey] = useState(0);

  // Cada vez que el modal se abre, incrementamos el key.
  // Esto fuerza a Leaflet a montar un mapa completamente nuevo,
  // evitando el error "removeChild: nodo no es hijo".
  useEffect(() => {
    if (isOpen) {
      setMapKey((k) => k + 1);
    }
  }, [isOpen]);

  // No renderizar nada mientras el modal está cerrado
  if (!isOpen) return null;

  return <MapInner key={mapKey} value={value} onChange={onChange} isDark={isDark} height={height} />;
};

export default MapPickerWrapper;