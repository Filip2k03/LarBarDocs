# 🚖 LaBar Public Web Portal

A complete, production-ready public website for **LaBar**, Myanmar's premium taxi, ride-hailing, delivery, and mobility platform. Built with **Astro.js**, **TypeScript**, **Tailwind CSS**, and **React Islands**.

---

## 🌟 Tech Stack

- **Framework**: [Astro 5.x](https://astro.build/) (Static Site Generation + React Islands)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with custom Red & Gold LaBar brand tokens
- **Icons**: Lucide React
- **Validation**: Zod
- **Backend API**: Golang 1.22 REST & WebSocket Dispatch Service

---

## 🚀 Getting Started Locally

### 1. Install Dependencies
```bash
cd labar-public-web
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Ensure `PUBLIC_API_BASE_URL` points to your active Go backend:
```env
PUBLIC_SITE_URL=http://localhost:4321
PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
PUBLIC_APP_ENV=local
PUBLIC_DEFAULT_LOCALE=en
PUBLIC_SUPPORTED_LOCALES=en,my
```

### 3. Start Development Server
```bash
npm run dev
# Open http://localhost:4321 in your browser
```

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## 📁 Routes Overview

- `/` — Homepage with interactive hero booking card, services, Guardian safety, and FAQs.
- `/ride` — Complete step-by-step route planning, upfront guaranteed fares, and live dispatch telemetry.
- `/drive` — Driver partner recruitment, earnings calculator, requirements, and online application.
- `/delivery` — Express citywide parcel delivery booking.
- `/airport` — Airport transfer reservations with fixed fares for Yangon RGN & Mandalay MDL.
- `/schedule` — Advance ride reservations up to 7 days ahead.
- `/business` — Enterprise corporate travel management & centralized monthly billing.
- `/safety` — LaBar Guardian dual-shield safety architecture (1km SOS mesh & route monitoring).
- `/promotions` — Active promotional codes & seasonal discount coupons.
- `/cities` & `/cities/[slug]` — Coverage across 25+ cities in Myanmar.
- `/fares` — Transparent tariff schedule & live fare estimator.
- `/about` — Mission, Myanmar leadership, and engineering standards.
- `/careers` — Open job vacancies in engineering and operations.
- `/download` — iOS & Android mobile application downloads.
- `/help` & `/help/[slug]` — Searchable 24/7 knowledge base and support ticket submission.
- `/contact` — Headquarters address, regional branches, and emergency hotline.
- `/status` — Live platform health, component latencies, and uptime telemetry.
- `/legal/privacy`, `/legal/terms`, `/legal/cookies` — Regulatory and data protection policies.
