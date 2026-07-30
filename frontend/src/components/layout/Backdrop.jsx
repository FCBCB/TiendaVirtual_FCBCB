// components/layout/Backdrop.jsx
import { useSidebar } from "../context/SidebarContext";

const Backdrop = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[45] lg:hidden transition-all duration-300"
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;