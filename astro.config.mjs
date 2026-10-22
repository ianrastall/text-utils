import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://text-utils.net',
  output: 'static',
  vite: { worker: { format: 'es' } },
  build: {
    format: 'file'
  }
});
