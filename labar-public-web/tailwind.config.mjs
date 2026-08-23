/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E53935',
          deepRed: '#C62828',
          lightRed: '#FFEBEE',
          yellow: '#FFD23F',
          gold: '#F59E0B',
          bg: '#F7F7F5',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          text: '#171717',
          secondary: '#6B6B6B',
          muted: '#9E9E9E',
          border: '#E5E5E5',
          borderSubtle: '#F0F0F0',
          success: '#22A447',
          successLight: '#E8F5E9',
          cyan: '#0284C7',
          cyanLight: '#E0F2FE',
          dark: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'Pyidaungsu', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Poppins', 'Pyidaungsu', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'soft': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'soft-md': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 16px 40px rgba(0, 0, 0, 0.12)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
