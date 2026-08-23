export const API_ENDPOINTS = {
  // Public Configuration & System Status
  config: '/public/config',
  status: '/public/status',
  faqs: '/public/faqs',

  // Cities & Regions
  cities: '/public/cities',
  cityBySlug: (slug: string) => `/public/cities/${encodeURIComponent(slug)}`,

  // Ride Types & Fares
  rideTypes: '/public/ride-types',
  fares: '/public/fares',
  fareEstimate: '/public/fares/estimate',

  // Bookings & Quotes
  bookingQuote: '/public/bookings/quote',
  createBooking: '/public/bookings',
  bookingStatus: (bookingId: string) => `/public/bookings/${encodeURIComponent(bookingId)}`,

  // Location Autocomplete Search
  locationSearch: (query: string, citySlug?: string) => {
    const params = new URLSearchParams({ q: query });
    if (citySlug) params.append('city', citySlug);
    return `/public/locations/search?${params.toString()}`;
  },

  // Promotions
  promotions: '/public/promotions',
  validatePromo: (code: string) => `/public/promotions/validate?code=${encodeURIComponent(code)}`,

  // Help Center & Knowledge Base
  helpCategories: '/public/help/categories',
  helpArticles: '/public/help/articles',
  helpArticleBySlug: (slug: string) => `/public/help/articles/${encodeURIComponent(slug)}`,
  helpSearch: (query: string) => `/public/help/search?q=${encodeURIComponent(query)}`,

  // Support & Contact
  supportTickets: '/public/support/tickets',
  contactInquiry: '/public/contact',

  // Driver Recruitment & Applications
  driverApplications: '/public/driver-applications',
  driverApplicationStatus: (ref: string) => `/public/driver-applications/${encodeURIComponent(ref)}`,

  // Business Inquiries
  businessInquiries: '/public/business/inquiries',
} as const;
