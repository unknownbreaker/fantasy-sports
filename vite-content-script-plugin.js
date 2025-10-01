import { resolve } from 'path';
import { build } from 'vite';

export function extensionScriptsPlugin() {
  return {
    name: 'extension-scripts-iife',
    async closeBundle() {
      // Build content script as IIFE - output to dist root
      await build({
        configFile: false,
        build: {
          lib: {
            entry: resolve(process.cwd(), 'src/content/content.js'),
            formats: ['iife'],
            name: 'ContentScript',
            fileName: () => 'content.js',
          },
          outDir: 'dist', // ✓ Output to dist root
          emptyOutDir: false,
          rollupOptions: {
            output: {
              extend: true,
            },
          },
        },
      });
      console.log('✓ Content script built as IIFE at dist/content.js');

      // Build background script as IIFE - output to dist root
      await build({
        configFile: false,
        build: {
          lib: {
            entry: resolve(process.cwd(), 'src/background/background.js'),
            formats: ['iife'],
            name: 'BackgroundScript',
            fileName: () => 'background.js',
          },
          outDir: 'dist', // ✓ Output to dist root
          emptyOutDir: false,
          rollupOptions: {
            output: {
              extend: true,
            },
          },
        },
      });
      console.log('✓ Background script built as IIFE at dist/background.js');
    },
  };
}
