import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  optimizeDeps: {
    include: [
      'prop-types',
      'react-simple-maps',
      'topojson-client',
      'd3-geo',
    ],
  },
})
