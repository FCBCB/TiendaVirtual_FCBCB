import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TagIcon,
  CubeIcon,
  FireIcon,
  SparklesIcon,
  HeartIcon,
  EyeIcon,
  ShareIcon,
  CurrencyDollarIcon,
  ChevronRightIcon,
  ArrowsUpDownIcon,
  AdjustmentsHorizontalIcon,
  GiftIcon,
  TruckIcon,
  ShieldCheckIcon,
  StarIcon,
  ClockIcon,
  PlusIcon,
  ArrowPathIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { API_URL, getImageUrl } from '../../../components/config/api';
import HomeNavbar from '../../../components/layout/HomeNavbar';
import HomeFooter from '../HomeFooter';
import SouvenirDetalleScreen from './SouvenirDetalleScreen';
import { CardContainer, CardBody, CardItem } from '../../../components/ui/3d-card';
import { MarqueeDemo } from '../MarqueeDemo';
import MiniCart from '../../../components/common/MiniCart';

// ─── Paleta institucional ────────────────────────────────────────────────
const P = {
  pizarra: '#3D4560',
  bosque: '#3A5240',
  turquesa: '#4A9A8E',
  beige: '#D4C5A0',
  marron: '#2A1F14',
  malva: '#9E6B85',
  oro: '#C9A84C',
  crema: '#F5F0E8',
};

const AGUAYO_STRIPES = [P.turquesa, P.malva, P.beige, P.bosque, P.turquesa];

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1600&q=80',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1600&q=80',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80',
];

const SORT_OPTIONS = [
  { value: 'relevancia', label: 'Más relevantes' },
  { value: 'precio_asc', label: 'Precio: menor a mayor' },
  { value: 'precio_desc', label: 'Precio: mayor a menor' },
  { value: 'nombre_asc', label: 'Nombre: A-Z' },
];

// ─── Hero con carrusel (con navbar integrado) ──────────────────────────
const HeroAguayo = ({ totalItems }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentImage((p) => (p + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden min-h-[350px] md:min-h-[450px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImage}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGES[currentImage]})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </motion.div>
      </AnimatePresence>

      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: `repeating-linear-gradient(45deg, ${P.beige}, ${P.beige} 2px, transparent 2px, transparent 8px)` }}
      />

      <div className="relative z-20">
        <HomeNavbar transparent={!scrolled} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 bg-white/10 backdrop-blur-sm border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-white/90">Artesanía y cultura boliviana</span>
          </div>

          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl leading-[1.05] text-white">
            Souvenirs con
            <br />
            <span className="text-amber-400 font-bold italic">identidad</span>
          </h1>

          <p className="text-sm md:text-base mt-4 max-w-2xl mx-auto text-white/80 font-light leading-relaxed">
            Piezas artesanales que llevan la memoria cultural de Bolivia — elegidas con cuidado, hechas para durar.
          </p>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-white/70">
            <SparklesIcon className="w-4 h-4 text-amber-400" />
            <span>{totalItems} piezas disponibles ahora</span>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            {HERO_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImage(idx)}
                className={`h-1 rounded-full transition-all duration-300 ${idx === currentImage ? 'w-8 bg-amber-400' : 'w-3 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <button
              onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 text-gray-900 font-semibold text-sm hover:bg-amber-300 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <ShoppingBagIcon className="w-4 h-4" />
              Ver productos
              <ChevronDownIcon className="w-3 h-3 animate-bounce" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// ─── Banner de beneficios ────────────────────────────────────────────────
const BenefitsBanner = () => {
  const benefits = [
    { icon: TruckIcon, text: 'Envíos a todo Bolivia', color: P.turquesa },
    { icon: ShieldCheckIcon, text: '100% Artesanal', color: P.bosque },
    { icon: GiftIcon, text: 'Regalos únicos', color: P.malva },
    { icon: StarIcon, text: 'Calidad garantizada', color: P.oro },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {benefits.map((benefit, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-xl border p-4 text-center hover:shadow-md transition-shadow"
          style={{ borderColor: `${P.turquesa}22` }}
        >
          <div
            className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
            style={{ background: `${benefit.color}20` }}
          >
            <benefit.icon className="w-5 h-5" style={{ color: benefit.color }} />
          </div>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{benefit.text}</p>
        </motion.div>
      ))}
    </div>
  );
};

// ─── Categorías destacadas ──────────────────────────────────────────────
const CategoryShowcase = ({ categories, onSelectCategory }) => {
  const categoryColors = [P.turquesa, P.malva, P.bosque, P.oro, P.pizarra, P.beige];
  const categoryIcons = [TagIcon, GiftIcon, CubeIcon, StarIcon, FireIcon, SparklesIcon];

  if (categories.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <TagIcon className="w-5 h-5" style={{ color: P.turquesa }} />
          Categorías destacadas
        </h2>
        <button
          onClick={() => onSelectCategory('todos')}
          className="text-xs font-medium hover:underline"
          style={{ color: P.turquesa }}
        >
          Ver todas
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.slice(0, 6).map((cat, idx) => {
          const color = categoryColors[idx % categoryColors.length];
          const Icon = categoryIcons[idx % categoryIcons.length];
          return (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectCategory(cat)}
              className="group relative overflow-hidden rounded-xl p-4 text-center bg-white dark:bg-gray-900 border transition-all hover:shadow-lg"
              style={{ borderColor: `${color}30` }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                style={{ background: `linear-gradient(135deg, ${color}, transparent)` }}
              />
              <div
                className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: `${color}20` }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-1 capitalize">
                {cat}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Productos destacados (mini slider) ──────────────────────────────────
const FeaturedProducts = ({ souvenirs, onOpen }) => {
  const featured = souvenirs.slice(0, 4);

  if (featured.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FireIcon className="w-5 h-5" style={{ color: P.oro }} />
          Destacados de la semana
        </h2>
        <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${P.oro}20`, color: P.oro }}>
          Más vendidos
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {featured.map((souvenir, index) => (
          <motion.div
            key={souvenir.id_producto || souvenir.id || index}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-gray-900 rounded-xl border overflow-hidden cursor-pointer group"
            style={{ borderColor: `${P.turquesa}22` }}
            onClick={() => onOpen(souvenir)}
          >
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
              <img
                src={getImageUrl(souvenir.imagen_principal) || 'https://placehold.co/500x500/1a2f3a/19ADA0?text=Sin+Imagen'}
                alt={souvenir.nombre}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.target.src = 'https://placehold.co/500x500/1a2f3a/19ADA0?text=Sin+Imagen'; }}
              />
              <div className="absolute top-2 right-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-gray-900 shadow-lg">
                  Destacado
                </span>
              </div>
              {souvenir.stock_total < 5 && souvenir.stock_total > 0 && (
                <div className="absolute bottom-2 left-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white shadow-lg">
                    Últimas unidades
                  </span>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-800 dark:text-white line-clamp-1">{souvenir.nombre}</p>
              <p className="text-sm font-bold mt-1" style={{ color: P.turquesa }}>Bs. {souvenir.precio}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ─── Card 3D ─────────────────────────────────────────────────────────────
const SouvenirCard3D = ({ souvenir, onOpen }) => {
  const [isLiked, setIsLiked] = useState(false);
  const imageUrl = getImageUrl(souvenir.imagen_principal);
  const stock = souvenir.stock_total || 0;

  const stockBadge =
    stock === 0 ? { text: 'Agotado', bg: '#DC2626' } : stock < 10 ? { text: `Últimas ${stock}`, bg: P.malva } : { text: 'En stock', bg: P.bosque };

  return (
    <CardContainer className="inter-var h-full">
      <CardBody
        className="bg-white dark:bg-gray-900 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] border-black/[0.1] dark:border-white/[0.2] w-full h-full rounded-xl p-4 border shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col"
        style={{ borderColor: `${P.turquesa}30` }}
      >
        <div className="h-[4px] w-[calc(100%+2rem)] -mx-4 -mt-4 mb-3" style={{ background: `linear-gradient(90deg, ${AGUAYO_STRIPES.join(', ')})` }} />

        <CardItem translateZ="50" className="text-base font-display font-semibold text-gray-800 dark:text-white line-clamp-2 min-h-[3rem]">
          {souvenir.nombre}
        </CardItem>

        {souvenir.material && (
          <CardItem as="p" translateZ="60" className="text-xs text-gray-500 dark:text-neutral-400 mt-1 flex items-center gap-1">
            <CubeIcon className="w-3 h-3" /> {souvenir.material}
          </CardItem>
        )}

        <CardItem translateZ="100" rotateX={20} rotateZ={-10} className="w-full mt-4 flex-1">
          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 group-hover/card:shadow-xl">
            <img
              src={imageUrl || 'https://placehold.co/500x500/1a2f3a/19ADA0?text=Sin+Imagen'}
              alt={souvenir.nombre}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://placehold.co/500x500/1a2f3a/19ADA0?text=Sin+Imagen'; }}
            />

            <div className="absolute top-2 left-2 z-10">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-lg" style={{ background: stockBadge.bg }}>
                {stockBadge.text}
              </span>
            </div>

            {souvenir.tipo_souvenir && (
              <div className="absolute top-2 right-2 z-10">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 shadow-lg">
                  {souvenir.tipo_souvenir}
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-10">
              <button onClick={(e) => { e.stopPropagation(); onOpen(souvenir); }} className="p-2.5 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg hover:scale-110 transition-transform">
                <EyeIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
                className={`p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform ${isLiked ? 'bg-red-500 text-white' : 'bg-white/90 hover:bg-white text-gray-800'}`}
              >
                {isLiked ? <HeartSolidIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
              </button>
              <button onClick={(e) => e.stopPropagation()} className="p-2.5 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg hover:scale-110 transition-transform">
                <ShareIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute bottom-2 right-2 z-10">
              <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
                Bs. {souvenir.precio}
              </span>
            </div>

            {Math.random() > 0.7 && (
              <div className="absolute top-12 left-2 z-10">
                <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-green-500 text-white shadow-lg animate-pulse">
                  NUEVO
                </span>
              </div>
            )}
          </div>
        </CardItem>

        <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 dark:border-gray-800">
          <CardItem translateZ={20} translateX={-10} as="div" className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
            <ShoppingBagIcon className="w-4 h-4" />
            Stock: {stock} uds.
          </CardItem>
          <CardItem
            translateZ={20}
            translateX={10}
            as="button"
            onClick={(e) => { e.stopPropagation(); onOpen(souvenir); }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${P.turquesa}, ${P.bosque})` }}
          >
            Ver detalles →
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
};

// ─── Skeleton de carga ────────────────────────────────────────────────────
const SouvenirCardSkeleton = () => (
  <div className="rounded-xl border overflow-hidden bg-white dark:bg-gray-900" style={{ borderColor: `${P.turquesa}20` }}>
    <div className="h-[4px] w-full" style={{ background: `linear-gradient(90deg, ${AGUAYO_STRIPES.join(', ')})`, opacity: 0.4 }} />
    <div className="p-4 space-y-3 animate-pulse">
      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="aspect-square w-full bg-gray-200 dark:bg-gray-800 rounded-xl" />
      <div className="flex justify-between pt-2">
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      </div>
    </div>
  </div>
);

// ─── FilterSection (COMPONENTE TOP-LEVEL) ──────────────────────────────
const FilterSection = ({ title, section, children, icon: Icon, expanded, onToggle }) => {
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button onClick={() => onToggle(section)} className="flex items-center justify-between w-full text-left group" type="button">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" style={{ color: P.turquesa }} />}
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {title}
          </span>
        </div>
        <div className="p-1 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
          {expanded ? <ChevronUpIcon className="w-4 h-4 text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-3 space-y-2 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Componente de búsqueda con debounce ────────────────────────────────
const DebouncedSearchInput = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localValue !== value) onChange(localValue);
    }, 300);
    return () => clearTimeout(timeout);
  }, [localValue]);

  return (
    <div className="relative mb-5">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder="Buscar souvenirs..."
        value={localValue || ''}
        onChange={(e) => setLocalValue(e.target.value)}
        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 text-gray-800 dark:text-white placeholder-gray-400 outline-none transition-all"
        style={{ '--tw-ring-color': P.turquesa }}
      />
    </div>
  );
};

// ─── Sidebar de filtros con repositorios ────────────────────────────────
const FiltersSidebar = ({ filters, onFilterChange, categories, materials, repositorios, isOpen, onClose }) => {
  const [expanded, setExpanded] = useState({ 
    categoria: true, 
    material: true, 
    repositorio: true,
    precio: true, 
    disponibilidad: true 
  });
  
  const toggle = useCallback((s) => {
    setExpanded((prev) => ({ ...prev, [s]: !prev[s] }));
  }, []);

  const content = (
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl border shadow-sm p-6"
      style={{ borderColor: `${P.turquesa}22` }}
    >
      <div className="flex items-center justify-between lg:hidden mb-6">
        <h3 className="text-lg font-bold font-display text-gray-800 dark:text-white">Filtros</h3>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="hidden lg:flex items-center gap-2 mb-6">
        <div className="p-2 rounded-xl" style={{ background: `${P.turquesa}15` }}>
          <AdjustmentsHorizontalIcon className="w-4 h-4" style={{ color: P.turquesa }} />
        </div>
        <div>
          <h3 className="text-base font-bold font-display text-gray-800 dark:text-white leading-tight">Filtros</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">Refina tu búsqueda</p>
        </div>
      </div>

      <DebouncedSearchInput 
        value={filters.search} 
        onChange={(val) => onFilterChange('search', val)} 
      />

      <FilterSection 
        title="Repositorio" 
        section="repositorio" 
        icon={BuildingStorefrontIcon}
        expanded={expanded.repositorio}
        onToggle={toggle}
      >
        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors">
          <input 
            type="radio" 
            name="repositorio" 
            checked={filters.repositorio === 'todos'} 
            onChange={() => onFilterChange('repositorio', 'todos')} 
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">Todos</span>
        </label>
        {repositorios.map((repo) => (
          <label key={repo.id_repositorio} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors">
            <input
              type="radio"
              name="repositorio"
              checked={filters.repositorio === repo.id_repositorio}
              onChange={() => onFilterChange('repositorio', repo.id_repositorio)}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              {repo.logo_repositorio && (
                <img 
                  src={getImageUrl(repo.logo_repositorio)} 
                  alt={repo.nombre}
                  className="w-5 h-5 object-contain rounded-full"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              {repo.nombre}
            </span>
          </label>
        ))}
      </FilterSection>

      <FilterSection 
        title="Categoría" 
        section="categoria" 
        icon={TagIcon}
        expanded={expanded.categoria}
        onToggle={toggle}
      >
        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors">
          <input 
            type="radio" 
            name="categoria" 
            checked={filters.categoria === 'todos'} 
            onChange={() => onFilterChange('categoria', 'todos')} 
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">Todos</span>
        </label>
        {categories.map((cat) => (
          <label key={cat} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors">
            <input 
              type="radio" 
              name="categoria" 
              checked={filters.categoria === cat} 
              onChange={() => onFilterChange('categoria', cat)} 
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{cat}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection 
        title="Material" 
        section="material" 
        icon={CubeIcon}
        expanded={expanded.material}
        onToggle={toggle}
      >
        {materials.map((mat) => (
          <label key={mat} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors">
            <input
              type="checkbox"
              checked={filters.materiales.includes(mat)}
              onChange={() => {
                const nm = filters.materiales.includes(mat) 
                  ? filters.materiales.filter((m) => m !== mat) 
                  : [...filters.materiales, mat];
                onFilterChange('materiales', nm);
              }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{mat}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection 
        title="Precio" 
        section="precio" 
        icon={CurrencyDollarIcon}
        expanded={expanded.precio}
        onToggle={toggle}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Min</label>
            <input 
              type="number" 
              value={filters.precioMin} 
              onChange={(e) => onFilterChange('precioMin', e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border-0 text-sm outline-none text-gray-800 dark:text-white" 
              placeholder="0" 
            />
          </div>
          <span className="text-gray-400 mt-4">-</span>
          <div className="flex-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Max</label>
            <input 
              type="number" 
              value={filters.precioMax} 
              onChange={(e) => onFilterChange('precioMax', e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border-0 text-sm outline-none text-gray-800 dark:text-white" 
              placeholder="∞" 
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection 
        title="Disponibilidad" 
        section="disponibilidad" 
        icon={ShoppingBagIcon}
        expanded={expanded.disponibilidad}
        onToggle={toggle}
      >
        {[['todos', 'Todos'], ['disponible', 'En stock'], ['agotado', 'Agotado']].map(([val, label]) => (
          <label key={val} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors">
            <input 
              type="radio" 
              name="disponibilidad" 
              checked={filters.disponibilidad === val} 
              onChange={() => onFilterChange('disponibilidad', val)} 
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
          </label>
        ))}
      </FilterSection>

      <div className="space-y-2 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => onFilterChange('reset', true)}
          className="w-full py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
          style={{ color: P.turquesa, borderColor: P.turquesa }}
        >
          Limpiar filtros
        </button>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all lg:hidden"
          style={{ background: `linear-gradient(135deg, ${P.turquesa}, ${P.bosque})` }}
        >
          Aplicar filtros
        </button>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden" 
            onClick={onClose} 
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -340 }}
        animate={{ x: isOpen ? 0 : -340 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-0 left-0 z-50 w-80 h-full bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto p-6 lg:hidden"
      >
        {content}
      </motion.aside>

      <div className="hidden lg:block lg:w-[280px] lg:flex-shrink-0">
        <div className="sticky top-24">{content}</div>
      </div>
    </>
  );
};

// ─── Breadcrumb ───────────────────────────────────────────────────────────
const Breadcrumb = () => (
  <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-4">
    <span>Inicio</span>
    <ChevronRightIcon className="w-3 h-3" />
    <span>Tienda</span>
    <ChevronRightIcon className="w-3 h-3" />
    <span className="font-medium" style={{ color: P.turquesa }}>Souvenirs</span>
  </div>
);

// ─── Chips de filtros activos ────────────────────────────────────────────
const ActiveFilterChips = ({ filters, onFilterChange, repositorios }) => {
  const chips = [];
  if (filters.search) chips.push({ key: 'search', label: `"${filters.search}"`, clear: () => onFilterChange('search', '') });
  if (filters.categoria !== 'todos') chips.push({ key: 'categoria', label: filters.categoria, clear: () => onFilterChange('categoria', 'todos') });
  if (filters.repositorio !== 'todos') {
    const repo = repositorios.find(r => r.id_repositorio === filters.repositorio);
    chips.push({ key: 'repositorio', label: repo?.nombre || 'Repositorio', clear: () => onFilterChange('repositorio', 'todos') });
  }
  filters.materiales.forEach((mat) =>
    chips.push({ key: `mat-${mat}`, label: mat, clear: () => onFilterChange('materiales', filters.materiales.filter((m) => m !== mat)) })
  );
  if (filters.precioMin) chips.push({ key: 'min', label: `Desde Bs. ${filters.precioMin}`, clear: () => onFilterChange('precioMin', '') });
  if (filters.precioMax) chips.push({ key: 'max', label: `Hasta Bs. ${filters.precioMax}`, clear: () => onFilterChange('precioMax', '') });
  if (filters.disponibilidad !== 'todos')
    chips.push({ key: 'disp', label: filters.disponibilidad === 'disponible' ? 'En stock' : 'Agotado', clear: () => onFilterChange('disponibilidad', 'todos') });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={chip.clear}
          className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-xs font-medium transition-colors"
          style={{ background: `${P.turquesa}15`, color: P.bosque }}
        >
          <span className="capitalize">{chip.label}</span>
          <XMarkIcon className="w-3.5 h-3.5" />
        </button>
      ))}
      <button onClick={() => onFilterChange('reset', true)} className="text-xs font-medium underline" style={{ color: P.malva }}>
        Limpiar todo
      </button>
    </div>
  );
};

// ─── Newsletter ──────────────────────────────────────────────────────────
const Newsletter = () => (
  <div className="mt-8 mb-8 rounded-2xl overflow-hidden relative">
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(135deg, ${P.pizarra}, ${P.bosque})`,
      }}
    />
    <div
      className="absolute inset-0 opacity-10"
      style={{ backgroundImage: `repeating-linear-gradient(45deg, ${P.beige}, ${P.beige} 2px, transparent 2px, transparent 8px)` }}
    />
    <div className="relative p-6 md:p-8 text-center">
      <h3 className="text-xl font-display font-bold text-white mb-2">
        ¿Quieres recibir novedades?
      </h3>
      <p className="text-sm text-white/80 mb-4 max-w-md mx-auto">
        Suscríbete para conocer las nuevas colecciones y promociones exclusivas.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="email"
          placeholder="Tu correo electrónico"
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          className="px-6 py-2.5 rounded-xl bg-amber-400 text-gray-900 font-semibold text-sm hover:bg-amber-300 transition-colors whitespace-nowrap"
        >
          Suscribirme
        </button>
      </div>
    </div>
  </div>
);

// ─── Componente principal ────────────────────────────────────────────────
const SouvenirTienda = () => {
  const [souvenirs, setSouvenirs] = useState([]);
  const [repositorios, setRepositorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '', 
    categoria: 'todos',
    repositorio: 'todos',
    materiales: [], 
    precioMin: '', 
    precioMax: '', 
    disponibilidad: 'todos',
  });
  const [sortBy, setSortBy] = useState('relevancia');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSouvenir, setSelectedSouvenir] = useState(null);

  // ✅ Obtener souvenirs y repositorios
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const souvenirsRes = await fetch(`${API_URL}/api/souvenirs`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        const souvenirsData = await souvenirsRes.json();
        if (souvenirsRes.ok) setSouvenirs(souvenirsData.souvenirs || []);
        
        const reposRes = await fetch(`${API_URL}/api/repositorios`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const reposData = await reposRes.json();
        if (reposRes.ok && reposData.repositorios) {
          setRepositorios(reposData.repositorios);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = useMemo(() => Array.from(new Set(souvenirs.map((s) => s.tipo_souvenir).filter(Boolean))), [souvenirs]);
  const materials = useMemo(() => Array.from(new Set(souvenirs.map((s) => s.material).filter(Boolean))), [souvenirs]);

  const filteredSouvenirs = useMemo(() => {
    let result = souvenirs.filter((s) => {
      if (filters.search && !s.nombre?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.categoria !== 'todos' && s.tipo_souvenir !== filters.categoria) return false;
      if (filters.materiales.length > 0 && !filters.materiales.includes(s.material)) return false;
      if (filters.precioMin && s.precio < parseFloat(filters.precioMin)) return false;
      if (filters.precioMax && s.precio > parseFloat(filters.precioMax)) return false;
      const stock = s.stock_total || 0;
      if (filters.disponibilidad === 'disponible' && stock === 0) return false;
      if (filters.disponibilidad === 'agotado' && stock > 0) return false;
      
      if (filters.repositorio !== 'todos') {
        const tieneStock = s.repositorios_disponibles?.some(r => r.id_repositorio === filters.repositorio && r.stock > 0);
        if (!tieneStock) return false;
      }
      
      return true;
    });

    switch (sortBy) {
      case 'precio_asc':
        result = [...result].sort((a, b) => a.precio - b.precio);
        break;
      case 'precio_desc':
        result = [...result].sort((a, b) => b.precio - a.precio);
        break;
      case 'nombre_asc':
        result = [...result].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
        break;
      default:
        break;
    }
    return result;
  }, [souvenirs, filters, sortBy]);

  const handleFilterChange = useCallback((key, value) => {
    if (key === 'reset') {
      setFilters({ 
        search: '', 
        categoria: 'todos',
        repositorio: 'todos',
        materiales: [], 
        precioMin: '', 
        precioMax: '', 
        disponibilidad: 'todos' 
      });
      return;
    }
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleCategorySelect = useCallback((category) => {
    setFilters((prev) => ({ ...prev, categoria: category }));
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (selectedSouvenir) {
    return <SouvenirDetalleScreen souvenir={selectedSouvenir} onBack={() => setSelectedSouvenir(null)} />;
  }

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
          <div className="relative w-screen left-1/2 -translate-x-1/2 h-[350px] md:h-[450px] bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8 pt-8">
              <div className="hidden lg:block lg:w-[280px] h-96 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse flex-shrink-0" />
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => <SouvenirCardSkeleton key={i} />)}
              </div>
            </div>
          </div>
        </div>
        <MarqueeDemo />
        <HomeFooter />
      </>
    );
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== '' && v !== 'todos' && !(Array.isArray(v) && v.length === 0));

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <HeroAguayo totalItems={filteredSouvenirs.length} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-10">
          <Breadcrumb />

          <BenefitsBanner />

          {categories.length > 0 && (
            <CategoryShowcase categories={categories} onSelectCategory={handleCategorySelect} />
          )}

          <FeaturedProducts souvenirs={souvenirs} onOpen={setSelectedSouvenir} />

          <div id="productos">
            <div className="flex flex-col lg:flex-row gap-8">
              <FiltersSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
                materials={materials}
                repositorios={repositorios}
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 hover:shadow-lg transition-shadow"
                    >
                      <FireIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">Filtros</span>
                      {hasActiveFilters && <span className="w-2 h-2 rounded-full" style={{ background: P.turquesa }} />}
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredSouvenirs.length}</span> resultados
                    </p>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setIsSortOpen(!isSortOpen)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border text-sm text-gray-700 dark:text-gray-300 hover:shadow-md transition-shadow"
                      style={{ borderColor: `${P.turquesa}22` }}
                    >
                      <ArrowsUpDownIcon className="w-4 h-4" style={{ color: P.turquesa }} />
                      <span className="hidden sm:inline">{SORT_OPTIONS.find((o) => o.value === sortBy)?.label}</span>
                      <ChevronDownIcon className="w-3.5 h-3.5" />
                    </button>
                    <AnimatePresence>
                      {isSortOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-800 shadow-lg border z-20 overflow-hidden"
                          style={{ borderColor: `${P.turquesa}22` }}
                        >
                          {SORT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => { setSortBy(opt.value); setIsSortOpen(false); }}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              style={{ color: sortBy === opt.value ? P.turquesa : undefined, fontWeight: sortBy === opt.value ? 600 : 400 }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <ActiveFilterChips 
                  filters={filters} 
                  onFilterChange={handleFilterChange}
                  repositorios={repositorios}
                />

                {filteredSouvenirs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-gray-900 rounded-2xl border" style={{ borderColor: `${P.turquesa}22` }}>
                    <ShoppingBagIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-medium font-display text-gray-700 dark:text-gray-300">No se encontraron souvenirs</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Prueba con otros filtros o realiza una nueva búsqueda</p>
                    <button
                      onClick={() => handleFilterChange('reset', true)}
                      className="mt-4 px-6 py-2 rounded-xl text-white transition-colors"
                      style={{ background: P.turquesa }}
                    >
                      Limpiar filtros
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode="wait">
                      {filteredSouvenirs.map((souvenir) => (
                        <SouvenirCard3D key={souvenir.id_producto || souvenir.id} souvenir={souvenir} onOpen={setSelectedSouvenir} />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Newsletter />
        </div>
      </div>
      <MarqueeDemo />
      <HomeFooter />
      <MiniCart/>
    </>
  );
};

export default SouvenirTienda;