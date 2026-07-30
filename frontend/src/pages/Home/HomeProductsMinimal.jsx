import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { API_URL, getImageUrl } from '../../components/config/api';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const HomeProductsMinimal = () => {
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
          const items = activeTab === 'souvenirs' ? data.souvenirs : data.libros;
          setProducts((items || []).slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeTab]);

  const tabs = [
    { id: 'souvenirs', label: 'Souvenirs' },
    { id: 'libros', label: 'Libros' }
  ];

  if (loading) {
    return (
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4" />
              <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse h-64" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-light text-gray-900 dark:text-white">Productos Destacados</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-light">
              Souvenirs y libros de la cultura boliviana
            </p>
          </div>
          <div className="flex items-center gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs font-light transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-gray-900 dark:text-white border-b border-teal-500 pb-1'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id_producto || product.id_libro}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={getImageUrl(product.imagen_principal || product.portada_libro)}
                    alt={product.nombre || product.titulo_libro}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x400/1a2f3a/19ADA0?text=No+Image';
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-800 dark:text-white line-clamp-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {product.nombre || product.titulo_libro}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-light mt-0.5">
                  Bs. {product.precio}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to={`/tienda/${activeTab}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group"
          >
            Ver todos los {activeTab === 'souvenirs' ? 'souvenirs' : 'libros'}
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeProductsMinimal;