// src/pages/Home/Home.jsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// ✅ IMPORTAR MiniCart

import HomeNavbar from '../../components/layout/HomeNavbar';
import HomeHero from './HomeHero';
import HomeRepositoriosCarousel from './HomeRepositoriosCarousel';
import HomeEventsMinimal from './HomeEventsMinimal';
import HomeProductsMinimal from './HomeProductsMinimal';
import HomeMaterial from './HomeMaterial';
import HomeFooter from './HomeFooter';
import HomeSearchFilters from './components/HomeSearchFilters';
import Galeria from './Galeria';
import { MarqueeDemo } from './MarqueeDemo';
import EventosCalendar from '../../components/eventos/EventosCalendar';
import MiniCart from '../../components/common/MiniCart';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearchTerm(q);
    }
  }, [location.search]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term) {
      window.history.pushState({}, '', `/?q=${encodeURIComponent(term)}`);
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <HomeNavbar />
      <HomeHero />

      {/* Barra de búsqueda y filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
          <HomeSearchFilters
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            filters={filters}
          />
        </div>
      </div>
      
      {/* Productos minimalistas */}
      <HomeProductsMinimal />
      <Galeria />

      {/* Material Gratuito */}
      <HomeMaterial filters={filters} searchTerm={searchTerm} />
      
      {/* Eventos minimalistas */}
      <HomeEventsMinimal />
      
      {/* Carrusel de logos de repositorios */}
      <MarqueeDemo />
      <EventosCalendar />
      <HomeFooter />

      {/* ✅ MiniCart - Siempre presente en toda la app */}
      <MiniCart />
    </div>
  );
};

export default Home;