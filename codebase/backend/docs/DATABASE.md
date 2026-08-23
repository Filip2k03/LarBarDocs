# Database

Migration `000001_initial` enables `pgcrypto` and PostGIS and creates production-v1 identity, RBAC, session, device, location, driver-registration, pricing, ride, dispatch, telemetry, payment, wallet, earnings, notification, safety, support, content, delivery, business, job, audit and analytics tables.

Money is integer MMK. Coordinates use PostGIS geography. Historical rides reference immutable fare versions. Wallet and earnings records are ledgers. Production changes require a new migration; never edit an applied migration or create tables at application startup.
