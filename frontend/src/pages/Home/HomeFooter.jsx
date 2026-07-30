import { Link } from 'react-router-dom';
import { 
  FacebookIcon, 
  InstagramIcon, 
  TwitterIcon, 
  YoutubeIcon 
} from 'lucide-react';

const HomeFooter = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-white">FCBCB</h2>
            <p className="mt-2 text-gray-400 max-w-md">
              Fundación Cultural del Banco Central de Bolivia - Preservando la identidad cultural de Bolivia
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <TwitterIcon className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <YoutubeIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Tienda</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/tienda/souvenirs" className="text-gray-300 hover:text-white transition-colors">Souvenirs</Link></li>
              <li><Link to="/tienda/libros" className="text-gray-300 hover:text-white transition-colors">Libros</Link></li>
              <li><Link to="/material" className="text-gray-300 hover:text-white transition-colors">Material Gratuito</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Información</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/eventos" className="text-gray-300 hover:text-white transition-colors">Eventos</Link></li>
              <li><Link to="/contacto" className="text-gray-300 hover:text-white transition-colors">Contacto</Link></li>
              <li><Link to="/acerca" className="text-gray-300 hover:text-white transition-colors">Acerca de</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} FCBCB - Fundación Cultural del Banco Central de Bolivia. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;