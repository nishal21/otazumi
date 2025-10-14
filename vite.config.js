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
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MB
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
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
})
