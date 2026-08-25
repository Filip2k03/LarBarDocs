# Public website deployment

The site is a static Astro build. Set public variables at build time; no API hostname is embedded in source code.

## Required production values

```env
PUBLIC_SITE_URL=https://labartaxi.com
PUBLIC_API_BASE_URL=https://api.labartaxi.com/api/v1
PUBLIC_CDN_URL=https://cdn.labartaxi.com
PUBLIC_STORAGE_URL=https://storage.labartaxi.com
PUBLIC_APP_ENV=production
PUBLIC_PASSENGER_APP_URL=labar://ride
```

Run `npm ci`, `npm run check`, and `npm run build`. Publish `dist/` to Hostinger KVM 4 Caddy / Docker, Cloudflare Pages, or Vercel.

For Docker, pass public values as build arguments. Route `labartaxi.com` and `www.labartaxi.com` to this frontend and `api.labartaxi.com` to the Go API. Enable TLS at the edge or reverse proxy (Caddy / Let's Encrypt). The API CORS allow-list must include `https://labartaxi.com`, `https://www.labartaxi.com`, `https://admin.labartaxi.com`, and `https://driverreg.labartaxi.com`.

City-detail and help-article paths are generated from the real Go API during a production static build. Ensure the API and database migrations are available while building so those dynamic content paths are emitted.
