import { useEffect, useRef, useState } from "react";

/**
 * Galeria.jsx
 * ---------------------------------------------------------------
 * Galería de arte cultural, estilo "sala de museo".
 * - Cuadros que se "trazan" (el marco se dibuja como un pincel) al entrar en pantalla.
 * - Ficha de museo (título / técnica / año) que se desliza al hacer hover.
 * - Spotlight que sigue al cursor dentro de cada cuadro.
 * - Grid asimétrico tipo pared de galería, responsive.
 *
 * Requisitos:
 * 1) Coloca galeria1.png ... galeria7.png dentro de /public
 * 2) Añade estas fuentes en tu index.html (dentro de <head>):
 *    <link rel="preconnect" href="https://fonts.googleapis.com">
 *    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 *    <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Space+Grotesk:wght@400;500&display=swap" rel="stylesheet">
 * 3) Importa el componente: import Galeria from "./Galeria";
 * ---------------------------------------------------------------
 */

// Ficha de cada obra. Ajusta los títulos/técnicas a tu contenido real.
const OBRAS = [
  { id: 1, src: "/galeria1.png", titulo: "Memoria Andina", tecnica: "Fotografía", año: "2023", tamaño: "alto" },
  { id: 2, src: "/galeria2.png", titulo: "Tejido Urbano", tecnica: "Fotografía", año: "2022", tamaño: "cuadrado" },
  { id: 3, src: "/galeria3.png", titulo: "Silencio de Altura", tecnica: "Fotografía", año: "2024", tamaño: "ancho" },
  { id: 4, src: "/galeria4.png", titulo: "Vestigio", tecnica: "Fotografía", año: "2021", tamaño: "cuadrado" },
  { id: 5, src: "/galeria5.png", titulo: "Raíz Colectiva", tecnica: "Fotografía", año: "2023", tamaño: "alto" },
  { id: 6, src: "/galeria6.png", titulo: "Umbral", tecnica: "Fotografía", año: "2022", tamaño: "ancho" },
  { id: 7, src: "/galeria7.png", titulo: "Fragmento Vivo", tecnica: "Fotografía", año: "2024", tamaño: "cuadrado" },
];

const TAMAÑO_CLASES = {
  alto: "row-span-2",
  ancho: "md:col-span-2",
  cuadrado: "",
};

function useEnPantalla(umbral = 0.25) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          observador.unobserve(nodo);
        }
      },
      { threshold: umbral }
    );
    observador.observe(nodo);
    return () => observador.disconnect();
  }, [umbral]);

  return [ref, visible];
}

function Cuadro({ obra, indice }) {
  const [ref, visible] = useEnPantalla(0.2);
  const marcoRef = useRef(null);

  const manejarMovimiento = (e) => {
    const rect = marcoRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    marcoRef.current.style.setProperty("--mx", `${x}%`);
    marcoRef.current.style.setProperty("--my", `${y}%`);
  };

  return (
    <figure
      ref={(nodo) => {
        ref.current = nodo;
        marcoRef.current = nodo;
      }}
      onMouseMove={manejarMovimiento}
      className={`galeria-cuadro group relative overflow-hidden ${TAMAÑO_CLASES[obra.tamaño]} ${
        visible ? "cuadro-visible" : ""
      }`}
      style={{ transitionDelay: `${(indice % 4) * 90}ms` }}
    >
      {/* Marco trazado con SVG, se "dibuja" al entrar en pantalla */}
      <svg
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <rect
          className="marco-trazo"
          x="1"
          y="1"
          width="98"
          height="98"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="0.6"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Spotlight que sigue el cursor */}
      <div className="spotlight pointer-events-none absolute inset-0 z-10" />

      <div className="relative h-full w-full overflow-hidden bg-[var(--bg-soft)]">
        <img
          src={obra.src}
          alt={obra.titulo}
          loading="lazy"
          className="h-full w-full object-cover grayscale-[15%] contrast-[1.05] transition-all duration-[1400ms] ease-out group-hover:grayscale-0 group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--bg)]/85 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-40" />
      </div>

      {/* Ficha de museo */}
      <figcaption className="ficha absolute inset-x-0 bottom-0 z-30 translate-y-[65%] px-5 py-4 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
        <span className="block font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--gold)]">
          Obra N.º {String(obra.id).padStart(2, "0")}
        </span>
        <h3 className="mt-1 font-display text-lg leading-tight text-[var(--ink)]">
          {obra.titulo}
        </h3>
        <p className="mt-0.5 font-mono text-[11px] tracking-wide text-[var(--ink-muted)]">
          {obra.tecnica} · {obra.año}
        </p>
      </figcaption>
    </figure>
  );
}

export default function Galeria() {
  return (
    <section className="galeria-root min-h-screen w-full bg-[var(--bg)] px-6 py-20 sm:px-10 lg:px-16">
      <style>{`
        .galeria-root {
          --bg: #14120f;
          --bg-soft: #1c1914;
          --ink: #ede7da;
          --ink-muted: #948c7b;
          --gold: #c9a227;
          --line: #3a3428;
          font-family: "Space Grotesk", "Segoe UI", sans-serif;
        }
        .font-display { font-family: "Fraunces", "Georgia", serif; }
        .font-mono { font-family: "Space Grotesk", monospace; }

        .galeria-cuadro {
          border: 1px solid var(--line);
          background: var(--bg-soft);
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.9s ease-out, transform 0.9s ease-out;
        }
        .cuadro-visible { opacity: 1; transform: translateY(0); }

        .marco-trazo {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          transition: stroke-dashoffset 1.3s cubic-bezier(0.65, 0, 0.35, 1);
        }
        .cuadro-visible .marco-trazo { stroke-dashoffset: 0; transition-delay: 0.15s; }

        .spotlight {
          background: radial-gradient(180px circle at var(--mx, 50%) var(--my, 50%), rgba(201,162,39,0.18), transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .galeria-cuadro:hover .spotlight { opacity: 1; }

        .ficha {
          background: linear-gradient(to top, rgba(20,18,15,0.96), rgba(20,18,15,0.75) 70%, transparent);
        }

        @media (prefers-reduced-motion: reduce) {
          .galeria-cuadro, .marco-trazo, .spotlight, .ficha, img { transition: none !important; }
          .galeria-cuadro { opacity: 1; transform: none; }
          .marco-trazo { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Encabezado */}
      <header className="mx-auto mb-16 max-w-3xl">
        <span className="font-mono text-xs uppercase tracking-[0.4em] text-[var(--gold)]">
          Sala 01 — Colección permanente
        </span>
        <h1 className="font-display mt-4 text-4xl italic text-[var(--ink)] sm:text-5xl">
          Trazos de Memoria
        </h1>
        <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-[var(--ink-muted)]">
          Siete piezas sobre identidad, territorio y tiempo. Recorre la sala y detente
          en cada cuadro: cada marco se dibuja al llegar, cada ficha se revela al mirar.
        </p>
        <div className="mt-8 h-px w-full bg-[var(--line)]" />
      </header>

      {/* Grid tipo pared de museo */}
      <div className="mx-auto grid max-w-6xl auto-rows-[220px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {OBRAS.map((obra, i) => (
          <Cuadro key={obra.id} obra={obra} indice={i} />
        ))}
      </div>

      <footer className="mx-auto mt-16 max-w-6xl">
        <div className="h-px w-full bg-[var(--line)]" />
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--ink-muted)]">
          Fin de la exhibición
        </p>
      </footer>
    </section>
  );
}