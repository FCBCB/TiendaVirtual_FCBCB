import { Marquee } from "../../components/ui/MarqueeRepo";
import { getImageUrl } from '../../components/config/api';
import { useState, useEffect } from 'react';
import { API_URL } from '../../components/config/api';

export const MarqueeDemo = () => {
  const [repositorios, setRepositorios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepositorios = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/repositorios`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (response.ok && data.repositorios) {
          setRepositorios(data.repositorios);
        }
      } catch (error) {
        console.error('Error fetching repositorios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositorios();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col max-w-4xl mx-auto w-full overflow-hidden py-12">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-6xl mx-auto w-full overflow-hidden py-12">
      <h2 className="text-2xl font-light text-center text-gray-800 dark:text-white mb-6">
        Nuestros Espacios Culturales
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 font-light">
        Museos y centros culturales de la FCBCB
      </p>

      <div className="overflow-hidden flex items-center mx-auto w-full">
        <Marquee
          speed={25}
          direction="horizontal"
          fadeEdges={true}
          pauseOnTap={true}
          speedOnHover={10}
          className="h-40"
        >
          {repositorios.map((repo) => {
            const logoUrl = repo.logo_repositorio ? getImageUrl(repo.logo_repositorio) : null;
            
            return (
              <div
                key={repo.id_repositorio}
                className="flex flex-col items-center justify-center p-4 rounded-xl h-32 w-32 group hover:scale-105 transition-transform duration-300"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 group-hover:border-teal-500/50 transition-all duration-300 shadow-sm group-hover:shadow-md">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={repo.nombre}
                      className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = `https://placehold.co/48x48/19ADA0/white?text=${repo.sigla?.substring(0, 2) || 'R'}`;
                      }}
                    />
                  ) : (
                    <span className="text-lg font-light text-gray-400 dark:text-gray-500">
                      {repo.sigla?.substring(0, 2) || 'R'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 text-center font-medium truncate max-w-[80px]">
                  {repo.sigla || repo.nombre?.substring(0, 12)}
                </p>
              </div>
            );
          })}
          
          {/* Repetir para efecto infinito */}
          {repositorios.map((repo) => {
            const logoUrl = repo.logo_repositorio ? getImageUrl(repo.logo_repositorio) : null;
            
            return (
              <div
                key={`${repo.id_repositorio}-duplicate`}
                className="flex flex-col items-center justify-center p-4 rounded-xl h-32 w-32 group hover:scale-105 transition-transform duration-300"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 group-hover:border-teal-500/50 transition-all duration-300 shadow-sm group-hover:shadow-md">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={repo.nombre}
                      className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = `https://placehold.co/48x48/19ADA0/white?text=${repo.sigla?.substring(0, 2) || 'R'}`;
                      }}
                    />
                  ) : (
                    <span className="text-lg font-light text-gray-400 dark:text-gray-500">
                      {repo.sigla?.substring(0, 2) || 'R'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 text-center font-medium truncate max-w-[80px]">
                  {repo.sigla || repo.nombre?.substring(0, 12)}
                </p>
              </div>
            );
          })}
        </Marquee>
      </div>

      <p className="text-center mt-6 text-xs text-gray-400 dark:text-gray-500 font-light">
        Haz clic o arrastra para interactuar con el carrusel
      </p>
    </div>
  );
};