import type { APIRoute } from 'astro';

const routes = ['/', '/ride', '/drive', '/delivery', '/airport', '/schedule', '/business', '/safety', '/promotions', '/cities', '/fares', '/about', '/careers', '/download', '/help', '/contact', '/status', '/legal/privacy', '/legal/terms', '/legal/cookies'];

export const GET: APIRoute = () => {
  const site = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';
  const urls = routes.map((route) => `<url><loc>${new URL(route, site).toString()}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
