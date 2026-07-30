import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

// ─── TEXTOS QUE CAMBIAN ──────────────────────────────────────────────────
const slides = [
  {
    id: 1,
    title: 'Arte y Cultura Boliviana',
    subtitle: 'Descubre la riqueza cultural de Bolivia a través de nuestras colecciones',
    cta: 'Explorar colecciones',
    link: '/tienda'
  },
  {
    id: 2,
    title: 'Eventos Culturales',
    subtitle: 'Vive experiencias únicas en los espacios culturales de la FCBCB',
    cta: 'Ver eventos',
    link: '/eventos'
  },
  {
    id: 3,
    title: 'Patrimonio Nacional',
    subtitle: 'Conoce y preserva el legado histórico y cultural de Bolivia',
    cta: 'Descubrir más',
    link: '/material'
  }
];

const HomeHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);

  // ─── AUTO PLAY PARA EL TEXTO ──────────────────────────────────────────
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // ─── REPRODUCIR VIDEO AL CARGAR ──────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = () => {
      video.play()
        .then(() => {
          setVideoLoaded(true);
          console.log('Video reproduciéndose correctamente');
        })
        .catch(err => {
          console.log('Error al reproducir video:', err);
          video.muted = true;
          video.play().catch(e => console.log('Falló incluso con muted:', e));
        });
    };

    if (video.readyState >= 2) {
      playVideo();
    } else {
      video.addEventListener('loadeddata', playVideo);
    }

    return () => {
      video.removeEventListener('loadeddata', playVideo);
    };
  }, []);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden bg-gray-900">
      {/* ─── VIDEO DE FONDO MEJORADO ──────────────────────────────────── */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          className="absolute inset-0"
          poster="https://images.unsplash.com/photo-1536924940843-227359de5b5d?w=1600&q=80"
          muted
          playsInline
          loop
          autoPlay
          preload="auto"
          onError={(e) => {
            console.log('Error en video:', e);
            setVideoLoaded(false);
          }}
          onLoadedData={() => {
            console.log('Video cargado correctamente');
            setVideoLoaded(true);
          }}
          style={{
            // 🔥 object-fit en lugar de estirar
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            
            // 🔥 Escala mínima para evitar pixelación
            scale: '1',
            
            // 🔥 Mejor renderizado
            imageRendering: 'auto',
            
            // 🔥 Calidad en pantallas retina
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            
            // 🔥 Evitar blur por transformaciones CSS
            WebkitTransform: 'translateZ(0)',
            // ⚠️ SOLO UNA VEZ LA PROPIEDAD transform
            transform: 'translateZ(0)',
          }}
        >
          <source src="/VIDEO2.mp4" type="video/mp4" />
          
          <img 
            src="https://images.unsplash.com/photo-1536924940843-227359de5b5d?w=1600&q=80" 
            alt="Fondo" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </video>

        {/* ─── OVERLAY MEJORADO ────────────────────────────────────────── */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/50" />
        
        {/* Efecto de viñeta para mejorar la nitidez del video */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40" />
        
        {/* Overlay de textura sutil */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cGF0aCBkPSJNMzAgMCA2MCAzMCAzMCA2MCAwIDMwIDAgMzB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-20" />
      </div>

      {/* ─── CONTENIDO ────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium mb-6 border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span>Fundación Cultural BCB</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-tight tracking-tight">
              {slides[currentSlide].title}
            </h1>
            
            <p className="mt-4 text-lg text-white/80 font-light max-w-lg leading-relaxed">
              {slides[currentSlide].subtitle}
            </p>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                to={slides[currentSlide].link}
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full font-medium transition-all duration-300 border border-white/20 hover:border-white/40"
              >
                {slides[currentSlide].cta}
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── INDICADORES ────────────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-500 rounded-full ${
              index === currentSlide 
                ? 'w-12 h-1 bg-white' 
                : 'w-6 h-1 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* ─── FLECHAS ─────────────────────────────────────────────────────── */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 transition-all duration-300 text-white/60 hover:text-white"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 transition-all duration-300 text-white/60 hover:text-white"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>

      {/* ─── SCROLL INDICATOR ───────────────────────────────────────────── */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 -translate-y-12 text-white/30"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-[0.2em] font-light">Scroll</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </motion.div>
    </section>
  );
};

export default HomeHero;