# LaBar Passenger Application

The Passenger application contains twenty-one product surfaces covering entry, booking, dispatch, pickup, trip, receipt, account, promo credit, Guardian, notifications, promotions, support, scheduling, and settings.

The executable screen catalog is in `src/navigation.ts`. The shared frontend fare reference is in `src/fare.ts` and mirrors the authoritative Go policy. Production clients must display server quote and receipt values rather than trusting locally calculated money.

## Screen inventory

Splash, Home, Pickup / Map, Route & Fees, Choose Ride, Payment, Finding Driver, Driver On The Way, Driver Details, On Trip, Trip Complete, My Trips, Profile, LaBar Credit, Guardian Plugin, Saved Places, Notifications, Support, Schedule Ride, Promotions, and Settings.

## Visual reference

`design-system/passenger.jpg` is the visual source of truth. The implementation uses its white canvas, LaBar red primary actions, yellow confirmation actions, green success states, compact card rhythm, map-first trip screens, and four-item bottom navigation. The application uses original LaBar UI artwork and does not embed the JPG into product screens.

## Fare rules

- 5,000 MMK transport minimum includes up to 2.0 km.
- 1,500 MMK LaBar service fee is added exactly once to every route.
- Distance after 2.0 km costs 150 MMK per started 0.1 km.
- Digital payments use the exact total.
- Cash payments round upward to the next 500 MMK.
- One promo credit equals 10 MMK and discounts transport only.

Open `/prototypes/passenger-v2.html` from the documentation site for the interactive reference implementation.
