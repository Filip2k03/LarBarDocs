# 📐 UML 2.5 & Draw.io Visual Architecture Models

Every diagram in the Yamato Taxi Engine is rendered in high-resolution vector format directly below. You can also edit and export the native Draw.io files.

---

## 🌟 Interactive Master File
- 📂 **Consolidated 11-Tab Master Draw.io File**: [`taxi_master_architecture.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/taxi_master_architecture.drawio)
- 🖥️ **Online Web Viewer**: Open [app.diagrams.net](https://app.diagrams.net) and drag-and-drop the master file.

---

## 1. UML 2.5 Use Case Model
<span class="badge-gold">Page 01</span> • 5 Actors & 26 Use Cases with Sub-package Boundaries

![01 Use Case Model](/diagrams/01_use_case_diagram.svg)

- 📥 [Download Standalone .drawio File](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/01_use_case_diagram.drawio)
- 🖼️ [View Fullscreen Vector SVG](/diagrams/01_use_case_diagram.svg)

---

## 2. 5-Swimlane End-to-End System Process Flowchart
<span class="badge-red">Page 02</span> • Cross-Functional Journey: Passenger ➔ Go Engine ➔ Driver ➔ Safety ➔ Settlement

![02 Process Flowchart](/diagrams/02_system_process_flowchart.svg)

- 📥 [Download Standalone .drawio File](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/02_system_process_flowchart.drawio)
- 🖼️ [View Fullscreen Vector SVG](/diagrams/02_system_process_flowchart.svg)

---

## 3. Relational Database Schema (PostGIS & PostgreSQL 16)
<span class="badge-gold">Page 03</span> • 16 Connected Tables with Primary/Foreign Keys and Cardinality

![03 Database ERD](/diagrams/03_database_erd_schema.svg)

- 📥 [Download Standalone .drawio File](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/03_database_erd_schema.drawio)
- 🖼️ [View Fullscreen Vector SVG](/diagrams/03_database_erd_schema.svg)

---

## 4. 5-Tier Component & Infrastructure Architecture
<span class="badge-red">Page 04</span> • Native Clients ➔ Go API Gateway ➔ Microservices ➔ Persistence ➔ External APIs

![04 Component Architecture](/diagrams/04_component_architecture.svg)

- 📥 [Download Standalone .drawio File](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/04_component_architecture.drawio)
- 🖼️ [View Fullscreen Vector SVG](/diagrams/04_component_architecture.svg)

---

## 5. Domain Structs, UseCase Interfaces & ViewModels
<span class="badge-gold">Page 05</span> • Go Clean Architecture Ports, Adapters & Mobile ViewModels

![05 Class Domain Architecture](/diagrams/05_class_domain_architecture.svg)

- 📥 [Download Standalone .drawio File](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/05_class_domain_architecture.drawio)
- 🖼️ [View Fullscreen Vector SVG](/diagrams/05_class_domain_architecture.svg)

---

## 6. Sequence: Booking, 15s Cascading Dispatch & Chat
<span class="badge-red">Page 06</span> • Multi-Stop Fare Estimation, Redis 3km Spatial Search & WebSocket Chat

![06 Sequence Dispatch Chat](/diagrams/06_sequence_dispatch_chat.svg)

- 📥 [Download Standalone .drawio File](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/06_sequence_dispatch_chat.drawio)
- 🖼️ [View Fullscreen Vector SVG](/diagrams/06_sequence_dispatch_chat.svg)

---

## 7. Sequence: Dual-Shield Safety, GPS & CCTV Vault
<span class="badge-gold">Page 07</span> • Live Family Telemetry, $d_{xt} > 300\text{m}$ Route Deviation & CCTV Chunk Archival

![07 Sequence Safety CCTV](/diagrams/07_sequence_safety_guardian_cctv.svg)

- 📥 [Download Standalone .drawio File](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/07_sequence_safety_guardian_cctv.drawio)
- 🖼️ [View Fullscreen Vector SVG](/diagrams/07_sequence_safety_guardian_cctv.svg)

---

## 8. Sequence: E-Wallet Deep-Linking & Driver Payout
<span class="badge-red">Page 08</span> • KBZPay/AYAPay Deep-Linking, SHA-256 HMAC Webhook & Instant Sales Transfer

![08 Sequence Payment Payout](/diagrams/08_sequence_payment_and_payout.svg)

- 📥 [Download Standalone .drawio File](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/08_sequence_payment_and_payout.drawio)
- 🖼️ [View Fullscreen Vector SVG](/diagrams/08_sequence_payment_and_payout.svg)

---

## 9. State Machine: Complete Ride Order Lifecycle
<span class="badge-gold">Page 09</span> • `DRAFT` ➔ `SEARCHING` ➔ `DISPATCHED` ➔ `IN_TRANSIT` ➔ `COMPLETED`

![09 State Machine Ride](/diagrams/09_state_machine_ride_lifecycle.svg)

- 📥 [Download Standalone .drawio File](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/09_state_machine_ride_lifecycle.drawio)
- 🖼️ [View Fullscreen Vector SVG](/diagrams/09_state_machine_ride_lifecycle.svg)

---

## 10. State Machine: Driver Shifts & Status Transitions
<span class="badge-red">Page 10</span> • `OFFLINE` ➔ `AVAILABLE` ➔ `BREAK_TIME` ➔ `ON_DUTY` ➔ `SALES_SUMMARY`

![10 State Machine Driver](/diagrams/10_state_machine_driver_status.svg)

- 📥 [Download Standalone .drawio File](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/10_state_machine_driver_status.drawio)
- 🖼️ [View Fullscreen Vector SVG](/diagrams/10_state_machine_driver_status.svg)

---

## 11. Guardian On-Demand Dynamic Plugin Module Architecture
<span class="badge-gold">Page 11</span> • Play Feature Delivery (~3.8MB), Base Host App Shell & Go Backend Plugin Hub

![11 Guardian Plugin Module Architecture](/diagrams/11_guardian_plugin_module_architecture.svg)

- 📥 [Download Standalone .drawio File](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/11_guardian_plugin_module_architecture.drawio)
- 🖼️ [View Fullscreen Vector SVG](/diagrams/11_guardian_plugin_module_architecture.svg)

---

## 12. Driver SOS Mesh & Family Guardian Architecture
<span class="badge-red">Page 12</span> • 1km ➔ 3km Tiered Driver Mesh Alert, Covert Panic Triggers & Family Siren HUD

![12 Driver SOS Mesh Guardian](/diagrams/12_driver_sos_mesh_guardian.svg)

- 📥 [Download Standalone .drawio File](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/12_driver_sos_mesh_guardian_architecture.drawio)
- 🖼️ [View Fullscreen Vector SVG](/diagrams/12_driver_sos_mesh_guardian.svg)

