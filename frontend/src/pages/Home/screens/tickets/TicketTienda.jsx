import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TicketIcon,
  MapPinIcon,
  ClockIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ShoppingBagIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  ChevronRightIcon,
  ArrowsUpDownIcon,
  AdjustmentsHorizontalIcon,
  ShieldCheckIcon,
  StarIcon,
  SparklesIcon,
  EyeIcon,
  PhoneIcon,
  UsersIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  ShareIcon,
  FireIcon,
  PlusIcon,
  ArrowPathIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { API_URL, getImageUrl } from '../../../../components/config/api';
import HomeNavbar from '../../../../components/layout/HomeNavbar';
import HomeFooter from '../../HomeFooter';
import { CardContainer, CardBody, CardItem } from '../../../../components/ui/3d-card';
import { MarqueeDemo } from '../../MarqueeDemo';
import { useTheme } from '../../../../components/context/ThemeContext';
// ✅ IMPORTAR EL COMPONENTE DE DETALLE COMPLETO
import TicketDetalleScreen from './TicketDetalle';
import MiniCart from '../../../../components/common/MiniCart';

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

// ─── Imágenes del hero ────────────────────────────────────────────────────
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

// ─── Hero con carrusel ───────────────────────────────────────────────────
const HeroAguayo = ({ totalItems }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentImage((p) => (p + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
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

      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `repeating-linear-gradient(45deg, ${P.beige}, ${P.beige} 2px, transparent 2px, transparent 8px)` }} />

      <div className="relative z-20">
        <HomeNavbar transparent={!scrolled} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 bg-white/10 backdrop-blur-sm border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-white/90">Cultura y patrimonio boliviano</span>
          </div>

          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl leading-[1.05] text-white">
            Tickets para
            <br />
            <span className="text-amber-400 font-bold italic">Museos BCB</span>
          </h1>

          <p className="text-sm md:text-base mt-4 max-w-2xl mx-auto text-white/80 font-light leading-relaxed">
            Explora la riqueza cultural de Bolivia. Adquiere tus tickets para visitar los museos de la Fundación Cultural BCB.
          </p>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-white/70">
            <SparklesIcon className="w-4 h-4 text-amber-400" />
            <span>{totalItems} museos disponibles hoy</span>
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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6">
            <button
              onClick={() => document.getElementById('museos')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 text-gray-900 font-semibold text-sm hover:bg-amber-300 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <TicketIcon className="w-4 h-4" />
              Ver museos
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
    { icon: ShieldCheckIcon, text: 'Entrada garantizada', color: P.turquesa },
    { icon: ClockIcon, text: 'Horario 08:30 - 16:30', color: P.bosque },
    { icon: UsersIcon, text: 'Capacidad limitada', color: P.malva },
    { icon: StarIcon, text: 'Experiencia cultural', color: P.oro },
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
          <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: `${benefit.color}20` }}>
            <benefit.icon className="w-5 h-5" style={{ color: benefit.color }} />
          </div>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{benefit.text}</p>
        </motion.div>
      ))}
    </div>
  );
};

// ─── Horario del museo ────────────────────────────────────────────────────
const HorarioInfo = () => (
  <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
    <div className="flex items-center justify-center gap-6 flex-wrap text-sm">
      <div className="flex items-center gap-2">
        <ClockIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <span className="text-gray-700 dark:text-gray-300">
          <strong>Horario:</strong> 08:30 - 16:30 hrs
        </span>
      </div>
      <div className="flex items-center gap-2">
        <CalendarIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <span className="text-gray-700 dark:text-gray-300">
          <strong>Días:</strong> Lunes a Sábado
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
        <span className="text-red-500 font-medium">
          <strong>Domingos:</strong> Cerrado
        </span>
      </div>
    </div>
  </div>
);

// ─── Card 3D del Museo ────────────────────────────────────────────────────
const MuseoCard3D = ({ museo, ticket, onOpen, onBuy }) => {
  const [isLiked, setIsLiked] = useState(false);
  const imageUrl = getImageUrl(museo.portada_representativa);
  const logoUrl = getImageUrl(museo.logo_repositorio);
  
  const tieneTicket = ticket !== null && ticket !== undefined;
  const disponible = tieneTicket ? ticket.venta_habilitada === true : false;
  const precio = tieneTicket ? parseFloat(ticket.precio || 0).toFixed(2) : '0.00';
  const descuento = tieneTicket ? parseFloat(ticket.descuento || 0) : 0;
  const precioConDescuento = tieneTicket ? parseFloat(ticket.precio_con_descuento || ticket.precio || 0).toFixed(2) : '0.00';
  const disponibilidadHoy = ticket?.disponibilidad_hoy || 'no_disponible';

  const stockBadge = !tieneTicket 
    ? { text: 'Sin ticket', bg: '#6B7280' }
    : disponibilidadHoy === 'cerrado_domingo'
      ? { text: 'Cerrado (Dom)', bg: '#DC2626' }
      : disponible 
        ? { text: 'Disponible', bg: P.bosque }
        : { text: 'No disponible', bg: '#DC2626' };

  const getEstadoTexto = () => {
    if (!tieneTicket) return 'No disponible';
    if (disponibilidadHoy === 'cerrado_domingo') return '🔴 Cerrado (Domingo)';
    if (disponible) return '🟢 Abierto';
    return '🔴 Cerrado';
  };

  const getEstadoColor = () => {
    if (!tieneTicket) return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    if (disponibilidadHoy === 'cerrado_domingo') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (disponible) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <CardContainer className="inter-var h-full">
      <CardBody
        className="bg-white dark:bg-gray-900 relative group/card dark:hover:shadow-2xl w-full h-full rounded-xl p-4 border shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col"
        style={{ borderColor: `${P.turquesa}30` }}
      >
        <div className="h-[4px] w-[calc(100%+2rem)] -mx-4 -mt-4 mb-3" style={{ background: `linear-gradient(90deg, ${AGUAYO_STRIPES.join(', ')})` }} />

        <CardItem translateZ="50" className="text-base font-display font-semibold text-gray-800 dark:text-white line-clamp-2 min-h-[3rem] flex items-center gap-2">
          {logoUrl && (
            <img src={logoUrl} alt={museo.sigla} className="w-6 h-6 object-contain rounded" />
          )}
          {museo.nombre}
        </CardItem>

        {museo.sigla && (
          <CardItem as="p" translateZ="60" className="text-xs text-gray-500 dark:text-neutral-400 mt-1 flex items-center gap-1">
            <BuildingLibraryIcon className="w-3 h-3" /> {museo.sigla}
          </CardItem>
        )}

        <CardItem translateZ="100" rotateX={20} rotateZ={-10} className="w-full mt-4 flex-1">
          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 group-hover/card:shadow-xl">
            <img
              src={imageUrl || 'https://placehold.co/500x500/1a2f3a/19ADA0?text=Museo+BCB'}
              alt={museo.nombre}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://placehold.co/500x500/1a2f3a/19ADA0?text=Museo+BCB'; }}
            />

            <div className="absolute top-2 left-2 z-10">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-lg" style={{ background: stockBadge.bg }}>
                {stockBadge.text}
              </span>
            </div>

            {tieneTicket && (
              <div className="absolute top-2 right-2 z-10">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm border ${getEstadoColor()}`}>
                  {getEstadoTexto()}
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-10">
              <button onClick={(e) => { e.stopPropagation(); onOpen(museo, ticket); }} className="p-2.5 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg hover:scale-110 transition-transform">
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
              {descuento > 0 ? (
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs line-through text-white/60 bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                    Bs. {precio}
                  </span>
                  <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
                    Bs. {precioConDescuento}
                  </span>
                  <span className="text-[10px] font-bold text-red-400 bg-black/40 px-1.5 py-0.5 rounded-lg backdrop-blur-sm">
                    -{descuento}% OFF
                  </span>
                </div>
              ) : (
                <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
                  Bs. {precio}
                </span>
              )}
            </div>

            {museo.departamento && (
              <div className="absolute bottom-2 left-2 z-10">
                <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-black/60 text-white shadow-lg">
                  {museo.departamento}
                </span>
              </div>
            )}
          </div>
        </CardItem>

        <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 dark:border-gray-800">
          <CardItem translateZ={20} translateX={-10} as="div" className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
            <MapPinIcon className="w-4 h-4" />
            <span className="truncate max-w-[100px]">{museo.direccion || 'Sin dirección'}</span>
          </CardItem>
<CardItem
  translateZ={20}
  translateX={10}
  as="button"
  onClick={(e) => { 
    e.stopPropagation(); 
    // ✅ CAMBIAR: Siempre abrir detalle con onOpen
    onOpen(museo, ticket);
  }}
  className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all ${tieneTicket && disponible && disponibilidadHoy !== 'cerrado_domingo' ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'}`}
  style={{ 
    background: tieneTicket && disponible && disponibilidadHoy !== 'cerrado_domingo'
      ? `linear-gradient(135deg, ${P.turquesa}, ${P.bosque})` 
      : '#6B7280' 
  }}
  disabled={!tieneTicket || !disponible || disponibilidadHoy === 'cerrado_domingo'}
>
  {tieneTicket && disponible && disponibilidadHoy !== 'cerrado_domingo' ? 'Ver Detalles' : 'No disponible'}
</CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
};

// ─── Skeleton de carga ────────────────────────────────────────────────────
const MuseoCardSkeleton = () => (
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

// ─── Sidebar de filtros ──────────────────────────────────────────────────
const FiltersSidebar = ({ filters, onFilterChange, departamentos, isOpen, onClose }) => {
  const [expanded, setExpanded] = useState({ departamento: true, disponibilidad: true });
  const toggle = (s) => setExpanded((p) => ({ ...p, [s]: !p[s] }));

  const Section = ({ title, section, children, icon: Icon }) => (
    <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button onClick={() => toggle(section)} className="flex items-center justify-between w-full text-left group">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" style={{ color: P.turquesa }} />}
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {title}
          </span>
        </div>
        <div className="p-1 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
          {expanded[section] ? <ChevronUpIcon className="w-4 h-4 text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded[section] && (
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

  const content = (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border shadow-sm p-6" style={{ borderColor: `${P.turquesa}22` }}>
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
          <p className="text-xs text-gray-400 dark:text-gray-500">Encuentra tu museo</p>
        </div>
      </div>

      <div className="relative mb-5">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar museo..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 text-gray-800 dark:text-white placeholder-gray-400 outline-none transition-all"
          style={{ '--tw-ring-color': P.turquesa }}
        />
      </div>

      <Section title="Departamento" section="departamento" icon={MapPinIcon}>
        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors">
          <input type="radio" name="departamento" checked={filters.departamento === 'todos'} onChange={() => onFilterChange('departamento', 'todos')} />
          <span className="text-sm text-gray-600 dark:text-gray-400">Todos</span>
        </label>
        {departamentos.map((dep) => (
          <label key={dep} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors">
            <input type="radio" name="departamento" checked={filters.departamento === dep} onChange={() => onFilterChange('departamento', dep)} />
            <span className="text-sm text-gray-600 dark:text-gray-400">{dep}</span>
          </label>
        ))}
      </Section>

      <Section title="Disponibilidad" section="disponibilidad" icon={TicketIcon}>
        {[
          ['todos', 'Todos'],
          ['disponible', 'Disponibles'],
          ['no_disponible', 'No disponibles'],
          ['sin_ticket', 'Sin ticket'],
        ].map(([val, label]) => (
          <label key={val} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors">
            <input type="radio" name="disponibilidad" checked={filters.disponibilidad === val} onChange={() => onFilterChange('disponibilidad', val)} />
            <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
          </label>
        ))}
      </Section>

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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
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
    <span className="font-medium" style={{ color: P.turquesa }}>Tickets</span>
  </div>
);

// ─── Chips de filtros activos ────────────────────────────────────────────
const ActiveFilterChips = ({ filters, onFilterChange }) => {
  const chips = [];
  if (filters.search) chips.push({ key: 'search', label: `"${filters.search}"`, clear: () => onFilterChange('search', '') });
  if (filters.departamento !== 'todos') chips.push({ key: 'departamento', label: filters.departamento, clear: () => onFilterChange('departamento', 'todos') });
  if (filters.disponibilidad !== 'todos') {
    const labels = { disponible: 'Disponibles', no_disponible: 'No disponibles', sin_ticket: 'Sin ticket' };
    chips.push({ key: 'disp', label: labels[filters.disponibilidad] || 'Todos', clear: () => onFilterChange('disponibilidad', 'todos') });
  }

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

// ─── Componente principal ──────────────────────────────────────────────────
// ─── Componente principal ──────────────────────────────────────────────────
const TicketsTienda = () => {
  const [museos, setMuseos] = useState([]);
  const [ticketsMap, setTicketsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    departamento: 'todos',
    disponibilidad: 'todos',
  });
  const [sortBy, setSortBy] = useState('relevancia');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedMuseo, setSelectedMuseo] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Obtener datos con el nuevo endpoint
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/api/tickets/museos`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (response.ok) {
          const tickets = data.tickets || [];
          
          const museosMap = {};
          const ticketsMapLocal = {};
          
          tickets.forEach(ticket => {
            ticketsMapLocal[ticket.id_repositorio] = ticket;
            
            if (!museosMap[ticket.id_repositorio]) {
              museosMap[ticket.id_repositorio] = {
                id_repositorio: ticket.id_repositorio,
                nombre: ticket.nombre_repositorio,
                sigla: ticket.sigla,
                direccion: ticket.direccion,
                telefono: ticket.telefono,
                departamento: ticket.departamento,
                ubicacion_gps: ticket.ubicacion_gps,
                portada_representativa: ticket.portada_representativa,
                logo_repositorio: ticket.logo_repositorio,
                activo: ticket.repositorio_activo,
              };
            }
          });
          
          setMuseos(Object.values(museosMap));
          setTicketsMap(ticketsMapLocal);
        } else {
          console.error('Error al cargar tickets:', data.message);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const departamentos = useMemo(() => 
    Array.from(new Set(museos.map((m) => m.departamento).filter(Boolean))), 
    [museos]
  );

  const filteredMuseos = useMemo(() => {
    let result = museos.filter((m) => {
      if (filters.search && !m.nombre?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.departamento !== 'todos' && m.departamento !== filters.departamento) return false;
      
      const ticket = ticketsMap[m.id_repositorio];
      const tieneTicket = ticket !== null && ticket !== undefined;
      const disponible = tieneTicket ? ticket.venta_habilitada === true : false;
      const disponibilidadHoy = ticket?.disponibilidad_hoy || 'no_disponible';
      
      if (filters.disponibilidad === 'disponible' && (!tieneTicket || !disponible || disponibilidadHoy === 'cerrado_domingo')) return false;
      if (filters.disponibilidad === 'no_disponible' && (tieneTicket && disponible && disponibilidadHoy !== 'cerrado_domingo')) return false;
      if (filters.disponibilidad === 'sin_ticket' && tieneTicket) return false;
      
      return true;
    });

    switch (sortBy) {
      case 'precio_asc':
        result = [...result].sort((a, b) => {
          const ta = ticketsMap[a.id_repositorio];
          const tb = ticketsMap[b.id_repositorio];
          return (ta?.precio || 0) - (tb?.precio || 0);
        });
        break;
      case 'precio_desc':
        result = [...result].sort((a, b) => {
          const ta = ticketsMap[a.id_repositorio];
          const tb = ticketsMap[b.id_repositorio];
          return (tb?.precio || 0) - (ta?.precio || 0);
        });
        break;
      case 'nombre_asc':
        result = [...result].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
        break;
      default:
        break;
    }
    return result;
  }, [museos, ticketsMap, filters, sortBy]);

  const handleFilterChange = (key, value) => {
    if (key === 'reset') {
      setFilters({ search: '', departamento: 'todos', disponibilidad: 'todos' });
      return;
    }
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // ✅ FUNCIÓN ACTUALIZADA: Abrir detalle completo
  const handleOpenDetail = (museo, ticket) => {
    console.log('🔍 Abriendo detalle:', museo?.nombre);
    setSelectedMuseo(museo);
    setSelectedTicket(ticket || ticketsMap[museo.id_repositorio] || null);
  };

  // ✅ FUNCIÓN PARA AGREGAR AL CARRITO
  const handleAddToCart = (item) => {
    console.log('Agregando al carrito:', item);
    const precioFinal = item.precioFinal || item.ticket.precio_con_descuento || item.ticket.precio;
    alert(`✅ ${item.quantity} ticket(s) agregado(s) al carrito\nTotal: Bs. ${item.total}`);
    // Cerrar el detalle
    setSelectedMuseo(null);
    setSelectedTicket(null);
  };

  // ✅ FUNCIÓN DE COMPRA (para el botón rápido)
  const handleBuy = (ticket) => {
    const museo = museos.find(m => m.id_repositorio === ticket.id_repositorio);
    if (museo) {
      handleOpenDetail(museo, ticket);
    }
  };

  // ✅ SI HAY UN TICKET SELECCIONADO, RENDERIZAR EL DETALLE
  if (selectedMuseo && selectedTicket) {
    return (
      <TicketDetalleScreen
        ticket={selectedTicket}
        repositorio={selectedMuseo}
        onBack={() => {
          console.log('🔙 Cerrando detalle');
          setSelectedMuseo(null);
          setSelectedTicket(null);
        }}
        onAddToCart={handleAddToCart}
      />
    );
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
                {[1, 2, 3, 4, 5, 6].map((i) => <MuseoCardSkeleton key={i} />)}
              </div>
            </div>
          </div>
        </div>
        <MarqueeDemo />
        <HomeFooter />
      </>
    );
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== '' && v !== 'todos');
  const totalDisponibles = museos.filter(m => {
    const t = ticketsMap[m.id_repositorio];
    return t && t.venta_habilitada && t.disponibilidad_hoy !== 'cerrado_domingo';
  }).length;

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <HeroAguayo totalItems={totalDisponibles} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-10">
          <Breadcrumb />
          <BenefitsBanner />
          <HorarioInfo />

          <div id="museos">
            <div className="flex flex-col lg:flex-row gap-8">
              <FiltersSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                departamentos={departamentos}
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
                      <AdjustmentsHorizontalIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">Filtros</span>
                      {hasActiveFilters && <span className="w-2 h-2 rounded-full" style={{ background: P.turquesa }} />}
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredMuseos.length}</span> museos
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

                <ActiveFilterChips filters={filters} onFilterChange={handleFilterChange} />

                {filteredMuseos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-gray-900 rounded-2xl border" style={{ borderColor: `${P.turquesa}22` }}>
                    <BuildingLibraryIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-medium font-display text-gray-700 dark:text-gray-300">No se encontraron museos</h3>
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
                      {filteredMuseos.map((museo) => {
                        const ticket = ticketsMap[museo.id_repositorio] || null;
                        return (
                          <MuseoCard3D 
                            key={museo.id_repositorio}
                            museo={museo}
                            ticket={ticket}
                            onOpen={handleOpenDetail}
                            onBuy={handleBuy}
                          />
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <MarqueeDemo />
      <HomeFooter />
      <MiniCart/>
    </>
  );
};

export default TicketsTienda;