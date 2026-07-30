import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MagnifyingGlassIcon, GlobeAltIcon, MapPinIcon } from '@heroicons/react/24/outline'; // ← Agregar MapPinIcon

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para manejar clics en el mapa
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(`${lat},${lng}`);
    },
  });
  return null;
};

const MapPicker = ({ value, onChange, isDark, height = '400px' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [mapCenter, setMapCenter] = useState([-16.5, -68.15]); // Centro de Bolivia
  const [mapZoom, setMapZoom] = useState(6);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const mapRef = useRef(null);
  const searchContainerRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Extraer coordenadas del valor actual
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
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Búsqueda automática mientras escribe (debounce)
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSuggestions(true);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (query.length >= 3) {
      const timeout = setTimeout(() => {
        searchLocation(query);
      }, 500);
      setSearchTimeout(timeout);
    } else if (query.length === 0) {
      setSuggestions([]);
    }
  };

  // Función para buscar lugares en Nominatim
  const searchLocation = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&countrycodes=bo&accept-language=es`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error buscando ubicación:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectLocation = (location) => {
    const coords = `${location.lat},${location.lon}`;
    onChange(coords);
    setSearchQuery(location.display_name);
    setMapCenter([parseFloat(location.lat), parseFloat(location.lon)]);
    setMapZoom(15);
    setSuggestions([]);
    setShowSuggestions(false);
    
    if (mapRef.current) {
      mapRef.current.flyTo([parseFloat(location.lat), parseFloat(location.lon)], 15);
    }
  };

  const handleMapClick = (coords) => {
    onChange(coords);
    reverseGeocode(coords);
  };

  const reverseGeocode = async (coords) => {
    const [lat, lng] = coords.split(',');
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`
      );
      const data = await response.json();
      if (data.display_name) {
        setSearchQuery(data.display_name);
      }
    } catch (error) {
      console.error('Error en reverse geocoding:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude},${position.coords.longitude}`;
          onChange(coords);
          setMapCenter([position.coords.latitude, position.coords.longitude]);
          setMapZoom(15);
          reverseGeocode(coords);
          setLoading(false);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          alert('No se pudo obtener tu ubicación. Por favor, busca manualmente.');
          setLoading(false);
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización');
    }
  };

  const centerInBolivia = () => {
    setMapCenter([-16.5, -68.15]);
    setMapZoom(6);
    if (mapRef.current) {
      mapRef.current.flyTo([-16.5, -68.15], 6);
    }
  };

  return (
    <div className="space-y-3">
      {/* Barra de búsqueda */}
      <div className="relative" ref={searchContainerRef}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation(searchQuery)}
              placeholder="Buscar dirección o lugar en Bolivia..."
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all
                ${isDark ? 'bg-black/50 border border-white/20 text-white placeholder-gray-400' : 'bg-white border border-gray-300 text-gray-800'}`}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-teal-500"></div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => searchLocation(searchQuery)}
            disabled={loading || !searchQuery.trim()}
            className="px-3 py-2 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={loading}
            className="px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            title="Mi ubicación"
          >
            📍
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute left-0 right-0 rounded-lg shadow-xl z-[200] overflow-hidden"
            style={{ top: '100%', marginTop: '4px', maxHeight: '300px' }}
          >
            <div className={`overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`} style={{ maxHeight: '300px' }}>
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => selectLocation(sug)}
                  className={`w-full text-left px-3 py-2 text-xs transition-all duration-150 border-b last:border-b-0
                    ${isDark ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 border-gray-100'}`}
                >
                  <div className="flex items-start gap-2">
                    <MapPinIcon className={`w-3 h-3 mt-0.5 flex-shrink-0 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {sug.display_name.split(',')[0]}
                      </p>
                      <p className={`text-[10px] truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {sug.display_name.split(',').slice(1, 3).join(',').trim()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={centerInBolivia}
          className={`px-2 py-1 rounded-lg text-xs transition-colors flex items-center gap-1
            ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
        >
          <GlobeAltIcon className="w-3 h-3" />
          Bolivia
        </button>
        {value && (
          <button
            type="button"
            onClick={() => {
              const [lat, lng] = value.split(',').map(Number);
              if (mapRef.current && !isNaN(lat) && !isNaN(lng)) {
                mapRef.current.flyTo([lat, lng], 18);
              }
            }}
            className={`px-2 py-1 rounded-lg text-xs transition-colors flex items-center gap-1
              ${isDark ? 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-400' : 'bg-teal-100 hover:bg-teal-200 text-teal-700'}`}
          >
            <MapPinIcon className="w-3 h-3" />
            Centrar
          </button>
        )}
      </div>

      <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-white/20' : 'border-gray-300'}`} style={{ height: height, minHeight: '300px' }}>
        <MapContainer
          ref={mapRef}
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {value && (
            <Marker position={value.split(',').map(Number)}>
              <Popup>
                <div className="text-xs">
                  <strong>📍 Ubicación</strong><br />
                  Lat: {value.split(',')[0]}<br />
                  Lng: {value.split(',')[1]}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {value && (
        <div className={`p-2 rounded-lg ${isDark ? 'bg-teal-500/10 border border-teal-500/30' : 'bg-teal-50 border border-teal-200'}`}>
          <p className={`text-xs font-mono ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{value}</p>
          {searchQuery && (
            <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{searchQuery}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MapPicker;