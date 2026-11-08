# ag-vite-pwa

Australian Greens defaults for making a Vite app an installable PWA. A thin wrapper over
[`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) that fixes the manifest shape, the
service worker policy and the icon file names, so every app is installable the same way.

Deliberately small. It does not touch auth, and it contains no React. The install-prompt UI lives
in `@australiangreens/ag-internal-components`.

## Use

```bash
pnpm add -D @australiangreens/ag-vite-pwa @vite-pwa/assets-generator
```

```ts
// vite.config.ts
import { agPwa } from '@australiangreens/ag-vite-pwa';

export default defineConfig({
  plugins: [
    agPwa({
      name: 'Greens Events',
      description: 'Manage Australian Greens events.',
      // shortName: 'Events',        // home-screen label, defaults to name (iOS truncates at ~12 chars)
      // themeColor: '#009539',      // default
      // orientation: 'portrait',    // default: unset
    }),
  ],
});
```

Need to override something? Use `createAgPwaOptions()` and spread it:

```ts
VitePWA({ ...createAgPwaOptions({ name, description }), registerType: 'prompt' });
```

`manifest` and `workbox` options are merged over the defaults.

## Icons

The default manifest expects these files in `public/`, which `pwa-assets-generator` writes with its
`minimal2023` preset: `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`,
`maskable-icon-512x512.png`, plus `apple-touch-icon-180x180.png` and `favicon.ico`.

Android crops the maskable icon to a circle that keeps only the central 80%, so give it its own
layout rather than padding the normal logo. A logo with wide corners, like the Greens triangle, is
clipped otherwise.

`index.html` also needs the iOS tags, which are not generated from the manifest:

```html
<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
<meta name="theme-color" content="#009539" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-title" content="Greens Events" />
```

## Service worker policy

- Precaches the static shell only (`js`, `css`, `html`, images, fonts) with an `index.html` navigation
  fallback.
- Registers **no runtime caching**. Auth0 and backend calls are cross-origin and always go to the
  network. Do not add `runtimeCaching` for them.
- `registerType: 'autoUpdate'`: a new deploy activates on the next load.

## Hosting

Serve `index.html`, `sw.js`, `registerSW.js` and `manifest.webmanifest` with `Cache-Control:
max-age=0`. A stale copy at a CDN means installed apps never pick up new deploys.

## Apps using Auth0

For an installed app to resume after a cold launch, store tokens in `localStorage`
(`cacheLocation="localstorage"`) with refresh-token rotation enabled. The default in-memory cache is
lost on every launch, and the iframe fallback is blocked by third-party cookie restrictions on iOS
and Android.

## Development

```bash
pnpm install
pnpm checkall   # tsc + tests
pnpm build
```

See [PUBLISHING.md](./PUBLISHING.md).
