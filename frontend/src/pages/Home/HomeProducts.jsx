import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { API_URL } from '../../components/config/api';
import ProductCard from '../../components/ui/dropdown/ProductCard';
import SectionHeader from '../../components/ui/dropdown/SectionHeader';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

const HomeProducts = ({ filters, searchTerm }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('souvenirs');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/${activeTab}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (response.ok) {
          let items = activeTab === 'souvenirs' ? data.souvenirs : data.libros;
          
          // Aplicar filtros
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            items = items.filter(item => 
              (item.nombre?.toLowerCase().includes(term) ||
               item.titulo_libro?.toLowerCase().includes(term) ||
               item.descripcion_general?.toLowerCase().includes(term) ||
               item.autor_nombre_completo?.toLowerCase().includes(term))
            );
          }
          
          if (filters?.categoria && filters.categoria !== 'todos') {
            items = items.filter(item => 
              item.categoria_nombre?.toLowerCase() === filters.categoria.toLowerCase()
            );
          }
          
          if (filters?.precioMin) {
            items = items.filter(item => item.precio >= parseFloat(filters.precioMin));
          }
          
          if (filters?.precioMax) {
            items = items.filter(item => item.precio <= parseFloat(filters.precioMax));
          }
          
          // Ordenar
          if (filters?.orden) {
            switch(filters.orden) {
              case 'precio_asc':
                items.sort((a, b) => a.precio - b.precio);
                break;
              case 'precio_desc':
                items.sort((a, b) => b.precio - a.precio);
                break;
              case 'nombre_asc':
                items.sort((a, b) => (a.nombre || a.titulo_libro || '').localeCompare(b.nombre || b.titulo_libro || ''));
                break;
              case 'nombre_desc':
                items.sort((a, b) => (b.nombre || b.titulo_libro || '').localeCompare(a.nombre || a.titulo_libro || ''));
                break;
              default:
                break;
            }
          }
          
          setProducts(items.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeTab, filters, searchTerm]);

  const tabs = [
    { id: 'souvenirs', label: 'Souvenirs' },
    { id: 'libros', label: 'Libros' }
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Productos Destacados"
          subtitle="Descubre nuestra selección de souvenirs y libros"
          icon={ShoppingBagIcon}
        />

        <div className="flex justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label} {activeTab === tab.id && `(${products.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse h-96" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id_producto || product.id_libro}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard
                  product={product}
                  type={activeTab === 'souvenirs' ? 'souvenir' : 'libro'}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron productos con los filtros seleccionados
            </p>
          </div>
        )}

        {products.length > 0 && (
          <div className="text-center mt-8">
            <Link
              to={`/tienda/${activeTab}`}
              className="inline-flex items-center gap-2 px-6 py-3 text-teal-600 dark:text-teal-400 font-medium hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-colors"
            >
              Ver todos los {activeTab === 'souvenirs' ? 'souvenirs' : 'libros'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeProducts;