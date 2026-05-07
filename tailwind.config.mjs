/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a14',
        surface: '#12121f',
        card: '#1a1a2e',
        border: '#2a2a4e',
        primary: '#5865F2',
        'primary-hover': '#4752c4',
        cyan: '#00d4ff',
        green: '#57F287',
        red: '#ED4245',
        text: '#dcddde',
        muted: '#72767d',
        dim: '#4a4a6a',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '"Noto Sans JP"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0, 212, 255, 0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(0, 212, 255, 0.7)' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(88,101,242,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(88,101,242,0.05) 1px, transparent 1px)`,
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
};
