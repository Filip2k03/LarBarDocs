import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LaBar Taxi Platform',
  description: 'Enterprise Taxi Dispatch, Dual-Shield Safety, Guardian Plugins & Financial Settlement System',
  lang: 'en-US',
  head: [
    ['link', { rel: 'icon', href: '/icons/labar-mark.svg' }],
    ['meta', { name: 'theme-color', content: '#E5252A' }]
  ],
  themeConfig: {
    logo: '/icons/labar-mark.svg',
    siteTitle: 'LaBar Taxi Engine',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Architecture', link: '/architecture/overview' },
      { text: 'Backend', link: '/guide/backend-implementation-plan' },
      { text: 'Passenger', link: '/design/passenger-product-pages' },
      { text: 'Prototypes', link: '/design/interactive-prototype' },
      { text: 'API', link: '/guide/api-reference' },
      { text: 'Operations', link: '/devops/production-setup' }
    ],
    sidebar: [
      {
        text: 'Overview and Setup',
        collapsed: false,
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Monorepo & Codebase Architecture', link: '/architecture/codebase-architecture' },
          { text: 'Recommended Libraries & Standards', link: '/guide/recommended-tech-stack-and-libraries' },
          { text: 'Tech Stack & Standards', link: '/guide/tech-stack' },
          { text: 'Native Mobile Architecture', link: '/guide/mobile-architecture' },
          { text: 'Go Backend Implementation Plan', link: '/guide/backend-implementation-plan' },
          { text: 'REST & WebSocket API Reference', link: '/guide/api-reference' }
        ]
      },
      {
        text: 'System Architecture',
        collapsed: false,
        items: [
          { text: 'High-Level Overview', link: '/architecture/overview' },
          { text: 'Cartography, Maps & OSRM Engine', link: '/architecture/cartography-and-live-maps' },
          { text: 'UML 2.5 & Draw.io Models', link: '/architecture/uml-diagrams' },
          { text: 'Database & PostGIS ERD', link: '/architecture/database-design' },
          { text: 'Clean Architecture (Go)', link: '/architecture/clean-architecture-go' }
        ]
      },
      {
        text: 'Core Features and Safety',
        collapsed: false,
        items: [
          { text: 'On-Demand Add-Ons and Plugin Store', link: '/features/dynamic-plugin-store' },
          { text: 'Myanmar Localization and Compliance', link: '/features/myanmar-localization-and-payments' },
          { text: 'Fare, Cash Rounding, and LaBar Credit', link: '/features/fare-and-labar-credit' },
          { text: 'DriverReg KYC & Staff Access', link: '/features/driver-registration-and-staff-access' },
          { text: 'Guardian Dynamic Plugin Module', link: '/features/guardian-plugin' },
          { text: 'Driver SOS & Family Guardian', link: '/features/driver-sos-and-family-guardian' },
          { text: 'Driver Protecting Mode & CCTV', link: '/features/driver-protecting-cctv' },
          { text: 'Intelligent 15s Cascading Dispatch', link: '/features/dispatch-engine' },
          { text: 'E-Wallets & Driver Payouts', link: '/features/payments-and-settlement' }
        ]
      },
      {
        text: 'Product Design and Prototypes',
        collapsed: false,
        items: [
          { text: 'Interactive Prototypes', link: '/design/interactive-prototype' },
          { text: 'Passenger Product Pages', link: '/design/passenger-product-pages' },
          { text: 'Master Wireframes Gallery', link: '/design/wireframes' },
          { text: 'Passenger App', link: '/design/wireframes-passenger' },
          { text: 'Driver App', link: '/design/wireframes-driver' },
          { text: 'Guardian Safety', link: '/design/wireframes-guardian' },
          { text: 'DriverReg KYC', link: '/design/wireframes-driverreg' },
          { text: 'Admin Control Center', link: '/design/wireframes-admin' },
          { text: 'Figma Prototype Plan', link: '/design/figma-prototype-plan' },
          { text: 'Red and Gold Palette', link: '/design/design-system' },
          { text: 'UI Components and Motion', link: '/design/ui-components' }
        ]
      },
      {
        text: 'Infrastructure and Operations',
        collapsed: false,
        items: [
          { text: 'Hetzner CPX22 (2 CPU / 4GB RAM) Setup', link: '/devops/hetzner-cpx22-deployment' },
          { text: 'Hetzner 3-Server & Live Map Setup', link: '/devops/hetzner-3server-production' },
          { text: 'Server Separation Architecture', link: '/devops/vps-deployment' },
          { text: 'VPS Provider Benchmark & Costs', link: '/devops/vps-cost-calculator' },
          { text: 'Production Deployment Guide', link: '/devops/production-setup' }
        ]
      }
    ],
    footer: {
      message: 'LaBar - Next-Generation Taxi Booking & Safety Platform',
      copyright: 'Copyright © 2026 LaBar Engineering Team'
    },
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ]
  }
})
