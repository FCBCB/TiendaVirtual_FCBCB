import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  BookOpenIcon, 
  DocumentIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline';

const categories = [
  {
    id: 'souvenirs',
    name: 'Souvenirs',
    description: 'Recuerdos artesanales de Bolivia',
    icon: ShoppingBagIcon,
    color: 'from-amber-500 to-amber-600',
    link: '/tienda/souvenirs'
  },
  {
    id: 'libros',
    name: 'Libros',
    description: 'Publicaciones y literatura boliviana',
    icon: BookOpenIcon,
    color: 'from-blue-500 to-blue-600',
    link: '/tienda/libros'
  },
  {
    id: 'material',
    name: 'Material Gratuito',
    description: 'Descargas y documentos culturales',
    icon: DocumentIcon,
    color: 'from-teal-500 to-teal-600',
    link: '/material'
  },
  {
    id: 'eventos',
    name: 'Eventos Culturales',
    description: 'Actividades y exposiciones',
    icon: CalendarIcon,
    color: 'from-purple-500 to-purple-600',
    link: '/eventos'
  }
];

const HomeCategories = () => {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
          >
            Explora Nuestras Categorías
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-2 text-lg text-gray-600 dark:text-gray-400"
          >
            Encuentra todo lo que la FCBCB tiene para ti
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Link
                to={category.link}
                className="block group h-full"
              >
                <div className="relative h-full rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${category.color}`} />
                  
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${category.color} text-white shadow-lg mb-4`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {category.description}
                  </p>
                  
                  <div className="mt-4 flex items-center text-teal-600 dark:text-teal-400 font-medium text-sm group-hover:translate-x-2 transition-transform">
                    Explorar
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeCategories;