# Next-Generation Taxi Application Platform

An enterprise-grade, high-concurrency Taxi Booking, Real-Time Safety, and Financial Settlement platform built with **Go (Golang)** backend architecture, **Native Mobile (iOS SwiftUI & Android Jetpack Compose)** clients, **PostGIS**, **Redis Cluster**, and **Dual-Shield Safety Protection**.

---

## 📑 Documentation & Architecture Deliverables

All specifications and system design diagrams have been generated conforming strictly to **UML 2.5** and modern system engineering standards:

1. 📘 **Master Architecture Document**: [`ARCHITECTURE_AND_SYSTEM_DESIGN.md`](file:///Users/stephanfilip/Yamato_project/Labar/ARCHITECTURE_AND_SYSTEM_DESIGN.md)
   - Contains complete technical specifications, domain models, Golang structures, Native Mobile patterns, algorithms, and database designs.

2. 🌐 **Interactive Documentation Web Portal (`./docs` with VitePress)**:
   - Run locally: `cd docs && npm run docs:dev`
   - Production Build: `cd docs && npm run docs:build`
   - Includes full system guide, UML diagrams, Red & Gold design system, and VPS deployment cost calculator.

3. 🎨 **Red & Gold Design System & Figma Tokens**:
   - 📂 **Figma Tokens Studio JSON**: [`design-system/figma_tokens.json`](file:///Users/stephanfilip/Yamato_project/Labar/design-system/figma_tokens.json)
   - Imperial Crimson Red (`#E5252A`) and Royal Gold (`#F59E0B`) 100-900 color scales, typography hierarchy, button states, and CSS transitions.

4. 🎨 **Interactive Draw.io (`.drawio`) Architecture Files**:
   - 🌟 **[`taxi_master_architecture.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/taxi_master_architecture.drawio)**: **Master multi-page Draw.io file with 11 interactive tabs (including Guardian Plugin)**!
   - 🌟 **[`taxi_master_all_in_one.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/taxi_master_all_in_one.drawio)**: **Diagrams folder multi-page file (11 tabs)**.
   - [`01_use_case_diagram.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/01_use_case_diagram.drawio): UML 2.5 Use Case model with actors, boundary & sub-packages.
   - [`02_system_process_flowchart.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/02_system_process_flowchart.drawio): 5-column cross-functional process flowchart.
   - [`03_database_erd_schema.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/03_database_erd_schema.drawio): Relational database schema with 16 connected tables and primary/foreign keys.
   - [`04_component_architecture.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/04_component_architecture.drawio): 5-tier component & microservices architecture.
   - [`05_class_domain_architecture.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/05_class_domain_architecture.drawio): UML 2.5 domain classes, Go interfaces & ViewModels.
   - [`06_sequence_dispatch_chat.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/06_sequence_dispatch_chat.drawio): UML 2.5 Sequence: Booking, cascading dispatch & chat.
   - [`07_sequence_safety_guardian_cctv.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/07_sequence_safety_guardian_cctv.drawio): UML 2.5 Sequence: Guardian live tracking & CCTV protecting mode.
   - [`08_sequence_payment_and_payout.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/08_sequence_payment_and_payout.drawio): UML 2.5 Sequence: E-wallet deep-linking, webhook & driver payout.
   - [`09_state_machine_ride_lifecycle.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/09_state_machine_ride_lifecycle.drawio): UML 2.5 State Machine: Ride lifecycle.
   - [`10_state_machine_driver_status.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/10_state_machine_driver_status.drawio): UML 2.5 State Machine: Driver status & shift lifecycle.
   - 🛡️ **[`11_guardian_plugin_module_architecture.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/11_guardian_plugin_module_architecture.drawio)**: **Guardian On-Demand Dynamic Plugin Package & Host Architecture**.

---

## 🚀 Key System Features

- **On-Demand Guardian Plugin Module**: Lightweight core app (~18MB) with dynamic on-demand download & installation of Guardian Safety Package (~3.8MB) via Play Feature Delivery / Dynamic Frameworks.
- **Multi-Stop Route & Dynamic Metering**: Support for multiple waypoints with route optimization and dynamic fare calculations.
- **Intelligent Dispatch Engine**: Geo-radius searching in Redis with automatic 15-second driver cascading upon rejection/timeout.
- **Dual-Shield Safety Ecosystem**:
  - **Passenger Guardian Mode**: Live GPS streaming to family members and automated geofence deviation detection (>300m off-route).
  - **Driver Protecting Mode**: Hardware-integrated in-car CCTV video recording, GPS telemetry logging, and SHA-256 cloud archiving.
- **Hybrid Payment Engine**: Cash confirmation and Cashless e-wallets (KBZPay, AYAPay, WavePay) with mobile app deep-linking and HMAC webhook verification.
- **Driver Financial Settlement**: Daily sales summary, real-time wallet ledger, and on-demand fund transfer/payout.
- **VPS Deployment & Cost Strategy**: Optimized 5-tier server separation with Hetzner ($31-$122/mo), Hostinger ($26/mo), or DigitalOcean ($77-$356/mo).


