import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { API_URL } from '../config/api';
import ProductCard from '../components/ui/ProductCard';
import MaterialCard from '../components/ui/MaterialCard';
import HomeNavbar from '../components/layout/HomeNavbar';
import HomeFooter from './Home/HomeFooter';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState({
    souvenirs: [],
    libros: [],
    material: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todos');

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Buscar en souvenirs
        const souvenirsRes = await fetch(`${API_URL}/api/souvenirs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const souvenirsData = await souvenirsRes.json();
        const souvenirs = (souvenirsData.souvenirs || []).filter(item => 
          item.nombre?.toLowerCase().includes(query.toLowerCase()) ||
          item.descripcion_general?.toLowerCase().includes(query.toLowerCase())
        );

        // Buscar en libros
        const librosRes = await fetch(`${API_URL}/api/libros`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const librosData = await librosRes.json();
        const libros = (librosData.libros || []).filter(item => 
          item.titulo_libro?.toLowerCase().includes(query.toLowerCase()) ||
          item.nombre?.toLowerCase().includes(query.toLowerCase()) ||
          item.autor_nombre_completo?.toLowerCase().includes(query.toLowerCase())
        );

        // Buscar en material
        const materialRes = await fetch(`${API_URL}/api/material`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const materialData = await materialRes.json();
        const material = (materialData.materiales || []).filter(item => 
          item.titulo?.toLowerCase().includes(query.toLowerCase()) ||
          item.descripcion?.toLowerCase().includes(query.toLowerCase())
        );

        setResults({ souvenirs, libros, material });
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const totalResults = results.souvenirs.length + results.libros.length + results.material.length;

  const tabs = [
    { id: 'todos', label: `Todos (${totalResults})` },
    { id: 'souvenirs', label: `Souvenirs (${results.souvenirs.length})` },
    { id: 'libros', label: `Libros (${results.libros.length})` },
    { id: 'material', label: `Material (${results.material.length})` }
  ];

  const getFilteredResults = () => {
    switch(activeTab) {
      case 'souvenirs': return results.souvenirs.map(r => ({ ...r, type: 'souvenir' }));
      case 'libros': return results.libros.map(r => ({ ...r, type: 'libro' }));
      case 'material': return results.material.map(r => ({ ...r, type: 'material' }));
      default: return [
        ...results.souvenirs.map(r => ({ ...r, type: 'souvenir' })),
        ...results.libros.map(r => ({ ...r, type: 'libro' })),
        ...results.material.map(r => ({ ...r, type: 'material' }))
      ];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <HomeNavbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
        </div>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <HomeNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MagnifyingGlassIcon className="w-8 h-8 text-teal-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Resultados para "{query}"
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {totalResults} {totalResults === 1 ? 'resultado encontrado' : 'resultados encontrados'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Resultados */}
        {totalResults === 0 ? (
          <div className="text-center py-16">
            <MagnifyingGlassIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Prueba con otras palabras o revisa los filtros de búsqueda
            </p>
            <Link
              to="/"
              className="inline-block mt-4 px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredResults().map((item, index) => {
              if (item.type === 'souvenir' || item.type === 'libro') {
                return (
                  <ProductCard
                    key={item.id_producto || item.id_libro || index}
                    product={item}
                    type={item.type}
                  />
                );
              } else {
                return (
                  <MaterialCard
                    key={item.id_material || index}
                    material={item}
                  />
                );
              }
            })}
          </div>
        )}
      </div>

      <HomeFooter />
    </div>
  );
};

export default SearchResults;