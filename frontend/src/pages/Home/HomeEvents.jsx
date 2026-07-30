import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { API_URL } from '../../components/config/api';
import EventCard from '../../components/ui/dropdown/EventCard';
import SectionHeader from '../../components/ui/dropdown/SectionHeader';
import { CalendarIcon } from '@heroicons/react/24/outline';

const HomeEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/eventos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (response.ok) {
          setEvents((data.eventos || []).slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Eventos Culturales"
          subtitle="Próximas actividades y exposiciones"
          icon={CalendarIcon}
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse h-72" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id_evento}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>

            {events.length > 0 && (
              <div className="text-center mt-8">
                <Link
                  to="/eventos"
                  className="inline-flex items-center gap-2 px-6 py-3 text-teal-600 dark:text-teal-400 font-medium hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-colors"
                >
                  Ver todos los eventos
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default HomeEvents;