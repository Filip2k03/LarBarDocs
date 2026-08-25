export const navigationItems = [
  { href: '/ride', labelKey: 'ride', desktop: true },
  { href: '/drive', labelKey: 'drive', desktop: true },
  { href: '/delivery', labelKey: 'delivery', desktop: true },
  { href: '/airport', labelKey: 'airport', desktop: false },
  { href: '/schedule', labelKey: 'schedule', desktop: false },
  { href: '/business', labelKey: 'business', desktop: true },
  { href: '/safety', labelKey: 'safety', desktop: true },
  { href: '/promotions', labelKey: 'promotions', desktop: true },
  { href: '/fares', labelKey: 'fares', desktop: false },
  { href: '/help', labelKey: 'help', desktop: true },
  { href: '/about', labelKey: 'about', desktop: true },
] as const;

export type NavigationItem = (typeof navigationItems)[number];
export type NavigationLabelKey = NavigationItem['labelKey'];

export function isNavigationItemActive(pathname: string, href: string): boolean {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  return normalizedPath === href || normalizedPath.startsWith(`${href}/`);
}
