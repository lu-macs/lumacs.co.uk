import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

import cloudflare from '@astrojs/cloudflare';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://lumacs.co.uk',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'load',
  },
  integrations: [tailwind({
    applyBaseStyles: false,
  }), react(), sitemap()],
  output: 'static',
  adapter: cloudflare(),
});