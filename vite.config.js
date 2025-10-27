import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.png', 'splash.png'],
      strategies: 'generateSW',
      manifest: false,
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/_/, // Exclude internal routes
          /^\/@/, // Exclude Vite dev routes
          /\/[^/?]+\.[^/]+$/, // Exclude files with extensions
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/otazumi-cors-proxy-nishal\.nishalamv\.workers\.dev\/.*$/,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'api-cache',
            },
          },
          {
            urlPattern: /^https:\/\/.*\.(m3u8|ts)$/,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'video-cache',
            },
          },
          {
            urlPattern: /^https:\/\/.*\.(vtt|srt)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'subtitle-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000 kB
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@heroui/react', 'framer-motion', 'swiper', 'react-icons', '@fortawesome/react-fontawesome'],
          'video-vendor': ['artplayer', 'artplayer-plugin-chapter', 'artplayer-plugin-hls-control', 'hls.js', 'vidstack', '@vidstack/react', 'plyr-react'],
          'utils-vendor': ['axios', 'clsx', 'tailwind-merge', 'class-variance-authority'],
          'animation-vendor': ['framer-motion'],
          'firebase-vendor': ['firebase'],
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
})
