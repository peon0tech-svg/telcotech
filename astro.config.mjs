// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Canonical site URL — used for sitemap, canonical links and og:url.
  // MIGRATION: change this single line when moving to https://telcoanalysis.com
  site: 'https://telcotech.peon.tech',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react(), sitemap()]
});
