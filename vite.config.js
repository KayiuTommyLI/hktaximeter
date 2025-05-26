import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/hktaximeter/', // Critical for subdirectory deployment
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild', // Using esbuild instead of terser
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        },
        // Simplified asset naming for easier debugging
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    target: 'es2018',
    cssCodeSplit: true,
    // Make sure assets are copied to the output directory
    assetsInlineLimit: 4096, // Don't inline files larger than 4KB
    emptyOutDir: true, // Clean output directory before building
  },
  server: {
    port: 3000
  },
  preview: {
    port: 4173,
    base: '/hktaximeter/' // Important for local testing
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  publicDir: 'public', // Make sure this is set correctly
})