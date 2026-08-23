# Next-Generation Taxi Application Platform

An enterprise-grade, high-concurrency Taxi Booking, Real-Time Safety, and Financial Settlement platform built with **Go (Golang)** backend architecture, **Native Mobile (iOS SwiftUI & Android Jetpack Compose)** clients, **PostGIS**, **Redis Cluster**, and **Dual-Shield Safety Protection**.

---

## Documentation & Architecture Deliverables

All specifications and system design diagrams have been generated conforming strictly to **UML 2.5** and modern system engineering standards:

1.  **Master Architecture Document**: [`ARCHITECTURE_AND_SYSTEM_DESIGN.md`](file:///Users/stephanfilip/Yamato_project/Labar/ARCHITECTURE_AND_SYSTEM_DESIGN.md)
   - Contains complete technical specifications, domain models, Golang structures, Native Mobile patterns, algorithms, and database designs.

2.  **Interactive Documentation Web Portal (VitePress)**:
   - Run locally: `npm run dev`
   - Production Build: `npm run build`
   - Includes full system guide, UML diagrams, Red & Gold design system, Driver SOS mesh architecture, and VPS deployment cost calculator.
   - Uses the original LaBar SVG icon family from `public/icons/` and an emoji-free editorial interface.

3.  **Red & Gold Design System & Figma Tokens**:
   - **Figma Tokens Studio JSON**: [`design-system/figma_tokens.json`](file:///Users/stephanfilip/Yamato_project/Labar/design-system/figma_tokens.json)
   - Imperial Crimson Red (`#E5252A`) and Royal Gold (`#F59E0B`) 100-900 color scales, typography hierarchy, button states, and CSS transitions.
   - **Figma prototype plan**: [`design/figma-prototype-plan.md`](design/figma-prototype-plan.md)
   - **Figma-importable v2 canvas**: [`public/wireframes/labar_master_figma_canvas_v2.svg`](public/wireframes/labar_master_figma_canvas_v2.svg)
   - **DriverReg prototype**: [`public/prototypes/driverreg-app.html`](/prototypes/driverreg-app.html)
   - **Admin Control Center prototype**: [`public/prototypes/admin-control-center.html`](/prototypes/admin-control-center.html)
   - **Passenger v2 lifecycle prototype**: [`public/prototypes/passenger-v2.html`](/prototypes/passenger-v2.html)

4.  **Interactive Draw.io (`.drawio`) Architecture Files**:
   - **[`taxi_master_architecture.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/taxi_master_architecture.drawio)**: **Master multi-page Draw.io file with 13 interactive tabs (including Hetzner 3-Server & Driver SOS)**!
   - **[`taxi_master_all_in_one.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/taxi_master_all_in_one.drawio)**: **Diagrams folder multi-page file (13 tabs)**.
   - [`01_use_case_diagram.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/01_use_case_diagram.drawio): UML 2.5 Use Case model with actors, boundary & sub-packages.
   - [`02_system_process_flowchart.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/02_system_process_flowchart.drawio): 5-column cross-functional process flowchart.
   - [`03_database_erd_schema.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/03_database_erd_schema.drawio): Relational database schema with 18 connected tables and primary/foreign keys.
   - [`04_component_architecture.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/04_component_architecture.drawio): 5-tier component & microservices architecture.
   - [`05_class_domain_architecture.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/05_class_domain_architecture.drawio): UML 2.5 domain classes, Go interfaces & ViewModels.
   - [`06_sequence_dispatch_chat.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/06_sequence_dispatch_chat.drawio): UML 2.5 Sequence: Booking, cascading dispatch & chat.
   - [`07_sequence_safety_guardian_cctv.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/07_sequence_safety_guardian_cctv.drawio): UML 2.5 Sequence: Guardian live tracking & CCTV protecting mode.
   - [`08_sequence_payment_and_payout.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/08_sequence_payment_and_payout.drawio): UML 2.5 Sequence: E-wallet deep-linking, webhook & driver payout.
   - [`09_state_machine_ride_lifecycle.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/09_state_machine_ride_lifecycle.drawio): UML 2.5 State Machine: Ride lifecycle.
   - [`10_state_machine_driver_status.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/10_state_machine_driver_status.drawio): UML 2.5 State Machine: Driver status & shift lifecycle.
   - **[`11_guardian_plugin_module_architecture.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/11_guardian_plugin_module_architecture.drawio)**: **Passenger Guardian On-Demand Dynamic Plugin Package Architecture**.
   - **[`12_driver_sos_mesh_guardian_architecture.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/12_driver_sos_mesh_guardian_architecture.drawio)**: **Driver SOS 1km to 3km Mesh & Driver Family Guardian Architecture**.
   - **[`13_hetzner_3server_livemap_architecture.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/13_hetzner_3server_livemap_architecture.drawio)**: **Hetzner 3-Server Production & Live Map Topology**.

---

## Key System Features

- **Myanmar Localization & Payments**: Pyidaungsu Unicode typography, KBZPay, WavePay, AYAPay deep-linking, NRC/Ka-Kha-Na driver KYC verification, and Yangon municipal motorbike restriction routing.
- **Hetzner 3-Server & Live Map Engine (~$62.40/mo)**: Dedicated separation of Server 1 (Go API + Caddy), Server 2 (Self-hosted OSRM Myanmar + TileServer GL + Redis), and Server 3 (PostgreSQL 16 + PostGIS + MinIO S3 Vault).
- **Driver Emergency SOS & Mesh Assistance**: Instant panic trigger broadcasts to fellow drivers within **1.0 km** (Tier 1), escalating to **3.0 km** (Tier 2) and rapid police response (ERT).
- **Driver Family Guardian Plugin**: On-demand module enabling spouses/parents to detect live GPS, shift status, and receive DND-override siren alarms on SOS.
- **Passenger Guardian Plugin Module**: Lightweight core app (~18MB) with dynamic download of Guardian Safety Package (~3.8MB) via Play Feature Delivery.
- **Multi-Stop Route & Dynamic Metering**: Support for multiple waypoints with route optimization and dynamic fare calculations in Myanmar Kyat (MMK).
- **Intelligent Dispatch Engine**: Geo-radius searching in Redis with automatic 15-second driver cascading upon rejection/timeout.
- **Driver Protecting Mode**: Hardware-integrated in-car CCTV video recording, GPS telemetry logging, and SHA-256 cloud archiving.
- **Driver Financial Settlement**: Daily sales summary, real-time wallet ledger, and on-demand fund transfer/payout via KBZPay/WavePay.
- **DriverReg KYC**: Staff-authenticated NRC/licence scanning, confidence-aware OCR autofill, selfie liveness/face comparison, vehicle compliance, independent review, and activation handoff.
- **Admin Control Center**: Driver verification, least-privilege staff provisioning, CEO/CTO/PSO executive-superadmin parity, break-glass `GOD_ADMIN`, and immutable audit records.
- **Discreet Safety Drawer**: Passenger and driver SOS controls stay visually collapsed during normal use but remain accessible in one deliberate action, with covert triggering and persistent active-incident state.
- **Versioned Fare Engine**: 5,000 MMK transport minimum through 2 km, 150 MMK per additional 0.1 km, one 1,500 MMK service fee, cash rounding to 500 MMK, and promo credit at 1 credit = 10 MMK.
- **Go Backend Foundation**: Health probes, strict JSON APIs, authoritative fare quotes, Passenger information architecture, tests, static analysis, and backend contributor instructions.

## Current implementation entry points

- Go service: [`codebase/backend/README.md`](codebase/backend/README.md)
- Backend roadmap: [`guide/backend-implementation-plan.md`](guide/backend-implementation-plan.md)
- Passenger page specification: [`design/passenger-product-pages.md`](design/passenger-product-pages.md)
- Fare and credit policy: [`features/fare-and-labar-credit.md`](features/fare-and-labar-credit.md)
- API reference: [`guide/api-reference.md`](guide/api-reference.md)
