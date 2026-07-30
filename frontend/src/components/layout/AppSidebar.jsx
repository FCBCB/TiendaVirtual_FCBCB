import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import {
  ChartBarIcon,
  BuildingLibraryIcon,
  ShoppingBagIcon,
  BookOpenIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  XMarkIcon,
  PhotoIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserIcon,
  TagIcon
} from '@heroicons/react/24/outline';

// ✅ Importar el logo desde la carpeta public
const LOGO_URL = '/logo_blanco_fcbcb_2026.png';

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, closeMobileSidebar, isHovered, setIsHovered, isMobile } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const [isLibrosOpen, setIsLibrosOpen] = useState(false);

  const userRole = user?.id_rol;
  const isAdmin = userRole === 1;

  // Verificar si estamos en alguna ruta de libros
  useEffect(() => {
    if (location.pathname.includes('/dashboard/libros') || 
        location.pathname.includes('/dashboard/autores') || 
        location.pathname.includes('/dashboard/categorias')) {
      setIsLibrosOpen(true);
    }
  }, [location.pathname]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeMobileSidebar();
      }
    };
    
    if (isMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileOpen, closeMobileSidebar]);

  const navItems = [
    { 
      id: 'dashboard', 
      icon: <ChartBarIcon className="w-5 h-5" />, 
      name: "Dashboard", 
      path: "/dashboard",
      activeColor: "text-emerald-400",
      bgActive: "bg-emerald-500/20"
    },
    { 
      id: 'repositorios', 
      icon: <BuildingLibraryIcon className="w-5 h-5" />, 
      name: "Repositorios", 
      path: "/dashboard/repositorios",
      activeColor: "text-blue-400",
      bgActive: "bg-blue-500/20"
    },
    { 
      id: 'souvenirs', 
      icon: <ShoppingBagIcon className="w-5 h-5" />, 
      name: "Souvenirs", 
      path: "/dashboard/souvenirs",
      activeColor: "text-amber-400",
      bgActive: "bg-amber-500/20"
    },
    { 
      id: 'libros', 
      icon: <BookOpenIcon className="w-5 h-5" />, 
      name: "Libros", 
      path: "/dashboard/libros",
      activeColor: "text-purple-400",
      bgActive: "bg-purple-500/20",
      hasSubmenu: true,
      submenu: [
        { 
          id: 'libros-list', 
          icon: <BookOpenIcon className="w-4 h-4" />, 
          name: "Lista de Libros", 
          path: "/dashboard/libros",
          activeColor: "text-purple-400",
          bgActive: "bg-purple-500/20"
        },
        { 
          id: 'autores', 
          icon: <UserIcon className="w-4 h-4" />, 
          name: "Autores", 
          path: "/dashboard/autores",
          activeColor: "text-cyan-400",
          bgActive: "bg-cyan-500/20"
        },
        { 
          id: 'categorias', 
          icon: <TagIcon className="w-4 h-4" />, 
          name: "Categorías", 
          path: "/dashboard/categorias",
          activeColor: "text-pink-400",
          bgActive: "bg-pink-500/20"
        }
      ]
    },
    { 
      id: 'Material', 
      icon: <PhotoIcon className="w-5 h-5" />, 
      name: "Material Gratito", 
      path: "/dashboard/materialGratuito",
      activeColor: "text-rose-400",
      bgActive: "bg-rose-500/20"
    },
    { 
      id: 'Tickets', 
      icon: <CalendarIcon className="w-5 h-5" />, 
      name: "Tickets", 
      path: "/dashboard/tickets",
      activeColor: "text-teal-400",
      bgActive: "bg-teal-500/20"
    },
    { 
      id: 'ventas', 
      icon: <CalendarIcon className="w-5 h-5" />, 
      name: "Ventas", 
      path: "/dashboard/ventas",
      activeColor: "text-teal-400",
      bgActive: "bg-teal-500/20"
    },
    ...(isAdmin ? [{ 
      id: 'usuarios', 
      icon: <UserGroupIcon className="w-5 h-5" />, 
      name: "Gestión de Usuarios", 
      path: "/dashboard/usuarios",
      activeColor: "text-indigo-400",
      bgActive: "bg-indigo-500/20"
    }] : []),
    { 
      id: 'perfil', 
      icon: <Cog6ToothIcon className="w-5 h-5" />, 
      name: "Editar Perfil", 
      path: "/dashboard/perfil",
      activeColor: "text-gray-400",
      bgActive: "bg-gray-500/20"
    }
  ];

  const isActive = (path) => {
    if (path === "/dashboard" && location.pathname === "/dashboard") return true;
    if (path !== "/dashboard" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isSubmenuActive = (path) => {
    return location.pathname === path;
  };

  const handleLinkClick = () => {
    if (isMobile && isMobileOpen) {
      setTimeout(() => closeMobileSidebar(), 100);
    }
  };

  const toggleLibros = () => {
    setIsLibrosOpen(!isLibrosOpen);
  };

  const renderUserInfo = () => {
    if (!isExpanded && !isHovered && !isMobileOpen) return null;

    const roleNames = { 1: "Administrador", 2: "Responsable" };
    let nombreUsuario = user?.username || "Usuario";
    if (user?.nombre) nombreUsuario = `${user.nombre} ${user.apellido_paterno || ''}`.trim();

    return (
      <div className="px-3 py-4 mb-6 bg-white/5 rounded-xl border border-white/20">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              {user?.nombre?.charAt(0) || user?.username?.charAt(0) || "W"}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {nombreUsuario}
            </p>
            <p className="text-xs text-white/60 truncate">
              {roleNames[userRole] || "Usuario"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar item con submenú
  const renderNavItem = (item) => {
    const active = isActive(item.path);
    const showText = isExpanded || isHovered || isMobileOpen;

    if (item.hasSubmenu) {
      return (
        <li key={item.id}>
          <button
            onClick={toggleLibros}
            className={`flex items-center w-full px-3 py-2.5 rounded-xl transition-all duration-200
              ${active ? `${item.bgActive} ${item.activeColor}` : 'text-gray-400 hover:bg-white/10 hover:text-white'}
              ${!showText ? "justify-center" : "justify-between"}
            `}
          >
            <div className="flex items-center">
              <span className="flex-shrink-0">{item.icon}</span>
              {showText && <span className="ml-3 text-sm font-medium">{item.name}</span>}
            </div>
            {showText && (
              <span className="ml-auto">
                {isLibrosOpen ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </span>
            )}
          </button>
          
          {showText && isLibrosOpen && (
            <ul className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
              {item.submenu.map((subItem) => {
                const subActive = isSubmenuActive(subItem.path);
                return (
                  <li key={subItem.id}>
                    <Link
                      to={subItem.path}
                      onClick={handleLinkClick}
                      className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-sm
                        ${subActive 
                          ? `${subItem.bgActive} ${subItem.activeColor}`
                          : 'text-gray-400 hover:bg-white/10 hover:text-white'
                        }
                      `}
                    >
                      <span className="flex-shrink-0">{subItem.icon}</span>
                      <span className="ml-3 text-sm">{subItem.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={item.id}>
        <Link
          to={item.path}
          onClick={handleLinkClick}
          className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200
            ${active 
              ? `${item.bgActive} ${item.activeColor}`
              : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }
            ${!showText ? "justify-center" : "justify-start"}
          `}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          {showText && <span className="ml-3 text-sm font-medium">{item.name}</span>}
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Overlay móvil */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}
      
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 bg-black border-r border-white/20 text-white h-screen transition-all duration-300 z-50 overflow-y-auto
          ${isExpanded || isMobileOpen ? "w-[280px]" : isHovered ? "w-[280px]" : "w-[80px]"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
        onMouseEnter={() => !isExpanded && !isMobileOpen && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ============================================ */}
        {/* LOGO - ARRIBA Y TEXTO ABAJO EN COLUMNA */}
        {/* ============================================ */}
        <div className="py-6 px-4">
          <Link 
            to="/dashboard" 
            className={`flex ${(isExpanded || isHovered || isMobileOpen) ? 'flex-col items-center gap-2' : 'flex-col items-center gap-2'}`} 
            onClick={handleLinkClick}
          >
            {/* Logo - centrado */}

              <img 
                src={LOGO_URL} 
                alt="FCBCB Logo"
                className="w-42 h-42 object-contain"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/80x80/1a2f3a/19ADA0?text=FCBCB';
                }}
              />

            
            {/* Texto - siempre visible abajo del logo */}
            <div className="flex flex-col items-center text-center">
              <span className="text-sm font-bold text-white tracking-wide">TIENDA VIRTUAL</span>
              <span className="text-xs text-white/60 font-medium tracking-wider">FCBCB</span>
            </div>
          </Link>
        </div>
        
        {/* Información del usuario */}
        <div className="px-4">
          {renderUserInfo()}
        </div>
        
        {/* Menú */}
        <div className="px-4 pb-6">
          <h2 className={`mb-4 text-xs uppercase text-white/60 font-semibold tracking-wider transition-all duration-300
            ${(!isExpanded && !isHovered && !isMobileOpen) ? "text-center" : "px-3"}
          `}>
            {(isExpanded || isHovered || isMobileOpen) ? "Menú Principal" : "☰"}
          </h2>
          <ul className="space-y-1">
            {navItems.map((item) => renderNavItem(item))}
          </ul>
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
          <div className="text-center">
            <p className="text-xs text-white/40">FCBCB v1.0</p>
            <p className="text-[10px] text-white/30 mt-1">Sistema de Gestión Cultural</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;