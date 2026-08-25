# LaBar Admin Panel

LaBar Admin Panel is the secure web workspace for administration, verification, dispatch, safety, finance, support, and real-time operations. It consumes the same authoritative Go API as the Passenger, Driver, DriverReg, and public web clients.

This directory defines the production replacement for `apps/admin-portal`. The existing portal is a visual prototype containing hardcoded users, locations, driver cases, counts, and simulated actions. It must not be deployed or copied into runtime production code.

## Product boundary

The panel is for authorized LaBar staff only. It does not register applicants as the currently signed-in admin, does not invent live fleet data, and does not make client-side approval decisions.

- DriverReg marketers and registration-center staff create applicant cases through scoped staff-case APIs.
- Driver verifiers independently review submitted cases in this panel.
- Dispatchers monitor and manage active operations within assigned cities.
- Safety, support, finance, content, and analytics users see only their permitted modules.
- The Go API is authoritative for identity, permissions, ride state, driver state, application state, money, and location visibility.

## Recommended stack

- React and TypeScript strict mode
- Vite
- React Router
- TanStack Query for server state
- React Hook Form and Zod
- MapLibre GL JS for the operations map
- WebSocket for live operational deltas
- Server-Sent Events only for one-way streams where preferable
- `react-aria` patterns or equivalent accessible primitives
- `date-fns`, `lucide-react`, `clsx`, and `tailwind-merge`
- Tailwind CSS using the shared LaBar design tokens

Runtime mock APIs, hardcoded map markers, fake metrics, optimistic approval, fake exports, and simulated notifications are prohibited. Test fixtures belong only in tests.

## Staff identity and permissions

Use a single staff identity with short-lived access, rotated refresh sessions, optional MFA, device/session visibility, branch assignment, and granular permission claims. The UI may hide unauthorized actions, but the API must enforce every permission.

| Staff role | Typical scope |
|---|---|
| `super_admin` | Platform-wide configuration and emergency access |
| `admin` | Broad administration excluding protected break-glass actions |
| `operations_manager` | City operations, dispatch oversight, and live map |
| `dispatcher` | Active rides and assigned-city live map |
| `driver_verifier` | Submitted driver applications and evidence review |
| `support_agent` | Support cases and permitted ride context |
| `finance` | Payments, refunds, wallet adjustments, and reconciliation |
| `content_manager` | Public content and approved campaigns |
| `analyst` | Aggregated reporting without unnecessary precise location or PII |
| `marketer` | DriverReg case creation for an assigned registration center |
| `driver_registrar` | DriverReg applicant capture and correction for assigned cases |
| `registration_manager` | Registration-center assignment and workload oversight |

Driver registration requires `driver.registration.create` or `driver.registration.edit`. The API derives the staff actor from the authenticated session and creates a separate applicant identity. Marketers and registrars cannot approve applications. A verifier who created, edited, or assisted a case cannot approve that case. Every sensitive read and mutation is audited.

## Main routes

```text
/login
/mfa
/dashboard
/operations/map
/operations/rides
/operations/rides/:rideId
/drivers
/drivers/:driverId
/driver-applications
/driver-applications/:applicationId
/registration-centers
/staff
/roles
/safety
/safety/:eventId
/support
/support/:ticketId
/payments
/wallet
/pricing
/promotions
/cities
/service-zones
/content
/notifications
/audit
/system/health
```

Navigation is permission-derived. A copied URL must still receive a server-side `403` when the user lacks access.

## Real-time operations map

The operations map is a live decision surface, not a decorative fleet animation. It shows only operationally necessary entities authorized for the current user, city, branch, and viewport.

### Map layers

| Layer | Contents | Visibility rule |
|---|---|---|
| Available drivers | Fresh-heartbeat drivers eligible for dispatch | Operations users in assigned cities |
| Busy drivers | Offered, en route, waiting, and on-trip drivers | Operations users with live location permission |
| Searching rides | Pickup, age, service type, and search radius | Dispatch roles only |
| Active trips | State, route progress, staleness, and ETA | Relevant operations and safety roles |
| Scheduled rides | Upcoming dispatch window and pickup area | Assigned-city dispatch roles |
| Deliveries | Assigned and in-transit delivery state | Delivery operations permission |
| Safety events | SOS, route anomaly, unexpected stop, and GPS loss | Safety permission; high-priority events remain distinct |
| Service zones | City, ride, airport, delivery, and restricted polygons | Operations and configuration roles |
| Demand density | Aggregated recent request density | No passenger-identifying points |

Offline drivers are excluded from the live map. The panel must not provide unrestricted background tracking, unrelated historical trails, or precise passenger locations to staff without a legitimate operational purpose.

### Map behavior

- Query an initial viewport-scoped snapshot, then apply ordered WebSocket deltas.
- Use event IDs, sequence numbers, server timestamps, heartbeats, and stale-state indicators.
- On reconnect or sequence gap, discard uncertain local state and fetch a fresh snapshot.
- Cluster dense markers, use GPU-backed GeoJSON sources, and expand detail progressively by zoom.
- Throttle visual location updates without changing authoritative timestamps.
- Keep selected ride/driver details in a side panel so the map remains visible.
- Support filters for city, service, ride state, driver state, incident severity, and freshness.
- Provide a visible legend and use shape plus text—not color alone—for status.
- Acknowledge and resolve safety events only through audited API actions.
- Never interpolate a fake position when the latest GPS point is stale; show the last update and uncertainty.

### Required map API contracts

```http
GET /api/v1/operations/map/snapshot?bbox={west,south,east,north}&zoom={zoom}&city_id={id}
GET /api/v1/operations/rides/{ride_id}
GET /api/v1/operations/drivers/{driver_id}
GET /api/v1/operations/safety-events
GET /api/v1/operations/service-zones?city_id={id}
WS  /api/v1/realtime
```

The authenticated WebSocket subscribes to an operations scope returned by the server. Expected events include `driver.presence`, `driver.location`, `ride.created`, `ride.state_changed`, `ride.location`, `dispatch.search_changed`, `safety.alert`, `safety.updated`, and `service_zone.updated`. The server filters events before delivery; client-side filtering is not a security boundary.

The current Go backend does not yet expose the complete viewport snapshot or operations live-map stream. The map must remain in an explicit unavailable/error state until those real contracts exist. It must never fall back to static Yangon markers.

## Dashboard and monitoring

Dashboard cards load from `/api/v1/admin/dashboard` and show source time, freshness, and failure state. Recommended operational monitoring includes:

- Active, searching, completed, and cancelled rides
- Online, available, offered, and on-trip drivers
- Dispatch time, offer acceptance, and no-driver-found rate
- Open safety events by severity
- Open support tickets by priority and age
- Pending driver applications and correction workload
- Payment totals and failed payment attempts
- API, PostgreSQL, Redis, worker, WebSocket, push, maps, storage, and payment-provider health

No failed API request may be replaced with a plausible number. Partial dependency failures are shown independently.

## Driver application review

The review workspace shows the applicant snapshot, step completion, document status, OCR/liveness provider result, correction history, and audit context returned by the API. Private object URLs are never exposed directly.

Allowed actions are server-derived:

- Assign reviewer
- Begin review
- Request named documents or step corrections
- Record verification result
- Approve with reason
- Reject with respectful backend-visible reason
- Add an internal note

Approval and rejection require a fresh authorization check, deliberate confirmation, idempotency key, request ID, and audit record. The UI must not claim success before the API confirms the new state.

## Proposed project structure

```text
apps/admin-panel/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── design-system/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── operations-map/
│   │   ├── rides/
│   │   ├── drivers/
│   │   ├── driver-applications/
│   │   ├── registration-centers/
│   │   ├── safety/
│   │   ├── support/
│   │   ├── finance/
│   │   ├── pricing/
│   │   ├── content/
│   │   ├── staff/
│   │   ├── audit/
│   │   └── system-health/
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── realtime/
│   │   ├── maps/
│   │   ├── security/
│   │   └── telemetry/
│   ├── routes/
│   └── types/
├── tests/
├── docs/
├── .env.example
├── package.json
└── README.md
```

## Environment

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_REALTIME_URL=ws://localhost:8080/api/v1/realtime
VITE_APP_ENV=local
VITE_MAP_STYLE_URL=
VITE_DEFAULT_CITY_SLUG=yangon
```

Production uses TLS endpoints such as `https://api.labar.com.mm/api/v1` and `wss://api.labar.com.mm/api/v1/realtime`. Map-provider secrets and private service credentials remain on the server. The browser receives only public style configuration intended for that environment.

## Security and privacy

- TLS in production and strict CORS allow-list
- HttpOnly secure session cookie where the deployment model supports it; otherwise short-lived token held outside persistent browser storage
- Rotated refresh sessions, inactivity timeout, remote revoke, and re-authentication for protected actions
- MFA for privileged roles and configurable step-up authorization
- Server-enforced RBAC and city/branch scope
- Content Security Policy, clickjacking protection, safe headers, and dependency integrity controls
- PII redaction in logs, analytics, errors, and browser telemetry
- No NRC, licence, payout, phone, or address values in URLs
- Purpose-limited location visibility and auditable sensitive reads
- Automatic screen lock after inactivity on sensitive pages
- CSV/PDF exports generated by the backend with permission checks and audit records
- No emoji as functional status icons; use accessible SVG icons and text labels

## Responsive and accessible UX

The primary target is desktop operations at 1280–1920 px, with complete tablet support down to 768 px. Narrow mobile layouts may provide incident acknowledgement and read-only monitoring, but high-risk bulk or map actions can require a larger viewport.

Target WCAG 2.2 AA with keyboard navigation, visible focus, skip links, semantic tables, 44 px controls, screen-reader announcements for live updates, reduced motion, high contrast, and non-color status cues. Large datasets use virtualized lists without breaking keyboard or assistive-technology access.

## Local development

After the implementation is scaffolded:

```bash
cd codebase/frontend/apps/admin-panel
cp .env.example .env.local
npm install
npm run dev
```

The Go API runs at `http://localhost:8080`. Local data must come from a real local database and approved development seed command. Do not add browser-side fixtures to make the map or dashboard appear populated.

## Delivery order

1. Staff authentication, session restore, MFA, and permission routing
2. Shared typed API client, error model, request IDs, and audit-safe telemetry
3. Dashboard using real admin metrics
4. Viewport snapshot and reconnect-safe operations WebSocket
5. Live map layers, filters, detail panels, staleness, and incident handling
6. Ride and driver detail workflows
7. Independent driver-application review and conflict-of-interest enforcement
8. Safety, support, finance, pricing, content, staff, and audit modules
9. Responsive, accessibility, security, unit, integration, and end-to-end verification
10. Production build, deployment configuration, observability, and runbooks

## Definition of done

- Every operational value is sourced from the Go API or authenticated realtime stream.
- Staff roles and location visibility are enforced server-side.
- Driver registration preserves separate actor and applicant identities.
- A case creator/editor cannot approve the same applicant.
- WebSocket reconnect, sequence gaps, stale GPS, and partial outages are visible and safe.
- The map scales to thousands of active entities using viewport queries and clustering.
- Sensitive reads and all mutations produce audit events.
- Loading, empty, unavailable, forbidden, stale, and error states are complete.
- TypeScript, lint, unit, integration, end-to-end, and production build checks pass.
- The legacy mock admin portal is excluded from production deployment.
