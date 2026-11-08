import { VitePWA, type ManifestOptions, type VitePWAOptions } from 'vite-plugin-pwa';

/** Australian Greens green, from the triangle logo. */
export const AG_THEME_COLOR = '#009539';

type ManifestIcon = NonNullable<ManifestOptions['icons']>[number];

/** The files `pwa-assets-generator` (minimal2023 preset) writes into `public/`. */
export const AG_DEFAULT_ICONS: ManifestIcon[] = [
  { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
  { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
  { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
  { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
];

export interface AgPwaOptions {
  /** Full app name, shown on install dialogs and splash screens. */
  name: string;
  /** Home-screen label. Keep it short: iOS truncates around 12 characters. Defaults to `name`. */
  shortName?: string;
  description: string;
  /** Defaults to Greens green. Colours the browser UI and Android's status bar. */
  themeColor?: string;
  /** Android splash screen background. Defaults to white. */
  backgroundColor?: string;
  /** Omitted by default, which leaves the device free to rotate. */
  orientation?: ManifestOptions['orientation'];
  /** Replaces the default icon set. */
  icons?: ManifestIcon[];
  /** Extra manifest fields, merged over the defaults. */
  manifest?: Partial<ManifestOptions>;
  /** Extra workbox settings, merged over the defaults. */
  workbox?: NonNullable<VitePWAOptions['workbox']>;
}

/**
 * Options for `VitePWA()`. Pure, so apps can spread the result and override
 * anything (for example `registerType: 'prompt'`).
 *
 * The service worker only precaches the static shell. It deliberately registers
 * no runtime caching: Auth0 and backend calls are cross-origin and must always
 * go straight to the network, and stale API data is worse than none.
 */
export function createAgPwaOptions(options: AgPwaOptions): Partial<VitePWAOptions> {
  return {
    // New deploys activate on the next load; there is no update-prompt UI.
    registerType: 'autoUpdate',
    manifest: {
      name: options.name,
      short_name: options.shortName ?? options.name,
      description: options.description,
      theme_color: options.themeColor ?? AG_THEME_COLOR,
      background_color: options.backgroundColor ?? '#ffffff',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      ...(options.orientation ? { orientation: options.orientation } : {}),
      icons: options.icons ?? AG_DEFAULT_ICONS,
      ...options.manifest,
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      navigateFallback: 'index.html',
      // MUI and Sentry chunks are large; the default 2 MiB limit would silently skip them.
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      ...options.workbox,
    },
  };
}

/** `VitePWA()` pre-configured with Australian Greens defaults. */
export function agPwa(options: AgPwaOptions) {
  return VitePWA(createAgPwaOptions(options));
}
