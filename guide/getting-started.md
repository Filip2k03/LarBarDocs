# 🚀 Getting Started

Welcome to the **LaBar Next-Generation Taxi Platform** technical documentation portal. This system is an enterprise-grade ride-hailing and real-time safety ecosystem built from the ground up to solve critical urban transportation challenges with **Clean Architecture in Go (Golang)**, **Native iOS (SwiftUI)**, **Native Android (Jetpack Compose)**, and an **On-Demand Guardian Safety Plugin Module**.

---

## 🌟 Key Architecture Pillars

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

---

## 🛠️ Repository & Directory Structure

```text
.
├── ARCHITECTURE_AND_SYSTEM_DESIGN.md    # Master Architecture Specification
├── README.md                            # High-level Platform Index
├── taxi_master_architecture.drawio      # 11-Tab Interactive Draw.io Master File
├── diagrams/
│   └── drawio/                          # 11 Standalone UML 2.5 Draw.io Files
├── design-system/
│   └── figma_tokens.json                # Figma Tokens Studio JSON Definitions
├── docs/                                # VitePress Documentation Web Portal
│   ├── .vitepress/                      # Theme, Config & Navigation
│   ├── guide/                           # Getting Started & Stack Guides
│   ├── architecture/                    # UML Models, Database & Clean Arch
│   ├── features/                        # Guardian Plugin, CCTV, Dispatch & Billing
│   ├── design/                          # Red & Gold Design System, Wireframes
│   └── devops/                          # VPS Topology, Provider Benchmark & Costs
└── scripts/
    ├── generate_master_drawio.py        # Automated UML Draw.io Generator
    └── generate_diagram_svgs.py         # Automated SVG Vector Diagram Generator
```

---

## ⚡ Running the Documentation Portal Locally

You can launch this documentation web portal on your machine:

```bash
# 1. Navigate to the docs folder
cd docs

# 2. Install dependencies (if not already installed)
npm install

# 3. Start local hot-reload dev server
npm run docs:dev

# 4. Build for production static deployment
npm run docs:build
```
