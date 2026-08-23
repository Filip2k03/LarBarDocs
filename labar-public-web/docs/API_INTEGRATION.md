# 🔌 LaBar Public Web — Real Go REST API Integration Guide

This document defines the strict, production-ready REST & WebSocket API integration contract between the **Astro.js Public Frontend** (`labar-public-web`) and the **Golang Backend Core Dispatch Service** (`codebase/backend`).

---

## 🌐 Environment Variables

| Variable | Local Development | Production | Purpose |
|---|---|---|---|
| `PUBLIC_SITE_URL` | `http://localhost:4321` | `https://labar.com.mm` | Canonical base URL |
| `PUBLIC_API_BASE_URL` | `http://localhost:8080/api/v1` | `https://api.labar.com.mm/api/v1` | Go REST API Root |
| `PUBLIC_APP_ENV` | `local` | `production` | Environment flag |
| `PUBLIC_DEFAULT_LOCALE` | `en` | `en` | Default UI language |
| `PUBLIC_SUPPORTED_LOCALES` | `en,my` | `en,my` | Supported i18n locales |

---

## 📡 API Endpoint Surface

### 1. System Configuration & Health
- `GET /public/config`: Platform settings, support hotline, minimum app version, enabled features.
- `GET /public/status`: Live component uptime status, WebSocket latency, and active incidents.
- `GET /public/faqs`: Multilingual FAQ knowledge base entries.

### 2. Cities & Geographic Coverage
- `GET /public/cities`: List all operational cities across Myanmar.
- `GET /public/cities/:slug`: Detailed township zones, active driver counts, and popular landmarks for a specific city.

### 3. Fares & Ride Tiers
- `GET /public/ride-types`: Available vehicle tiers (`standard`, `comfort`, `premium`, `xl`, `ev`).
- `GET /public/fares`: Municipal tariff rules and per-km/per-min rates.
- `POST /public/fares/estimate`: Dynamic fare calculation request based on distance and duration.

### 4. Bookings & Real-Time Quotes
- `POST /public/bookings/quote`: Generate guaranteed upfront route quote with polyline distance, ETA, and ride options.
- `POST /public/bookings`: Submit confirmed ride booking with quote ID, passenger phone, and payment method.
- `GET /public/bookings/:id`: Retrieve live booking state and assigned driver telemetry.

### 5. Location Search & Autocomplete
- `GET /public/locations/search?q=`: Debounced geospatial address search.

### 6. Driver Recruitment & KYC
- `POST /public/driver-applications`: Submit online driver candidate profile with NRC and driving licence details.
- `GET /public/driver-applications/:ref`: Query candidate review state.

### 7. Support & Corporate Leads
- `POST /public/support/tickets`: Create 24/7 customer support ticket.
- `POST /public/business/inquiries`: Submit enterprise corporate mobility lead.

---

## 🛡️ Error Handling Contract

All error responses from the Go API follow the standardized RFC 7807 schema:

```json
{
  "status": "error",
  "code": "EXPIRED_QUOTE",
  "message": "The ride fare quote has expired. Please calculate a refreshed quote.",
  "details": [
    {
      "field": "quote_id",
      "code": "QUOTE_INVALID",
      "message": "Quote expired 900 seconds after creation"
    }
  ],
  "timestamp": "2026-08-24T01:30:00Z",
  "request_id": "req-984210"
}
```
