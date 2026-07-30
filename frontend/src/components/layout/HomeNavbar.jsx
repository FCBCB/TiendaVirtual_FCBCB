// src/components/layout/HomeNavbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon, 
  XMarkIcon,
  ShoppingBagIcon,
  BookOpenIcon,
  DocumentIcon,
  TicketIcon,
  UserIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
// ✅ IMPORTAR EL HOOK DEL CARRITO
import { useCart } from '../context/CartContext';

// ✅ Logo desde la carpeta public
const LOGO_URL = '/logo_blanco_fcbcb_2026.png';

const HomeNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const { user, logout } = useAuth();
  // ✅ OBTENER ESTADO DEL CARRITO
  const { itemCount, toggleCart } = useCart();
  const navigate = useNavigate();

  // ✅ Verificar si el usuario es admin o responsable (rol 1 o 2)
  const isAdminOrResponsable = user && (user.id_rol === 1 || user.id_rol === 2);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloquear scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // ✅ Colores para cada item del menú
  const itemColors = {
    'Inicio': 'from-blue-500 to-cyan-400',
    'Souvenirs': 'from-amber-500 to-orange-400',
    'Libros': 'from-purple-500 to-pink-400',
    'Material Gratuito': 'from-teal-500 to-emerald-400',
    'Tickets': 'from-rose-500 to-red-400',
  };

  const navItems = [
    { name: 'Inicio', path: '/', icon: HomeIcon },
    { name: 'Souvenirs', path: '/tienda/souvenirs', icon: ShoppingBagIcon },
    { name: 'Libros', path: '/tienda/libros', icon: BookOpenIcon },
    { name: 'Material Gratuito', path: '/material', icon: DocumentIcon },
    { name: 'Tickets', path: '/ticketsTienda', icon: TicketIcon },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearch(false);
      setSearchTerm('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  // Variantes de animación para el menú móvil
  const menuVariants = {
    hidden: { 
      opacity: 0,
      x: '100%',
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    visible: { 
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      x: '100%',
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  // Variantes para el botón hamburguesa
  const hamburgerVariants = {
    closed: { 
      rotate: 0,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    },
    open: { 
      rotate: 90,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? 'bg-black/90 dark:bg-black/95 backdrop-blur-xl shadow-2xl border-b border-white/10' 
            : 'bg-gradient-to-b from-black/60 via-black/30 to-transparent backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo con imagen */}
            <Link 
              to="/" 
              className="flex items-center gap-3 flex-shrink-0 group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <motion.div 
                className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg flex-shrink-0"
                whileHover={{ scale: 1.05, rotate: -5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <img 
                  src={LOGO_URL} 
                  alt="FCBCB Logo"
                  className="w-16 h-16 md:w-9 md:h-9 object-contain"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/50x50/1a2f3a/19ADA0?text=FCBCB';
                  }}
                />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-xl"
                  animate={{ 
                    opacity: isHovered ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              
              <motion.div 
                className="hidden sm:block"
                animate={{ 
                  x: isHovered ? 5 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-lg font-bold text-white drop-shadow-lg tracking-wide">
                  FCBCB
                </span>
                <span className="text-[10px] text-white/60 block -mt-0.5 font-medium tracking-wider">
                  TIENDA VIRTUAL
                </span>
              </motion.div>
            </Link>

            {/* ✅ Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    to={item.path}
                    className="relative px-6 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white transition-all duration-300 group overflow-hidden"
                  >
                    <motion.span 
                      className={`absolute inset-0 rounded-xl bg-gradient-to-r ${itemColors[item.name] || 'from-teal-500 to-blue-500'} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                      animate={{
                        opacity: hoveredItem === item.name ? 0.25 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    <motion.span 
                      className={`absolute -inset-0.5 rounded-xl bg-gradient-to-r ${itemColors[item.name] || 'from-teal-500 to-blue-500'} opacity-0 group-hover:opacity-60`}
                      animate={{
                        opacity: hoveredItem === item.name ? 0.6 : 0,
                        scale: hoveredItem === item.name ? 1 : 0.95,
                      }}
                      transition={{ duration: 0.3 }}
                      style={{ zIndex: -1 }}
                    />
                    
                    <span className="relative z-10 flex items-center gap-2.5">
                      {item.icon && <item.icon className="w-4 h-4" />}
                      {item.name}
                    </span>
                    
                    <motion.span 
                      className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r ${itemColors[item.name] || 'from-teal-500 to-blue-500'} rounded-full`}
                      animate={{
                        width: hoveredItem === item.name ? '50%' : '0%',
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* ✅ Desktop Actions - CON BOTÓN DEL CARRITO */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearch(!showSearch)}
                className="p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </motion.button>

              {/* ✅ BOTÓN DEL CARRITO */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleCart}
                className="relative p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg"
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </motion.span>
                )}
              </motion.button>

              {user ? (
                <motion.div 
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <motion.div 
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-sm"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      {user.nombre?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </motion.div>
                    <span className="text-sm font-medium text-white/90 hidden xl:block">
                      {user.nombre || user.username}
                    </span>
                  </div>
                  
                  {isAdminOrResponsable && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/dashboard"
                        className="relative px-5 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300 overflow-hidden group"
                      >
                        <motion.span
                          className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        <span className="relative z-10">Dashboard</span>
                      </Link>
                    </motion.div>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div 
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-white/5"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span className="hidden xl:inline">Iniciar Sesión</span>
                  </Link>
                  <Link
                    to="/registro"
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300 hover:scale-105"
                  >
                    <UserPlusIcon className="w-4 h-4" />
                    <span className="hidden xl:inline">Crear Cuenta</span>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative w-12 h-12 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors group"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={isMobileMenuOpen ? 'open' : 'closed'}
                variants={hamburgerVariants}
                className="relative w-6 h-6"
              >
                <motion.span
                  className="absolute left-0 top-1/2 w-6 h-0.5 bg-white rounded-full"
                  animate={{
                    rotate: isMobileMenuOpen ? 45 : 0,
                    y: isMobileMenuOpen ? 0 : -6,
                    opacity: isMobileMenuOpen ? 1 : 1
                  }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                />
                <motion.span
                  className="absolute left-0 top-1/2 w-6 h-0.5 bg-white rounded-full"
                  animate={{
                    opacity: isMobileMenuOpen ? 0 : 1,
                    scale: isMobileMenuOpen ? 0 : 1
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="absolute left-0 top-1/2 w-6 h-0.5 bg-white rounded-full"
                  animate={{
                    rotate: isMobileMenuOpen ? -45 : 0,
                    y: isMobileMenuOpen ? 0 : 6
                  }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                />
              </motion.div>
            </motion.button>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="py-4 border-t border-white/10"
              >
                <form onSubmit={handleSearch} className="flex gap-3">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar souvenirs, libros, material..."
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:ring-2 focus:ring-teal-400/50 text-white placeholder-white/50 outline-none transition-all duration-300"
                    autoFocus
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300"
                  >
                    Buscar
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-40 lg:hidden bg-gradient-to-br from-gray-900 via-gray-900 to-black pt-20 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Logo en menú móvil */}
                <motion.div 
                  variants={itemVariants}
                  className="flex items-center gap-3 pb-4 border-b border-white/10"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <img 
                      src={LOGO_URL} 
                      alt="FCBCB Logo"
                      className="w-9 h-9 object-contain"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/50x50/1a2f3a/19ADA0?text=FCBCB';
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-white">FCBCB</span>
                    <p className="text-xs text-white/50 font-medium">Tienda Virtual</p>
                  </div>
                </motion.div>

                {/* Navegación móvil */}
                <div className="space-y-3">
                  {navItems.map((item) => (
                    <motion.div
                      key={item.path}
                      variants={itemVariants}
                      whileHover={{ x: 10, scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-4 px-5 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300 group`}
                      >
                        {item.icon && (
                          <motion.div 
                            className={`p-2.5 rounded-lg bg-white/5 group-hover:bg-gradient-to-r ${itemColors[item.name] || 'from-teal-500 to-blue-500'} transition-all duration-300`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <item.icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                          </motion.div>
                        )}
                        <span className={`text-white font-medium text-lg group-hover:bg-gradient-to-r ${itemColors[item.name] || 'from-teal-500 to-blue-500'} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}>
                          {item.name}
                        </span>
                        <motion.svg 
                          className="w-4 h-4 text-white/20 ml-auto group-hover:text-teal-400/50 transition-all group-hover:translate-x-1" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          animate={{
                            x: 0
                          }}
                          whileHover={{ x: 5 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </motion.svg>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* ✅ Sección de usuario - móvil CON CARRITO */}
                <motion.div 
                  variants={itemVariants}
                  className="border-t border-white/10 pt-6 mt-4 space-y-4"
                >
                  {/* ✅ BOTÓN DEL CARRITO EN MENÚ MÓVIL */}
                  <button
                    onClick={() => {
                      toggleCart();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-5 py-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/30 transition-all duration-300 group"
                  >
                    <div className="p-2.5 rounded-lg bg-amber-500/20 group-hover:bg-amber-500/30 transition-colors">
                      <ShoppingBagIcon className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-white font-medium">Carrito</span>
                    {itemCount > 0 && (
                      <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {itemCount}
                      </span>
                    )}
                  </button>

                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10">
                        <motion.div 
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white font-semibold text-sm"
                          whileHover={{ scale: 1.1, rotate: 10 }}
                        >
                          {user.nombre?.charAt(0) || user.username?.charAt(0) || 'U'}
                        </motion.div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {user.nombre || user.username}
                          </p>
                          <p className="text-xs text-white/50">{user.email}</p>
                        </div>
                      </div>
                      
                      {isAdminOrResponsable && (
                        <Link
                          to="/dashboard"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-5 py-4 rounded-xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 hover:from-teal-500/30 hover:to-emerald-500/30 border border-teal-500/30 transition-all duration-300 group"
                        >
                          <span className="text-white font-medium">Dashboard</span>
                          <motion.svg 
                            className="w-4 h-4 text-white/50 ml-auto group-hover:translate-x-1 transition-transform" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            animate={{ x: 0 }}
                            whileHover={{ x: 5 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </motion.svg>
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-5 py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all duration-300 w-full group"
                      >
                        <span className="text-red-400 font-medium">Cerrar Sesión</span>
                        <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-400/50 ml-auto group-hover:translate-x-1 transition-transform" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-5 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group"
                      >
                        <UserIcon className="w-5 h-5 text-white/70 group-hover:text-teal-400 transition-colors" />
                        <span className="text-white font-medium group-hover:text-teal-400 transition-colors">Iniciar Sesión</span>
                        <motion.svg 
                          className="w-4 h-4 text-white/20 ml-auto group-hover:text-teal-400/50 transition-all group-hover:translate-x-1" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          animate={{ x: 0 }}
                          whileHover={{ x: 5 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </motion.svg>
                      </Link>
                      <Link
                        to="/registro"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-5 py-4 rounded-xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 hover:from-teal-500/30 hover:to-emerald-500/30 border border-teal-500/30 transition-all duration-300 group"
                      >
                        <UserPlusIcon className="w-5 h-5 text-teal-400" />
                        <span className="text-white font-medium">Crear Cuenta</span>
                        <motion.svg 
                          className="w-4 h-4 text-teal-400/50 ml-auto group-hover:translate-x-1 transition-transform" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          animate={{ x: 0 }}
                          whileHover={{ x: 5 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </motion.svg>
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default HomeNavbar;