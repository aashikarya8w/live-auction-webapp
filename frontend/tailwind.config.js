/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {

      /* 🔥 COLORS (Auction theme) */
      colors: {
        primary: "#4f46e5",   // Indigo
        secondary: "#6366f1",
        success: "#22c55e",
        danger: "#ef4444",
        warning: "#f59e0b",
      },

      /* 🔥 FONT */
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },

      /* 🔥 SHADOWS */
      boxShadow: {
        card: "0 4px 14px rgba(0,0,0,0.1)",
        hover: "0 10px 25px rgba(0,0,0,0.15)",
      },

      /* 🔥 BORDER RADIUS */
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },

      /* 🔥 ANIMATION */
      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out",
        bounceSlow: "bounce 2s infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },

    },
  },

  plugins: [],
};