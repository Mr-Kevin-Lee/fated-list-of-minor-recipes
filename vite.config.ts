import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => ({
  // GitHub Pages serves project sites at https://<user>.github.io/<repo-name>/ — this must
  // match the actual GitHub repo name, or assets will 404. Only applied for production builds,
  // since the dev server should keep serving at the plain localhost root.
  base: command === 'build' ? '/fated-list-of-minor-recipes/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Fated List of Minor Recipes',
        short_name: 'Fated List',
        description: 'See what you can make after a farmer\'s market trip.',
        theme_color: '#1c1420',
        background_color: '#1c1420',
        display: 'standalone',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
}));
