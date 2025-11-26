/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'sans-serif'],
      },
      colors: {
        // Light Theme Colors
        light: {
          background: '#f8f9fa',      // Very light gray
          surface: '#ffffff',         // White
          text: {
            primary: '#212529',     // Almost black
            secondary: '#6c757d',   // Medium gray
          },
          border: '#dee2e6',         // Light gray border
        },
        // Dark Theme Colors
        dark: {
          background: '#121212',      // True black
          surface: '#1e1e1e',         // Off-black for cards
          text: {
            primary: '#e0e0e0',     // Light gray
            secondary: '#a0a0a0',   // Dimmer gray
          },
          border: '#343a40',         // Dark gray border
        },
        // Brand/Accent Colors
        brand: {
          primary: '#3b82f6',      // Blue-500
          primaryHover: '#2563eb', // Blue-600
          danger: '#ef4444',         // Red-500
          dangerHover: '#dc2626',   // Red-600
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
