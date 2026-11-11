import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    fs: {
      allow: [
        '/Users/danicahartawan/Documents/ChatGPT/databricks',
        '/Users/danicahartawan/Downloads',
      ],
    },
  },
});
