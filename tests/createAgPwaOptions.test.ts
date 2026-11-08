import { describe, expect, it } from 'vitest';
import { createAgPwaOptions } from '../src/index.js';

const base = { name: 'Greens Events', description: 'Manage events.' };

describe('createAgPwaOptions', () => {
  describe('manifest defaults', () => {
    it('uses the given name and description, and the Greens green on white', () => {
      const { manifest } = createAgPwaOptions(base);
      expect(manifest).toMatchObject({
        name: 'Greens Events',
        description: 'Manage events.',
        theme_color: '#009539',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
      });
    });

    it('defaults short_name to name', () => {
      expect(createAgPwaOptions(base).manifest).toMatchObject({ short_name: 'Greens Events' });
    });

    it('lets short_name differ from name', () => {
      const { manifest } = createAgPwaOptions({ ...base, name: 'Greens Events Manager', shortName: 'Events' });
      expect(manifest).toMatchObject({ name: 'Greens Events Manager', short_name: 'Events' });
    });

    it('lists the icons the assets generator emits, with a maskable variant', () => {
      const icons = (createAgPwaOptions(base).manifest as { icons: unknown[] }).icons;
      expect(icons).toEqual([
        { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ]);
    });

    it('omits orientation unless asked for one', () => {
      expect(createAgPwaOptions(base).manifest).not.toHaveProperty('orientation');
      expect(createAgPwaOptions({ ...base, orientation: 'portrait' }).manifest).toMatchObject({
        orientation: 'portrait',
      });
    });
  });

  describe('overrides', () => {
    it('applies theme and background colours', () => {
      const { manifest } = createAgPwaOptions({ ...base, themeColor: '#111111', backgroundColor: '#222222' });
      expect(manifest).toMatchObject({ theme_color: '#111111', background_color: '#222222' });
    });

    it('replaces the default icons when icons are given', () => {
      const icons = [{ src: 'x.png', sizes: '48x48', type: 'image/png' }];
      expect(createAgPwaOptions({ ...base, icons }).manifest).toMatchObject({ icons });
    });

    it('merges extra manifest fields without losing the defaults', () => {
      const { manifest } = createAgPwaOptions({ ...base, manifest: { lang: 'en-AU' } });
      expect(manifest).toMatchObject({ lang: 'en-AU', name: 'Greens Events', display: 'standalone' });
    });
  });

  describe('service worker', () => {
    it('auto-updates', () => {
      expect(createAgPwaOptions(base).registerType).toBe('autoUpdate');
    });

    it('precaches the static shell with an index.html navigation fallback', () => {
      const { workbox } = createAgPwaOptions(base);
      expect(workbox).toMatchObject({
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      });
    });

    // Auth0 and backend calls are cross-origin and must always hit the network. With no
    // runtime routes registered they never go near the service worker's cache.
    it('registers no runtime caching, so auth and API calls always hit the network', () => {
      expect(createAgPwaOptions(base).workbox).not.toHaveProperty('runtimeCaching');
    });

    it('merges workbox overrides over the defaults', () => {
      const { workbox } = createAgPwaOptions({ ...base, workbox: { navigateFallbackDenylist: [/^\/api/] } });
      expect(workbox).toMatchObject({
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
      });
    });
  });
});
