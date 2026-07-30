import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './components/context/AuthContext';
import { ThemeProvider } from './components/context/ThemeContext';
import { SidebarProvider } from './components/context/SidebarContext';
// ✅ IMPORTAR CartProvider
import { CartProvider } from './components/context/CartContext';
import App from './App';
import './index.css';

// Importar CSS de Leaflet solo una vez
import 'leaflet/dist/leaflet.css';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <SidebarProvider>
            {/* ✅ CartProvider envuelve toda la aplicación */}
            <CartProvider>
              <App />
            </CartProvider>
          </SidebarProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);