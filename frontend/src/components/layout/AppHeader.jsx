import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import NotificationDropdown from "../Header/NotificationDropdown";
import UserDropdown from "../Header/UserDropdown";
import { SparklesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const AppHeader = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { isMobileOpen, toggleSidebar } = useSidebar();

  // Detectar scroll para efecto en móvil
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleToggle = () => {
    toggleSidebar();
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Versión Desktop - sin cambios */}
      <div className="hidden lg:block w-full bg-white dark:bg-black border-b border-primary/20 transition-colors duration-300">
        <div className="flex flex-col items-center justify-between w-full lg:flex-row lg:px-6">
          <div className="flex items-center justify-between w-full gap-2 px-4 py-3 border-b border-primary/20 lg:border-b-0 lg:px-0 lg:py-4">
            
            {/* Botón de toggle sidebar */}
            <button
              className="relative flex items-center justify-center w-10 h-10 text-primary-light rounded-xl transition-all duration-300 hover:bg-primary/10 hover:scale-105 active:scale-95"
              onClick={handleToggle}
              aria-label="Toggle Sidebar"
            >
              <span className="absolute inset-0 rounded-xl bg-primary/0 hover:bg-primary/10 transition-all duration-300" />
              {isMobileOpen ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="relative z-10"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="14"
                  viewBox="0 0 16 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="relative z-10"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>

            {/* Buscador Desktop */}
            <div className="flex-1 max-w-xl mx-4">
              <form className="relative">
                <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : 'scale-100'}`}>
                  <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Buscar..."
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full h-11 rounded-xl border border-primary/20 bg-light/50 dark:bg-dark/50 pl-11 pr-14 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                  <button className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-primary/20 bg-light/30 dark:bg-dark/30 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                    <span className="text-xs">⌘</span>
                    <span className="text-xs">K</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Acciones Desktop */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <ThemeToggleButton />
                <NotificationDropdown />
              </div>
              <UserDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* Versión Móvil - Rediseñada con fondo elegante */}
      <div className="lg:hidden">
        <div className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-500 ease-out
          ${isScrolled 
            ? 'bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-indigo-900/95 backdrop-blur-xl shadow-2xl border-b border-white/10' 
            : 'bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 shadow-lg'
          }
        `}>
          <div className="flex items-center justify-between px-4 py-3">
            {/* Botón de toggle sidebar */}
            <button
              className="relative flex items-center justify-center w-10 h-10 text-white/70 rounded-xl transition-all duration-300 hover:bg-white/10 hover:scale-105 active:scale-95 hover:text-white"
              onClick={handleToggle}
              aria-label="Toggle Sidebar"
            >
              {isMobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg width="18" height="14" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>

            {/* Logo móvil - Versión elegante para fondo oscuro */}
            <Link to="/" className="group">
              <div className="flex items-center gap-2.5">
                <div className={`
                  relative transition-all duration-300 group-hover:scale-105
                  ${isScrolled 
                    ? 'w-8 h-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center' 
                    : 'w-8 h-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center'
                  }
                `}>
                  <svg className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 21v-4H7v4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9h6" />
                  </svg>
                </div>
                <span className={`
                  text-lg font-light tracking-wide transition-all duration-300
                  ${isScrolled 
                    ? 'text-white/90 group-hover:text-white' 
                    : 'text-white/90 group-hover:text-white'
                  }
                `}>
                  Wayruru
                </span>
              </div>
            </Link>

            {/* Botón de menú móvil */}
            <button
              onClick={toggleApplicationMenu}
              className="flex items-center justify-center w-10 h-10 text-white/70 rounded-xl transition-all duration-300 hover:bg-white/10 hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>

          {/* Menú móvil desplegable */}
          <div
            className={`
              ${isApplicationMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"} 
              overflow-hidden transition-all duration-500 ease-in-out
              backdrop-blur-xl border-t border-white/10
              ${isScrolled 
                ? 'bg-slate-900/90' 
                : 'bg-slate-800/90'
              }
            `}
          >
            <div className="px-4 py-4 space-y-4">
              {/* Buscador móvil */}
              <form className="relative">
                <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
                  <MagnifyingGlassIcon className="w-5 h-5 text-white/40" />
                </span>
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full h-11 rounded-xl bg-white/10 border border-white/20 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300"
                />
              </form>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                  <ThemeToggleButton />
                  <NotificationDropdown />
                </div>
                <UserDropdown />
              </div>
            </div>
          </div>
        </div>

        {/* Espaciador para evitar que el contenido quede debajo del header fijo */}
        <div className="h-14"></div>
      </div>
    </header>
  );
};

export default AppHeader;