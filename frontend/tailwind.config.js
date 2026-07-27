/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#12161a',
        surface: '#1b2126',
        surface2: '#222932',
        border: '#2b333c',
        ink: '#e9edf1',
        muted: '#8d98a3',
        brand: {
          orange: '#ff6a13',
          orangedim: '#7a3a17',
          yellow: '#f2c230'
        },
        info: '#4d9fec',
        good: '#3fb27f',
        warn: '#f2a93b',
        bad: '#e5484d'
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'monospace']
      },
      boxShadow: {
        modal: '0 20px 60px rgba(0,0,0,.5)'
      }
    }
  },
  plugins: []
};
