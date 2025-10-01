import { resolve } from 'path';
import { build } from 'vite';

export function extensionScriptsPlugin() {
  return {
    name: 'extension-scripts-iife',
    async closeBundle() {
      // Build content script as IIFE
      await build({
        configFile: false,
        build: {
          lib: {
            entry: resolve(process.cwd(), 'src/content/content.js'),
            formats: ['iife'],
            name: 'ContentScript',
            fileName: () => 'content.js',
          },
          outDir: 'dist/content',
          emptyOutDir: false,
          rollupOptions: {
            output: {
              extend: true,
            },
          },
        },
      });
      console.log('✓ Content script built as IIFE');

      // Build background script as IIFE
      await build({
        configFile: false,
        build: {
          lib: {
            entry: resolve(process.cwd(), 'src/background/background.js'),
            formats: ['iife'],
            name: 'BackgroundScript',
            fileName: () => 'background.js',
          },
          outDir: 'dist/background',
          emptyOutDir: false,
          rollupOptions: {
            output: {
              extend: true,
            },
          },
        },
      });
      console.log('✓ Background script built as IIFE');
    },
  };
}
