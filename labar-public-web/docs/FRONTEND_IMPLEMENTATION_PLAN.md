# LaBar Public Website Implementation Plan

## Product objective

The public website is the trusted entry point into LaBar. It explains the service, reads operational information from the Go API, and hands authenticated ride activity to the Passenger app. It must never invent fares, availability, promotions, service status, booking confirmations, or support outcomes.

## Architecture rules

- Astro owns layouts, content-first pages, SEO, and static delivery.
- React islands are limited to workflows that need client state: authentication, booking, search, forms, and live status.
- `src/lib/api` owns transport behavior, request timeouts, authentication headers, and normalized errors.
- `src/services` owns endpoint-specific payload mapping.
- `src/types` owns API contracts. Components do not redefine transport types.
- Shared product configuration belongs in `src/config`; page components must not duplicate navigation or workflow rules.
- PostgreSQL-backed Go APIs remain authoritative. Client state is only a draft or display cache.

## Core user journeys

### Passenger booking

1. Authenticate by phone and OTP.
2. Select API-resolved pickup and destination locations.
3. Request an expiring server quote.
4. Select one of the ride types returned by the API.
5. Confirm with an idempotency key.
6. Show only the booking returned by the API.
7. Hand off active dispatch and tracking to the Passenger app.

The browser may preserve an unfinished route draft, but never a successful booking, OTP, quote validity decision, or payment result.

### Driver acquisition

The website explains requirements and sends the completed application to the Go API. Driver verification, document review, approval, and account creation remain in Driver Registration and Admin clients.

### Help and operations

Help, promotions, cities, fares, and service status render API data with explicit loading, empty, unavailable, and retry states. Failed API data is never replaced by marketing fixtures.

## Responsive system

- 360–430 px: compact header, full-width drawer, two-column navigation where labels fit, safe-area-aware bottom actions.
- 768–1024 px: mobile drawer remains active to prevent crowded desktop navigation.
- 1280 px and above: desktop navigation is enabled.
- All interactive controls target at least 44 px.
- Drawers trap focus, close with Escape and overlay interaction, restore focus, and lock body scrolling.
- Reduced-motion preferences disable decorative movement.

## Delivery phases

### Phase 1 — foundation

- Centralize navigation and active-route behavior.
- Normalize API errors and authenticated requests.
- Establish real-data empty and failure states.
- Remove WebGL/3D dependencies and use lightweight taxi-product visuals.

### Phase 2 — conversion workflows

- Make booking stages explicit and guarded.
- Add safe route-draft persistence.
- Add quote-expiry handling and fresh-quote recovery.
- Improve OTP input, validation, cooldown, and session recovery.

### Phase 3 — content and localization

- Complete English and Myanmar content parity.
- Move repeated marketing sections to typed content models.
- Generate dynamic city and help pages from production API data.

### Phase 4 — quality gates

- Add component tests for state transitions and validation.
- Add end-to-end checks for navigation, API failure states, and booking handoff.
- Run accessibility checks at 360, 390, 768, 1024, 1280, and 1440 px.
- Track Lighthouse budgets and prevent accidental full-site hydration.

## Definition of done

- `npm run check` succeeds without errors.
- `npm run build` succeeds.
- All operational URLs are centralized.
- No runtime mock operational data exists.
- Keyboard and mobile navigation work without horizontal overflow.
- Booking cannot skip stages, use an expired quote, or show a success that the Go API did not return.

