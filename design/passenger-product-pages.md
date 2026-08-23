# Passenger Product Pages

The Passenger application has twenty-one connected pages. The interactive reference is available at [Passenger v2](/prototypes/passenger-v2.html). Its visual source of truth is the exported [`passenger.jpg`](../design-system/passenger.jpg) board.

## Core lifecycle

| Page | Purpose | Required states |
|---|---|---|
| Splash | Secure bootstrap, language, session restore | First use, returning, offline, upgrade required |
| Home | Destination entry and shortcuts | Location ready/denied, active ride, scheduled ride |
| Pickup / Map | Safe entrance and driver note | GPS, map pin, saved place, low accuracy |
| Route & Fees | Route, stops, distance, fare policy | Loading, alternative route, no route, quote expired |
| Choose Ride | Vehicle tier, capacity, ETA | Available, unavailable, accessibility requested |
| Payment | Cash, e-wallet, credit, payable total | Exact digital, rounded cash, insufficient credit, provider unavailable |
| Finding Driver | Cascading dispatch | Searching, offer pending, expanded radius, no drivers, cancelled |
| Driver On The Way | ETA and pickup readiness | Normal, delayed, changed pickup, cancellation warning |
| Driver Details | Verified identity and vehicle | Verified, licence warning, vehicle mismatch report |
| On Trip | Route, fare progress, Guardian, Safety Drawer | Normal, route change, deviation, safety incident, reconnecting |
| Trip Complete | Final receipt and rating | Cash due/collected, digital pending/paid, adjusted fare, support |

## Account and support

| Page | Purpose |
|---|---|
| My Trips | Upcoming, active, completed, cancelled, receipts, and issue links |
| Profile | Identity, contacts, emergency contacts, guardians, privacy, and security |
| LaBar Credit | Promo balance, 1 credit = 10 MMK, grants, use, reversal, and terms |
| Guardian Plugin | Install, consent, family pairing, permissions, and protection state |
| Saved Places | Named pins, safe entrances, access instructions, and driver notes |
| Notifications | Trip, payment, promotion, and system events with unread state |
| Support | Safety, trip, payment, lost item, accessibility, and case tracking |
| Schedule Ride | Future date/time, route, reminder, payment, edit, and cancellation |
| Promotions | Eligibility, expiry, maximum discount, apply, and share actions |
| Settings | Language, notifications, accessibility, privacy, devices, and sign-out |

## Reference implementation plan

### Visual contract

| Reference pattern | Implementation rule |
|---|---|
| Tall white mobile canvas | 375 by 812 reference viewport with compact safe areas |
| LaBar red | Primary actions, selected tabs, route line, notification state |
| Confirmation yellow | Ride selection and payment confirmation actions |
| Success green | Paid, completed, verified, and credited state only |
| Map-first layouts | Pickup, route estimate, driver arrival, and active trip start with the map |
| Compact white cards | 8 to 12 px radii, fine gray borders, restrained shadow |
| Four-item navigation | Home, Trips, Wallet, and Me remain stable across account and ride screens |

### Delivery sequence

1. Lock tokens, viewport, navigation, header, buttons, cards, form fields, tabs, map treatment, and fare rows.
2. Match booking screens from Splash through Payment.
3. Match dispatch and trip screens from Finding Driver through Trip Complete.
4. Match account, Wallet, Profile, Guardian, Saved Places, Notifications, Support, Schedule Ride, Promotions, and Settings.
5. Bind all totals to the shared calculator for prototype previews and server quotes in production.
6. Add empty, loading, denied, offline, error, expired-quote, and accessibility states.
7. Verify on small Android, standard Android, and iPhone viewport classes before Figma handoff.

The current implementation completes steps 1 through 5 at prototype depth. Production map SDKs, authentication, providers, persistence, and network state remain later integration work.

## Receipt content

The receipt must show the ride ID, quote ID, fare policy version, pickup, destination, distance, duration, transport fare, extra distance, LaBar service fee, promo credits, cash rounding where applicable, final payable, payment method, payment status, driver and vehicle, creation time, and support entry point.

## Accessibility and safety

- Use minimum 44 by 44 touch targets and logical screen-reader order.
- Present fare rows as text, not color alone.
- Keep the Safety Drawer collapsed during normal travel but available in one deliberate action.
- Once an incident is active, show a persistent state and responder progress.
- Support Myanmar and English without truncating identity, address, or currency content.

## Source files

- Interactive reference: `public/prototypes/passenger-v2.html`
- Reference-matching stylesheet: `public/prototypes/passenger-v2.css`
- Exported reference board: `design-system/passenger.jpg`
- React Native screen registry: `codebase/frontend/apps/passenger/src/navigation.ts`
- React Native shell: `codebase/frontend/apps/passenger/src/PassengerApp.tsx`
- Fare reference: `codebase/frontend/apps/passenger/src/fare.ts`
- Custom icon family: `public/icons/*.svg`
