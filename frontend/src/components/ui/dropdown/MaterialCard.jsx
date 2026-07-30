import { motion } from 'framer-motion';
import { DocumentIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline';
import { getImageUrl } from '../../config/api';

const MaterialCard = ({ material, onView, onDownload }) => {
  const imageUrl = getImageUrl(material.imagen_portada);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer"
      onClick={() => onView && onView(material)}
    >
      <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={imageUrl || 'https://placehold.co/400x300/1a2f3a/19ADA0?text=Sin+Imagen'}
            alt={material.titulo}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-sm text-white flex items-center gap-1">
          <DocumentIcon className="w-3 h-3" />
          {material.tipo_material?.toUpperCase()}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-800 dark:text-white line-clamp-2 group-hover:text-teal-600 transition-colors">
            {material.titulo}
          </h3>
          {material.autor_nombre_completo && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {material.autor_nombre_completo}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <ArrowDownTrayIcon className="w-4 h-4" />
                {material.descargas || 0}
              </span>
              <span className="flex items-center gap-1">
                <EyeIcon className="w-4 h-4" />
                {material.visitas || 0}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload && onDownload(material);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
            >
              Descargar
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MaterialCard;