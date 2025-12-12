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
          background: '#F0F2F5',      // A soft, very light gray
          surface: '#FFFFFF',         // Clean white for cards/modals
          text: {
            primary: '#1A202C',     // A deep, near-black
            secondary: '#718096',   // A cool, medium gray
          },
          border: '#E2E8F0',         // A subtle, light gray border
        },
        // Dark Theme Colors (Updated to be black-dominant)
        dark: {
          background: '#000000',      // Pure Black
          surface: '#111111',         // Very Dark Gray for surfaces
          text: {
            primary: '#FFFFFF',     // Pure White for max contrast
            secondary: '#A0AEC0',   // Soft, light gray for secondary text
          },
          border: '#2D3748',         // Darker border
        },
        // Brand/Accent Colors
        brand: {
          primary: '#4299E1',      // A vibrant, accessible blue
          primaryHover: '#3182CE', // A slightly darker blue for hover states
          danger: '#E53E3E',         // A strong, clear red
          dangerHover: '#C53030',   // A darker red for hover
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'subtle-float': 'subtle-float 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'subtle-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 25px rgba(59, 130, 246, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
