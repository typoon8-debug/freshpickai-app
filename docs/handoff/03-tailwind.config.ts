// handoff/03-tailwind.config.ts — copy to project root as tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        mocha: {
          50:  '#FAF4EC',
          100: '#F2E7D8',
          300: '#DBC1A4',
          400: '#C2A07F',
          500: '#A47551',
          700: '#6B4A2E',
          900: '#3B2A1E',
        },
        olive: {
          100: '#E8E5C8',
          500: '#6B7A3B',
          700: '#4A5527',
        },
        paper: '#F7F1E6',
        line:  '#E8DFCF',
        ink: {
          300: '#B8AEA2',
          500: '#7A6E64',
          700: '#3A302A',
          900: '#1A1410',
        },
        terracotta: '#B8736A',
        honey:      '#D4A04A',
        sage:       '#5C8A7A',
      },
      fontFamily: {
        display: ['"Bree Serif"', 'Georgia', 'serif'],
        sans:    ['Pretendard', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        pill: '100px',
      },
      boxShadow: {
        card:  '0 1px 0 #E8DFCF',
        hover: '0 12px 28px rgba(107,74,46,.12)',
        cta:   '0 4px 14px rgba(107,74,46,.25)',
        phone: '0 30px 80px rgba(59,42,30,.20)',
      },
      letterSpacing: {
        tightest: '-2px',
        tighter:  '-0.8px',
        tight:    '-0.3px',
        label:    '2px',
      },
      maxWidth: { phone: '375px' },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
