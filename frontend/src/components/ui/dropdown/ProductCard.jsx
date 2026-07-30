import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../config/api';

const ProductCard = ({ 
  product, 
  type = 'souvenir',
  onView 
}) => {
  const imageUrl = getImageUrl(product.imagen_principal || product.portada_libro);
  
  const getTypeColor = () => {
    switch(type) {
      case 'souvenir': return 'from-amber-500 to-amber-600';
      case 'libro': return 'from-blue-500 to-blue-600';
      case 'ticket': return 'from-purple-500 to-purple-600';
      default: return 'from-teal-500 to-teal-600';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer"
      onClick={() => onView && onView(product)}
    >
      <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300">
        {/* Imagen */}
        <div className="aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={imageUrl || 'https://placehold.co/400x500/1a2f3a/19ADA0?text=Sin+Imagen'}
            alt={product.nombre || product.titulo_libro}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Badge de tipo */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getTypeColor()} shadow-lg`}>
          {type.toUpperCase()}
        </div>

        {/* Badge de stock */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-sm text-white">
          {product.stock_total || product.stock || 0} uds.
        </div>

        {/* Contenido */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 dark:text-white line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {product.nombre || product.titulo_libro}
          </h3>
          {product.autor_nombre_completo && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {product.autor_nombre_completo}
            </p>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
              Bs. {product.precio}
            </span>
            <button className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
              Ver más
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;