import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest-and-icons',
      closeBundle() {
        // Copy manifest
        copyFileSync('manifest.json', 'dist/manifest.json');
        // Copy icons
        copyFileSync('public/icons/icon-16.png', 'dist/icons/icon-16.png');
        copyFileSync('public/icons/icon-32.png', 'dist/icons/icon-32.png');
        copyFileSync('public/icons/icon-48.png', 'dist/icons/icon-48.png');
        copyFileSync('public/icons/icon-96.png', 'dist/icons/icon-96.png');
      },
    },
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup/index.html'),
        background: resolve(__dirname, 'src/background/background.js'),
        content: resolve(__dirname, 'src/content/content.js'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background/[name].js';
          }
          if (chunkInfo.name === 'content') {
            return 'content/[name].js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
  },
});
