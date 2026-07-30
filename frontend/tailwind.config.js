/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif", "Nunito"],
        cursive: ["Pacifico", "Sriracha", "cursive"],
        cursive2: ["Sriracha", "cursive"],
      },
      colors: {
        primary: "#854d3d",
        secondary: "#4a1e1b",
        brandDark: "#270c03",
        // 🔥 IMPORTANTE: Define light y dark como colores fijos
        light: "#f5f5f5",
        dark: "#1e1e1e",
        accent: {
          DEFAULT: "#b86b57",
          light: "#d48f7a",
          dark: "#6a3a2e",
        },
        text: {
          primary: "#f5f5f5",
          secondary: "#c9b6a8",
          muted: "#a58e7e",
        },
        bg: {
          dark: "#1a0f0c",
          card: "#2a1a15",
          hover: "#3a251f",
        }
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "3rem",
        },
      },
      animation: {
        "spin-slow": "spin 40s linear infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};