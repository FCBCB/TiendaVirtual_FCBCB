import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [previousPath, setPreviousPath] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (!mobile) {
        setIsExpanded(true);
        // No cerramos isMobileOpen aquí para evitar conflictos
      } else {
        setIsExpanded(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Función para cerrar el sidebar móvil
  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(prev => !prev);
    } else {
      setIsExpanded(prev => !prev);
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(prev => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        isExpanded,
        isMobileOpen,
        isMobile,
        isHovered,
        setIsExpanded,
        setIsMobileOpen,
        setIsHovered,
        toggleSidebar,
        toggleMobileSidebar,
        closeMobileSidebar,
        previousPath,
        setPreviousPath
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};