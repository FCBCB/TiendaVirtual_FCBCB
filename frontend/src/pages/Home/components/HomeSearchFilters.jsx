import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const HomeSearchFilters = ({ onSearch, onFilterChange, filters }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [localFilters, setLocalFilters] = useState({
    tipo: 'todos',
    categoria: 'todos',
    precioMin: '',
    precioMax: '',
    orden: 'reciente'
  });

  const tipos = ['todos', 'souvenir', 'libro', 'ticket', 'material'];
  const categorias = [
    'todos',
    'Arte',
    'Historia',
    'Literatura',
    'Ciencia',
    'Educación',
    'Religión',
    'Filosofía',
    'Arquitectura',
    'Música'
  ];
  const ordenes = ['reciente', 'precio_asc', 'precio_desc', 'nombre_asc', 'nombre_desc'];

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch && onSearch(searchTerm);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange && onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      tipo: 'todos',
      categoria: 'todos',
      precioMin: '',
      precioMax: '',
      orden: 'reciente'
    };
    setLocalFilters(defaultFilters);
    onFilterChange && onFilterChange(defaultFilters);
    setSearchTerm('');
    onSearch && onSearch('');
  };

  return (
    <div className="mb-8">
      {/* Barra de búsqueda principal */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar souvenirs, libros, material gratuito..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
        >
          Buscar
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <FunnelIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Filtros</span>
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        {(searchTerm || localFilters.tipo !== 'todos' || localFilters.categoria !== 'todos') && (
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
          >
            <XMarkIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        )}
      </form>

      {/* Panel de filtros */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: showFilters ? 'auto' : 0,
          opacity: showFilters ? 1 : 0,
          marginTop: showFilters ? 16 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo
              </label>
              <select
                value={localFilters.tipo}
                onChange={(e) => handleFilterChange('tipo', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
              >
                {tipos.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo === 'todos' ? 'Todos' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <select
                value={localFilters.categoria}
                onChange={(e) => handleFilterChange('categoria', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
              >
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'todos' ? 'Todas' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Precio mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Precio desde (Bs.)
              </label>
              <input
                type="number"
                value={localFilters.precioMin}
                onChange={(e) => handleFilterChange('precioMin', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
                min="0"
              />
            </div>

            {/* Precio máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Precio hasta (Bs.)
              </label>
              <input
                type="number"
                value={localFilters.precioMax}
                onChange={(e) => handleFilterChange('precioMax', e.target.value)}
                placeholder="Sin límite"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
                min="0"
              />
            </div>

            {/* Orden */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ordenar por
              </label>
              <select
                value={localFilters.orden}
                onChange={(e) => handleFilterChange('orden', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
              >
                <option value="reciente">Más reciente</option>
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
                <option value="nombre_asc">Nombre: A-Z</option>
                <option value="nombre_desc">Nombre: Z-A</option>
              </select>
            </div>
          </div>

          {/* Filtros activos */}
          {(localFilters.tipo !== 'todos' || localFilters.categoria !== 'todos' || 
            localFilters.precioMin || localFilters.precioMax) && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              {localFilters.tipo !== 'todos' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm">
                  Tipo: {localFilters.tipo}
                  <button
                    onClick={() => handleFilterChange('tipo', 'todos')}
                    className="hover:text-red-500"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {localFilters.categoria !== 'todos' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm">
                  Categoría: {localFilters.categoria}
                  <button
                    onClick={() => handleFilterChange('categoria', 'todos')}
                    className="hover:text-red-500"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {localFilters.precioMin && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm">
                  Desde: Bs. {localFilters.precioMin}
                  <button
                    onClick={() => handleFilterChange('precioMin', '')}
                    className="hover:text-red-500"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {localFilters.precioMax && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm">
                  Hasta: Bs. {localFilters.precioMax}
                  <button
                    onClick={() => handleFilterChange('precioMax', '')}
                    className="hover:text-red-500"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default HomeSearchFilters;