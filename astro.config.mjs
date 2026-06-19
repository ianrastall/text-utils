import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://text-utils.net',
  output: 'static',
  build: {
    format: 'file'
  }
});
