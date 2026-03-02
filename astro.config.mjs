import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://valentinaduran.cl',
  build: {
    assets: '_assets'
  }
});
