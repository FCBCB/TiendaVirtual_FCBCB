import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { API_URL, getImageUrl } from '../../components/config/api';

const HomeRepositoriosCarousel = () => {
  const [repositorios, setRepositorios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  // ✅ Obtener repositorios
  useEffect(() => {
    mountedRef.current = true;
    
    const fetchRepositorios = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/repositorios`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (mountedRef.current && response.ok && data.repositorios) {
          setRepositorios(data.repositorios);
        }
      } catch (error) {
        console.error('Error fetching repositorios:', error);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchRepositorios();

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // ✅ Auto-play del carrusel
  useEffect(() => {
    if (isHovered || repositorios.length === 0 || !mountedRef.current) return;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        setCurrentIndex((prev) => (prev + 1) % repositorios.length);
      }
    }, 4000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, repositorios.length]);

  // ✅ Memoizar URLs de imágenes (SOLO SE CALCULA UNA VEZ)
  const repositoriosConImagenes = useMemo(() => {
    return repositorios.map(repo => ({
      ...repo,
      logoUrl: repo.logo_repositorio ? getImageUrl(repo.logo_repositorio) : null
    }));
  }, [repositorios]);

  // ✅ Handlers memoizados
  const handlePrev = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  }, []);

  if (loading || repositorios.length === 0) return null;

  const visibleItems = 6;
  const totalItems = repositoriosConImagenes.length;
  const maxIndex = Math.max(0, totalItems - visibleItems);

  return (
    <section className="py-12 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h3 className="text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 font-light">
            Nuestros Espacios Culturales
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-light mt-1">
            Museos y centros culturales de la FCBCB
          </p>
        </div>

        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="overflow-hidden">
            <motion.div 
              ref={carouselRef}
              className="flex gap-8 items-center"
              animate={{ x: `-${currentIndex * (100 / visibleItems)}%` }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              style={{ width: `${(totalItems / visibleItems) * 100}%` }}
            >
              {repositoriosConImagenes.map((repo) => (
                <div
                  key={repo.id_repositorio}
                  className="flex-shrink-0 w-[calc(100%/6)] flex flex-col items-center group"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 group-hover:border-teal-500/50 transition-all duration-300">
                    {repo.logoUrl ? (
                      <img
                        src={repo.logoUrl}
                        alt={repo.nombre}
                        className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = `https://placehold.co/40x40/19ADA0/white?text=${repo.sigla?.substring(0, 2) || 'R'}`;
                        }}
                      />
                    ) : (
                      <span className="text-sm font-light text-gray-400 dark:text-gray-500">
                        {repo.sigla?.substring(0, 2) || 'R'}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 text-center font-light truncate max-w-[80px]">
                    {repo.sigla || repo.nombre?.substring(0, 10)}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {totalItems > visibleItems && (
            <>
              <button
                onClick={handlePrev}
                className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 ${
                  currentIndex === 0 ? 'opacity-0 cursor-default' : 'opacity-100 hover:bg-white dark:hover:bg-gray-700'
                }`}
                disabled={currentIndex === 0}
              >
                <ChevronLeftIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={handleNext}
                className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 ${
                  currentIndex >= maxIndex ? 'opacity-0 cursor-default' : 'opacity-100 hover:bg-white dark:hover:bg-gray-700'
                }`}
                disabled={currentIndex >= maxIndex}
              >
                <ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.min(totalItems - visibleItems + 1, 8) }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex 
                  ? 'w-6 h-1 bg-teal-500' 
                  : 'w-3 h-1 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeRepositoriosCarousel;