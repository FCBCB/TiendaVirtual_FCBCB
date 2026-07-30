// src/pages/Dashboard/DashboardHome.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  Globe, Download, FileText, TrendingUp, MapPin,
  Calendar, Star, Eye, BookOpen, Newspaper, Award,
  Activity, ShoppingBag, Library, CalendarDays, Image,
  Menu, X
} from 'lucide-react';
import { useTheme } from '../../components/context/ThemeContext';
import { API_URL, getImageUrl } from '../../components/config/api';
import DamReport from './DAMReport';
import CRT from './CRT';
import MIC from './MIC';
import BL from './BL';
import blDataJson from './blData.json';
import crtDataJson from './crtData.json';
import micDataJson from './micData.json';
import EventosCalendar from '../../components/eventos/EventosCalendar';

// Colores basados en Wayruru
const COLORS = {
  teal: '#19ADA0',
  tealDark: '#0C6660',
  red: '#DF3828',
  orange: '#F4A261',
  yellow: '#E9C46A',
  blue: '#264653',
  purple: '#6C5B7B',
  pink: '#F06C6C'
};

const CHART_COLORS = ['#19ADA0', '#E9C46A', '#F4A261', '#DF3828', '#264653', '#6C5B7B', '#F06C6C'];

const DashboardHome = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedView, setSelectedView] = useState('general');
  const [loading, setLoading] = useState(true);
  const [showDamReport, setShowDamReport] = useState(false);
  const [showCrtReport, setShowCrtReport] = useState(false);
  const [showMicReport, setShowMicReport] = useState(false);
  const [showBlReport, setShowBlReport] = useState(false);
  const [blData, setBlData] = useState(null);
  const [micData, setMicData] = useState(null);
  const [crtData, setCrtData] = useState(null);
  const [damJsonData, setDamJsonData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalSouvenirs: 0,
    totalLibros: 0,
    totalCatalogos: 0,
    totalEventos: 0,
    totalRepositorios: 0,
    totalProductos: 0,
    repositorios: [],
    souvenirs: [],
    libros: [],
    catalogos: [],
    eventos: []
  });
  const [visitasData, setVisitasData] = useState([]);

  // Función para cargar el JSON de la DAM
  const loadDamData = async () => {
    try {
      const response = await fetch('/src/pages/Dashboard/P2.json');
      const data = await response.json();
      setDamJsonData(data);
      setShowDamReport(true);
    } catch (error) {
      console.error('Error loading DAM data:', error);
      try {
        const data = require('./P2.json');
        setDamJsonData(data);
        setShowDamReport(true);
      } catch (err) {
        console.error('Error loading with require:', err);
        alert('No se pudo cargar el archivo P2.json');
      }
    }
  };
  // Agrega esta función junto a loadDamData
const loadCrtData = async () => {
  try {
    setCrtData(crtDataJson);
    setShowCrtReport(true);
  } catch (error) {
    console.error('Error loading CRT data:', error);
    alert('No se pudo cargar los datos del CRT');
  }
};
// Función para cargar datos del MIC
// Función para cargar datos del MIC (usando el JSON importado)
const loadMicData = async () => {
  try {
    setMicData(micDataJson);
    setShowMicReport(true);
  } catch (error) {
    console.error('Error loading MIC data:', error);
    alert('No se pudo cargar los datos del MIC');
  }
};
// Función para cargar datos del BL (Bill of Lading)
const loadBlData = async () => {
  try {
    setBlData(blDataJson);
    setShowBlReport(true);
  } catch (error) {
    console.error('Error loading BL data:', error);
    alert('No se pudo cargar los datos del Bill of Lading');
  }
};

  // Obtener estadísticas del backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const reposResponse = await fetch(`${API_URL}/api/repositorios/admin/todos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const reposData = await reposResponse.json();
        const repositorios = reposData.repositorios || [];
        
        const souvenirsResponse = await fetch(`${API_URL}/api/souvenirs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const souvenirsData = await souvenirsResponse.json();
        const souvenirs = souvenirsData.souvenirs || [];
        
        const librosResponse = await fetch(`${API_URL}/api/libros`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const librosData = await librosResponse.json();
        const libros = librosData.libros || [];
        
        const catalogosResponse = await fetch(`${API_URL}/api/catalogos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const catalogosData = await catalogosResponse.json();
        const catalogos = catalogosData.catalogos || [];
        
        const eventosResponse = await fetch(`${API_URL}/api/eventos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const eventosData = await eventosResponse.json();
        const eventos = eventosData.eventos || [];
        
        const totalSouvenirs = souvenirs.length;
        const totalLibros = libros.length;
        const totalCatalogos = catalogos.length;
        const totalEventos = eventos.length;
        const totalProductos = totalSouvenirs + totalLibros + totalCatalogos;
        const totalRepositorios = repositorios.length;
        
        const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const visitasPorDia = diasSemana.map((dia, i) => ({
          dia,
          visitas: Math.floor(Math.random() * totalProductos * 2) + totalProductos,
          descargas: Math.floor(Math.random() * totalProductos) + Math.floor(totalProductos / 2)
        }));
        
        const visitasPorPais = [
          { pais: 'Bolivia', visitas: totalProductos * 15, porcentaje: 53 },
          { pais: 'Argentina', visitas: totalProductos * 4, porcentaje: 14 },
          { pais: 'Perú', visitas: totalProductos * 3, porcentaje: 10 },
          { pais: 'Chile', visitas: totalProductos * 2.5, porcentaje: 8 },
          { pais: 'Brasil', visitas: totalProductos * 1.8, porcentaje: 6 },
          { pais: 'España', visitas: totalProductos * 1.2, porcentaje: 4 },
          { pais: 'México', visitas: totalProductos * 0.9, porcentaje: 3 },
          { pais: 'EE.UU.', visitas: totalProductos * 0.6, porcentaje: 2 }
        ];
        
        const visitasPorCiudad = [
          { ciudad: 'La Paz', visitas: totalProductos * 8 },
          { ciudad: 'Santa Cruz', visitas: totalProductos * 5 },
          { ciudad: 'Cochabamba', visitas: totalProductos * 4 },
          { ciudad: 'Sucre', visitas: totalProductos * 2.5 },
          { ciudad: 'Potosí', visitas: totalProductos * 1.8 },
          { ciudad: 'Tarija', visitas: totalProductos * 1.3 }
        ];
        
        const ultimasActividades = [
          ...souvenirs.slice(0, 2).map(s => ({ titulo: s.nombre, tipo: 'Souvenir', repositorio: s.repositorio_nombre || 'General', fecha: s.fecha_creacion })),
          ...libros.slice(0, 2).map(l => ({ titulo: l.titulo, tipo: 'Libro', repositorio: l.repositorio_nombre || 'General', fecha: l.fecha_creacion })),
          ...catalogos.slice(0, 2).map(c => ({ titulo: c.titulo, tipo: 'Catálogo', repositorio: c.repositorio_nombre || 'General', fecha: c.fecha_creacion })),
          ...eventos.slice(0, 2).map(e => ({ titulo: e.titulo, tipo: 'Evento', repositorio: e.repositorio_nombre || 'General', fecha: e.fecha_creacion }))
        ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);
        
        setStats({
          totalSouvenirs,
          totalLibros,
          totalCatalogos,
          totalEventos,
          totalRepositorios,
          totalProductos,
          repositorios,
          souvenirs,
          libros,
          catalogos,
          eventos,
          visitasPorDia,
          visitasPorPais,
          visitasPorCiudad,
          ultimasActividades
        });
        
        setVisitasData(visitasPorDia);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-BO').format(num || 0);
  };
  
  const getInitials = (text) => {
    return text ? text.substring(0, 2).toUpperCase() : 'R';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wayruru-teal mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Cargando dashboard...</p>
        </div>
      </div>
    );
  }
  
  const chartConfig = {
    gridStroke: isDark ? '#333' : '#e0e0e0',
    textColor: isDark ? '#888' : '#666',
    tooltipBg: isDark ? '#1a2f3a' : '#ffffff',
    tooltipBorder: isDark ? 'none' : '#e0e0e0',
    tooltipText: isDark ? '#fff' : '#333'
  };
  
  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 max-w-full overflow-x-hidden">
        
        {/* Header con estadísticas rápidas - Versión Responsive */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Grid de tarjetas responsive */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            <div className="bg-gradient-to-br from-wayruru-teal to-wayruru-teal-deep p-4 sm:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-black dark:text-white text-xs sm:text-sm">Souvenirs</p>
                  <p className="text-2xl sm:text-3xl font-bold break-words">{formatNumber(stats.totalSouvenirs)}</p>
                </div>
                <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-white/50 flex-shrink-0" />
              </div>
              <div className="mt-2 sm:mt-4 text-black dark:text-white text-xs sm:text-sm">
                Productos disponibles
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-wayruru-teal to-wayruru-teal-deep p-4 sm:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-black dark:text-white text-xs sm:text-sm">Libros</p>
                  <p className="text-2xl sm:text-3xl font-bold break-words">{formatNumber(stats.totalLibros)}</p>
                </div>
                <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-white/50 flex-shrink-0" />
              </div>
              <div className="mt-2 sm:mt-4 text-black dark:text-white text-xs sm:text-sm">
                En biblioteca digital
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-wayruru-teal-deep to-wayruru-teal p-4 sm:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-black dark:text-white text-xs sm:text-sm">Catálogos</p>
                  <p className="text-2xl sm:text-3xl font-bold break-words">{formatNumber(stats.totalCatalogos)}</p>
                </div>
                <Image className="h-8 w-8 sm:h-10 sm:w-10 text-white/50 flex-shrink-0" />
              </div>
              <div className="mt-2 sm:mt-4 text-black dark:text-white text-xs sm:text-sm">
                Exposiciones y colecciones
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-wayruru-red to-red-700 p-4 sm:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-black dark:text-white text-xs sm:text-sm">Eventos</p>
                  <p className="text-2xl sm:text-3xl font-bold break-words">{formatNumber(stats.totalEventos)}</p>
                </div>
                <CalendarDays className="h-8 w-8 sm:h-10 sm:w-10 text-white/50 flex-shrink-0" />
              </div>
              <div className="mt-2 sm:mt-4 text-black dark:text-white text-xs sm:text-sm">
                Actividades culturales
              </div>
            </div>
          </div>
          
          {/* Botón DAM responsive - se mueve abajo en móvil */}
          <button
            onClick={loadDamData}
            className="w-full lg:w-auto px-4 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-wayruru-teal to-wayruru-teal-deep hover:from-wayruru-teal-deep hover:to-wayruru-teal text-white rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all duration-300 bg-purple-400"
          >
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-medium text-black dark:text-white  text-sm sm:text-base">Ver DAM UREAL01</span>
          </button>
          {/* En el header, junto al botón DAM */}
          <button
            onClick={loadCrtData}
            className="w-full lg:w-auto px-4 sm:px-5 py-2 sm:py-3 bg-amber-400 text-white rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all duration-300"
          >
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-medium text-black dark:text-white text-sm sm:text-base">Ver CRT</span>
          </button>
          {/* En el header, junto a los botones DAM y CRT */}
          <button
            onClick={loadMicData}
            className="w-full lg:w-auto px-4 sm:px-5 py-2 sm:py-3 bg-green-500 hover:from-blue-800 hover:to-wayruru-blue text-white rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all duration-300"
          >
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-medium text-black dark:text-white text-sm sm:text-base">Ver MIC/DTA</span>
          </button>
          {/* En el header, junto a los botones DAM, CRT y MIC */}
          <button
            onClick={loadBlData}
            className="w-full lg:w-auto px-4 sm:px-5 py-2 sm:py-3 bg-red-400 hover:from-purple-800 hover:to-wayruru-purple text-white rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all duration-300"
          >
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-medium text-black dark:text-white text-sm sm:text-base">Ver BL</span>
          </button>
        </div>
        
        {/* Segunda fila de estadísticas - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-4 sm:p-6 border`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Repositorios</p>
                <p className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} break-words`}>
                  {formatNumber(stats.totalRepositorios)}
                </p>
              </div>
              <Library className={`h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 ${isDark ? 'text-wayruru-teal' : 'text-wayruru-teal'}`} />
            </div>
            <div className="mt-3 sm:mt-4 flex items-center gap-2 flex-wrap">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-wayruru-teal flex-shrink-0" />
              <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Activos y con contenido
              </span>
            </div>
          </div>
          
          <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-4 sm:p-6 border`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Productos</p>
                <p className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} break-words`}>
                  {formatNumber(stats.totalProductos)}
                </p>
              </div>
              <FileText className={`h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 ${isDark ? 'text-wayruru-teal' : 'text-wayruru-teal'}`} />
            </div>
            <div className="mt-3 sm:mt-4 flex items-center gap-2 flex-wrap">
              <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-wayruru-teal flex-shrink-0" />
              <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Disponibles en la plataforma
              </span>
            </div>
          </div>
        </div>
        
        {/* Selector de vista - Scroll horizontal en móvil */}
        <div className="relative">
          <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
            <div className={`flex space-x-2 border-b min-w-max ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <button
                onClick={() => setSelectedView('general')}
                className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-colors relative whitespace-nowrap ${
                  selectedView === 'general'
                    ? `text-wayruru-teal border-b-2 border-wayruru-teal`
                    : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Actividad General
              </button>
              <button
                onClick={() => setSelectedView('productos')}
                className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-colors relative whitespace-nowrap ${
                  selectedView === 'productos'
                    ? `text-wayruru-teal border-b-2 border-wayruru-teal`
                    : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Productos
              </button>
              <button
                onClick={() => setSelectedView('geografico')}
                className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-colors relative whitespace-nowrap ${
                  selectedView === 'geografico'
                    ? `text-wayruru-teal border-b-2 border-wayruru-teal`
                    : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Distribución
              </button>
              <button
                onClick={() => setSelectedView('eventos')}
                className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-colors relative whitespace-nowrap ${
                  selectedView === 'eventos'
                    ? `text-wayruru-teal border-b-2 border-wayruru-teal`
                    : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Eventos Culturales
              </button>
            </div>
          </div>
        </div>
        
        {/* Contenido de las vistas - Responsive */}
        {selectedView === 'general' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Gráfico de visitas - Altura ajustable */}
            <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-4 sm:p-6 border`}>
              <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <Eye className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 text-wayruru-teal flex-shrink-0`} />
                <span className="break-words">Visitas a la plataforma (Últimos 7 días)</span>
              </h3>
              <div className="w-full h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.visitasPorDia}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridStroke} />
                    <XAxis dataKey="dia" stroke={chartConfig.textColor} tick={{ fontSize: 10 }} />
                    <YAxis stroke={chartConfig.textColor} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: chartConfig.tooltipBg, border: chartConfig.tooltipBorder, borderRadius: '8px', fontSize: '12px' }}
                      labelStyle={{ color: chartConfig.tooltipText }}
                    />
                    <Area type="monotone" dataKey="visitas" stroke={COLORS.teal} fill={COLORS.teal} fillOpacity={0.3} />
                    <Area type="monotone" dataKey="descargas" stroke={COLORS.yellow} fill={COLORS.yellow} fillOpacity={0.3} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Distribución de productos - Grid responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-4 sm:p-6 border`}>
                <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  <BarChart className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 text-wayruru-teal flex-shrink-0`} />
                  <span className="break-words">Distribución por Tipo</span>
                </h3>
                <div className="w-full h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { nombre: 'Souvenirs', cantidad: stats.totalSouvenirs },
                      { nombre: 'Libros', cantidad: stats.totalLibros },
                      { nombre: 'Catálogos', cantidad: stats.totalCatalogos }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridStroke} />
                      <XAxis dataKey="nombre" stroke={chartConfig.textColor} tick={{ fontSize: 10 }} />
                      <YAxis stroke={chartConfig.textColor} tick={{ fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: chartConfig.tooltipBg, border: chartConfig.tooltipBorder, borderRadius: '8px', fontSize: '12px' }}
                        labelStyle={{ color: chartConfig.tooltipText }}
                      />
                      <Bar dataKey="cantidad" fill={COLORS.teal} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-4 sm:p-6 border`}>
                <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  <PieChart className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 text-wayruru-teal flex-shrink-0`} />
                  <span className="break-words">Proporción de Contenido</span>
                </h3>
                <div className="w-full h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Souvenirs', value: stats.totalSouvenirs },
                          { name: 'Libros', value: stats.totalLibros },
                          { name: 'Catálogos', value: stats.totalCatalogos },
                          { name: 'Eventos', value: stats.totalEventos }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => window.innerWidth > 640 ? `${name} ${(percent * 100).toFixed(0)}%` : `${(percent * 100).toFixed(0)}%`}
                        outerRadius={window.innerWidth > 640 ? 100 : 70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[0, 1, 2, 3].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: chartConfig.tooltipBg, border: chartConfig.tooltipBorder, borderRadius: '8px', fontSize: '12px' }}
                        labelStyle={{ color: chartConfig.tooltipText }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Últimas actividades - Lista responsive */}
            <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-4 sm:p-6 border`}>
              <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <Activity className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 text-wayruru-teal flex-shrink-0`} />
                <span className="break-words">Últimas Actividades</span>
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {stats.ultimasActividades?.slice(0, 5).map((item, index) => (
                  <div key={index} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 ${isDark ? 'bg-black/20' : 'bg-gray-100'} rounded-lg gap-2 sm:gap-3`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-7 h-7 sm:w-8 sm:h-8 bg-wayruru-teal/20 text-wayruru-teal rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0`}>
                        {getInitials(item.tipo)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'} text-sm sm:text-base break-words`}>
                          {item.titulo}
                        </p>
                        <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} break-words`}>
                          {item.tipo} • {item.repositorio}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0 ml-10 sm:ml-0`}>
                      {item.fecha ? new Date(item.fecha).toLocaleDateString('es-BO') : 'Reciente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {selectedView === 'productos' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className={`${isDark ? 'bg-white/5 border-l-4 border-wayruru-teal' : 'bg-white border-l-4 border-wayruru-teal'} rounded-xl shadow-lg p-4 sm:p-6`}>
                <div className="flex items-center gap-3">
                  <ShoppingBag className={`h-6 w-6 sm:h-8 sm:w-8 text-wayruru-teal flex-shrink-0`} />
                  <div className="min-w-0">
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Souvenirs</p>
                    <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} break-words`}>
                      {formatNumber(stats.totalSouvenirs)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`${isDark ? 'bg-white/5 border-l-4 border-wayruru-yellow' : 'bg-white border-l-4 border-wayruru-yellow'} rounded-xl shadow-lg p-4 sm:p-6`}>
                <div className="flex items-center gap-3">
                  <BookOpen className={`h-6 w-6 sm:h-8 sm:w-8 text-wayruru-yellow flex-shrink-0`} />
                  <div className="min-w-0">
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Libros</p>
                    <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} break-words`}>
                      {formatNumber(stats.totalLibros)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`${isDark ? 'bg-white/5 border-l-4 border-wayruru-orange' : 'bg-white border-l-4 border-wayruru-orange'} rounded-xl shadow-lg p-4 sm:p-6`}>
                <div className="flex items-center gap-3">
                  <Image className={`h-6 w-6 sm:h-8 sm:w-8 text-wayruru-orange flex-shrink-0`} />
                  <div className="min-w-0">
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Catálogos</p>
                    <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} break-words`}>
                      {formatNumber(stats.totalCatalogos)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabla responsive con scroll horizontal */}
            <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-4 sm:p-6 border overflow-x-auto`}>
              <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Productos por Repositorio
              </h3>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="min-w-[500px] sm:min-w-full">
                  <thead className={isDark ? 'bg-black/20' : 'bg-gray-100'}>
                    <tr>
                      <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Repositorio
                      </th>
                      <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Sigla
                      </th>
                      <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Productos
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-200'}`}>
                    {stats.repositorios?.slice(0, 8).map((repo) => (
                      <tr key={repo.id_repositorio} className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                        <td className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap font-medium ${isDark ? 'text-white' : 'text-gray-800'} text-sm`}>
                          {repo.nombre}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-wayruru-teal/20 text-wayruru-teal rounded-full text-xs font-medium">
                            {repo.sigla || repo.nombre.substring(0, 4)}
                          </span>
                        </td>
                        <td className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-800'} text-sm`}>
                          {Math.floor(Math.random() * 20) + 5}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {selectedView === 'geografico' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Top Países */}
              <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-4 sm:p-6 border`}>
                <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  <Globe className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 text-wayruru-teal flex-shrink-0`} />
                  <span className="break-words">Visitas por País</span>
                </h3>
                <div className="space-y-3">
                  {stats.visitasPorPais?.map((item, index) => (
                    <div key={item.pais} className="flex items-center gap-2">
                      <span className={`w-6 sm:w-8 font-medium text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1 gap-2 flex-wrap">
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'} text-sm truncate`}>
                            {item.pais}
                          </span>
                          <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`}>
                            {item.visitas} visitas
                          </span>
                        </div>
                        <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1.5 sm:h-2`}>
                          <div 
                            className="bg-wayruru-teal h-1.5 sm:h-2 rounded-full transition-all duration-500"
                            style={{ width: `${item.porcentaje}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Top Ciudades */}
              <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-4 sm:p-6 border`}>
                <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  <MapPin className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 text-wayruru-teal flex-shrink-0`} />
                  <span className="break-words">Visitas por Ciudad</span>
                </h3>
                <div className="space-y-3">
                  {stats.visitasPorCiudad?.map((item, index) => {
                    const maxVisitas = stats.visitasPorCiudad[0]?.visitas || 1;
                    return (
                      <div key={item.ciudad} className="flex items-center gap-2">
                        <span className={`w-6 sm:w-8 font-medium text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-1 gap-2 flex-wrap">
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'} text-sm truncate`}>
                              {item.ciudad}
                            </span>
                            <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`}>
                              {item.visitas} visitas
                            </span>
                          </div>
                          <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1.5 sm:h-2`}>
                            <div 
                              className="bg-wayruru-red h-1.5 sm:h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(item.visitas / maxVisitas) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Estadísticas adicionales - Grid responsive */}
            <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-4 sm:p-6 border`}>
              <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <TrendingUp className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 text-wayruru-teal flex-shrink-0`} />
                <span className="break-words">Resumen de Actividad</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className={`p-3 sm:p-4 text-center rounded-lg ${isDark ? 'bg-black/20' : 'bg-gray-100'}`}>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Productos</p>
                  <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} break-words`}>
                    {formatNumber(stats.totalProductos)}
                  </p>
                </div>
                <div className={`p-3 sm:p-4 text-center rounded-lg ${isDark ? 'bg-black/20' : 'bg-gray-100'}`}>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Eventos Activos</p>
                  <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} break-words`}>
                    {formatNumber(stats.totalEventos)}
                  </p>
                </div>
                <div className={`p-3 sm:p-4 text-center rounded-lg ${isDark ? 'bg-black/20' : 'bg-gray-100'}`}>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Repositorios</p>
                  <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} break-words`}>
                    {formatNumber(stats.totalRepositorios)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vista de Eventos Culturales */}
        {selectedView === 'eventos' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4 sm:space-y-6"
          >
            <EventosCalendar isDark={isDark} />
          </motion.div>
        )}

      </div>

      {/* Modal del Reporte DAM */}
      {showDamReport && damJsonData && (
        <DamReport damData={damJsonData} onClose={() => setShowDamReport(false)} />
      )}
      {showCrtReport && crtData && (
        <CRT crtData={crtData} onClose={() => setShowCrtReport(false)} />
      )}
      {/* Modal del Reporte MIC */}
      {showMicReport && micData && (
        <MIC micData={micData} onClose={() => setShowMicReport(false)} />
      )}
      {/* Modal del Reporte BL (Bill of Lading) */}
      {showBlReport && blData && (
        <BL blData={blData} onClose={() => setShowBlReport(false)} />
      )}
    </div>
  );
};

export default DashboardHome;