import { motion } from 'framer-motion';
import { CalendarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

const EventCard = ({ event }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer"
    >
      <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className="aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={event.imagen || 'https://placehold.co/800x450/1a2f3a/19ADA0?text=Evento'}
            alt={event.titulo}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Fecha destacada */}
        <div className="absolute top-3 left-3 px-4 py-2 rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg text-center">
          <span className="block text-2xl font-bold text-teal-600 dark:text-teal-400">
            {new Date(event.fecha_evento).getDate()}
          </span>
          <span className="block text-xs font-medium text-gray-600 dark:text-gray-400">
            {new Date(event.fecha_evento).toLocaleDateString('es-ES', { month: 'short' })}
          </span>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-800 dark:text-white line-clamp-2 group-hover:text-teal-600 transition-colors">
            {event.titulo}
          </h3>
          
          <div className="mt-2 space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 flex-shrink-0" />
              <span>{event.ubicacion || 'Ubicación no especificada'}</span>
            </div>
            {event.hora_inicio && (
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 flex-shrink-0" />
                <span>{event.hora_inicio} - {event.hora_fin || ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;