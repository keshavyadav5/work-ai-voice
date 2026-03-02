import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#39FF14',
        background: { dark: '#0a0a0f' },
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        brutal: '4px 4px 0px 0px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}

export default config