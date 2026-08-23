export const API_CONFIG = {
  baseUrl: (import.meta.env.PUBLIC_API_BASE_URL as string) || 'http://localhost:8080/api/v1',
  siteUrl: (import.meta.env.PUBLIC_SITE_URL as string) || 'http://localhost:4321',
  appEnv: (import.meta.env.PUBLIC_APP_ENV as string) || 'local',
  defaultLocale: (import.meta.env.PUBLIC_DEFAULT_LOCALE as string) || 'en',
  timeoutMs: 12000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Platform': 'LaBar-Public-Web',
    'X-Client-Version': '1.0.0',
  },
};
