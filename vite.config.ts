import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Plugin para garantir cópia de arquivos e pastas ocultas (como .well-known) da pasta public para a pasta dist
function copyWellKnownPlugin(): Plugin {
  return {
    name: 'copy-well-known',
    closeBundle() {
      const srcDir = path.resolve(__dirname, 'public/.well-known');
      const destDir = path.resolve(__dirname, 'dist/.well-known');
      if (fs.existsSync(srcDir)) {
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        fs.cpSync(srcDir, destDir, { recursive: true });
      }
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    publicDir: 'public',
    build: {
      target: ['es2015', 'chrome60', 'safari11', 'edge18'],
      cssTarget: ['es2015', 'chrome60', 'safari11', 'edge18'],
      assetsDir: 'assets',
      modulePreload: {
        polyfill: true,
      },
      rollupOptions: {
        output: {
          // Garante caminhos de assets absolutos e organizados na raiz
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
        },
      },
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({
            overrideBrowserslist: [
              '> 0.5%',
              'last 2 versions',
              'Firefox ESR',
              'not dead',
              'Chrome >= 60',
              'Safari >= 11',
              'Edge >= 18',
              'iOS >= 11',
              'Android >= 6',
            ],
            flexbox: 'no-2009',
            grid: 'autoplace',
          }),
        ],
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      copyWellKnownPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'apple-touch-icon.png',
          'icon-192.png',
          'icon-512.png',
          'icon.svg',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
          'styles.css',
          'perfilTecnico.js',
          'bloco1Vendas.js',
          'bloco2Tecnica.js',
          'bloco3Gestao.js',
          'bloco4Comunidade.js',
          'chat.js',
          'app.js',
          'login.js',
          'dashboard.js',
          'admin.js',
          'tecnica_mz_slogan.jpg',
        ],
        manifest: ({
          id: '/',
          name: 'TécnicaMZ Pro',
          short_name: 'TécnicaMZ Pro',
          description: 'A maior rede de profissionais técnicos e empresas de engenharia em Moçambique. Encontre especialistas em eletrônica, eletricidade, refrigeração e TI.',
          start_url: '/?mode=standalone',
          scope: '/',
          display: 'standalone',
          display_override: ['standalone', 'fullscreen', 'minimal-ui'],
          capture_links: 'existing_client_navigate',
          orientation: 'portrait',
          background_color: '#020617',
          theme_color: '#020617',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
            },
          ],
        } as any),
        workbox: {
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,jpg}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api/, /^\/\.well-known/],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-resources-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
                },
              },
            },
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'cdnjs-cdn-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
