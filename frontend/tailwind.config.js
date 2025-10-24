/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // === Dark Emerald Color Palette - Rich & Elegant ===
        primary: {
          blue: '#065f46',
          purple: '#047857',
          cyan: '#0f766e',
        },

        // === Accent Colors ===
        accent: {
          gold: '#d97706',
          green: '#047857',
          orange: '#f59e0b',
        },

        // === Neutral Colors - Bright & Modern ===
        neutral: {
          bg: '#f8fafc',
          bg2: '#e2e8f0',
          bg3: '#cbd5e1',
          card: '#ffffff',
          text: '#1e293b',
          text2: '#475569',
          muted: '#64748b',
          tacc: '#334155',
        },

        // === Neutral Colors (Dark Mode) ===
        dark: {
          bg: '#0f172a',
          bg2: '#1e293b',
          bg3: '#334155',
          card: '#1e293b',
          text: '#f8fafc',
          text2: '#cbd5e1',
          muted: '#94a3b8',
          tacc: '#e2e8f0',
        },

        // === Gamification Colors ===
        game: {
          xp: '#f59e0b',
          level: '#047857',
          badge: '#10b981',
          streak: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
      },
      boxShadow: {
        glow: '0 0 30px rgba(6,95,70,0.3)',
        card: '0 10px 40px rgba(0,0,0,0.1)',
        hover: '0 20px 60px rgba(6,95,70,0.2)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #065f46, #047857)',
        'gradient-secondary': 'linear-gradient(135deg, #0f766e, #047857)',
        'gradient-accent': 'linear-gradient(135deg, #d97706, #f59e0b)',
        'gradient-card': 'linear-gradient(145deg, #ffffff, #f0fdfa)',
      },
      animation: {
        'gradient-shift': 'gradientShift 8s ease-in-out infinite',
        'background-shift': 'backgroundShift 12s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 0.6s ease-out',
        'progress-glow': 'progressGlow 2s ease-in-out infinite',
        'xp-glow': 'xpGlow 3s ease-in-out infinite',
        'notification-pulse': 'notificationPulse 2s ease-in-out infinite',
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        backgroundShift: {
          '0%, 100%': { transform: 'translateX(0) translateY(0)' },
          '25%': { transform: 'translateX(2px) translateY(-2px)' },
          '50%': { transform: 'translateX(-2px) translateY(2px)' },
          '75%': { transform: 'translateX(2px) translateY(2px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        progressGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(217,119,6,0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(217,119,6,0.8)' },
        },
        xpGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(245,158,11,0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(245,158,11,0.6)' },
        },
        notificationPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};

