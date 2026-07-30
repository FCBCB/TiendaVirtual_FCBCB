import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";
import { useTheme } from "../context/ThemeContext";

const LayoutContent = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen xl:flex relative">
      {/* Sidebar siempre oscuro - sin clases de tema */}
      <div className="relative z-[50]">
        <AppSidebar />
        <Backdrop />
      </div>
      
      {/* Contenido que cambia con el tema */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out relative z-[1]
          ${isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"}
          ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <main className={`w-full p-0 relative ${isDark ? 'bg-black' : 'bg-gray-50'} transition-colors duration-300 min-h-screen`}>
          <div className="p-6">
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
  <Outlet />
</main>
          </div>
        </main>
      </div>
    </div>
  );
};

const AppLayout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;