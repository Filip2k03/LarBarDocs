# Getting Started

Welcome to the **LaBar Next-Generation Taxi Platform** technical documentation portal. This system is an enterprise-grade ride-hailing and real-time safety ecosystem built from the ground up to solve critical urban transportation challenges with **Clean Architecture in Go (Golang)**, **Native iOS (SwiftUI)**, **Native Android (Jetpack Compose)**, and an **On-Demand Guardian Safety Plugin Module**.

---

## Key Architecture Pillars

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 HIGH-CONCURRENCY ARCHITECTURE                                    │
│                                                                                                  │
│   Native Mobile (iOS & Android)  ◄─── WSS / HTTPS ───►  Go API Gateway (TLS 1.3 & Rate Limit)    │
│                 ▲                                                     │                          │
│                 │ (Dynamic Module)                                    ▼                          │
│   Guardian Plugin Shield (~3.8MB) ◄─────────────────────  Go Microservices (Clean Arch)          │
│                                                                       │                          │
│   In-Car CCTV & Telemetry Logger ──────────────────────►  Redis 7 Cluster + PostGIS 16           │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Dual-Shield Safety Ecosystem**:
   - **Passenger Guardian Mode**: An on-demand downloadable plugin package that streams high-accuracy live GPS telemetry to family members and sounds high-priority alarms if the vehicle veers off-route ($d_{xt} > 300\text{m}$).
   - **Driver Protecting Mode**: Hardware-integrated in-car CCTV continuous video recording, real-time telemetry logging, and SHA-256 cloud archiving.
2. **15-Second Cascading Dispatch**: High-speed spatial indexing via Redis 7 `GEORADIUS` with ranked offers that automatically cascade to the next nearest driver upon rejection or timeout.
3. **Hybrid Financial Engine**: Cash payments with driver receipt confirmation and Cashless e-wallets (KBZPay, AYAPay, WavePay) using OS deep-linking and SHA-256 HMAC webhook verification.
4. **Red & Gold Design System**: High-contrast, accessibility-focused UI design language with 100-900 color scales, dynamic button hover states, and smooth physics-based animations.
5. **Authoritative Fare Engine**: Integer-MMK calculations shared by the Go backend and Passenger frontend, including the 1,500 MMK service fee, 0.1 km distance steps, cash rounding, and LaBar promo credit.
6. **Separated Identity Operations**: DriverReg captures KYC evidence, Admin Control reviews it, and the Driver App activates only after approval.

---

## Repository & Directory Structure

```text
.
├── ARCHITECTURE_AND_SYSTEM_DESIGN.md    # Master Architecture Specification
├── README.md                            # High-level Platform Index
├── taxi_master_architecture.drawio      # 11-Tab Interactive Draw.io Master File
├── diagrams/
│   └── drawio/                          # 11 Standalone UML 2.5 Draw.io Files
├── design-system/
│   └── figma_tokens.json                # Figma Tokens Studio JSON Definitions
├── .vitepress/                          # Portal theme and navigation
├── guide/                               # Setup, API, backend plan, and stack
├── architecture/                        # UML, database, maps, and clean architecture
├── features/                            # Fare, registration, safety, dispatch, and payments
├── design/                              # Product pages, design system, and wireframes
├── devops/                              # Deployment, topology, costs, and operations
├── codebase/backend/                    # Go API, fare engine, tests, and agent guidance
├── codebase/frontend/                   # Passenger, Driver, Guardian, DriverReg, and Admin
├── public/icons/                        # Original LaBar SVG icon family
└── scripts/
    ├── generate_master_drawio.py        # Automated UML Draw.io Generator
    └── generate_diagram_svgs.py         # Automated SVG Vector Diagram Generator
```

---

## Running the Documentation Portal Locally

You can launch this documentation web portal on your machine:

```bash
# 1. Navigate to the repository root
cd Labar

# 2. Install dependencies (if not already installed)
npm install

# 3. Start local hot-reload dev server
npm run dev

# 4. Build for production static deployment
npm run build
```
