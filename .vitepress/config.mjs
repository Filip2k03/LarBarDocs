import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LarBar Taxi Platform',
  description: 'Enterprise Taxi Dispatch, Dual-Shield Safety, Guardian Plugins & Financial Settlement System',
  lang: 'en-US',
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#E5252A' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'LarBar Taxi Engine',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Architecture', link: '/architecture/overview' },
      { text: 'UML Diagrams', link: '/architecture/uml-diagrams' },
      { text: 'Prototypes 📱', link: '/design/interactive-prototype' },
      { text: 'Driver SOS & Mesh', link: '/features/driver-sos-and-family-guardian' },
      { text: 'Myanmar 🇲🇲', link: '/features/myanmar-localization-and-payments' },
      { text: 'Hetzner CPX22', link: '/devops/hetzner-cpx22-deployment' },
      { text: '3-Server VPC', link: '/devops/hetzner-3server-production' }
    ],
    sidebar: [
      {
        text: '🚀 Overview & Setup',
        collapsed: false,
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Monorepo & Codebase Architecture', link: '/architecture/codebase-architecture' },
          { text: 'Recommended Libraries & Standards', link: '/guide/recommended-tech-stack-and-libraries' },
          { text: 'Tech Stack & Standards', link: '/guide/tech-stack' },
          { text: 'Native Mobile Architecture', link: '/guide/mobile-architecture' },
          { text: 'REST & WebSocket API Reference', link: '/guide/api-reference' }
        ]
      },
      {
        text: '🏛️ System Architecture',
        collapsed: false,
        items: [
          { text: 'High-Level Overview', link: '/architecture/overview' },
          { text: 'UML 2.5 & Draw.io Models', link: '/architecture/uml-diagrams' },
          { text: 'Database & PostGIS ERD', link: '/architecture/database-design' },
          { text: 'Clean Architecture (Go)', link: '/architecture/clean-architecture-go' }
        ]
      },
      {
        text: '🛡️ Core Features & Safety',
        collapsed: false,
        items: [
          { text: '🧩 On-Demand Add-Ons & Plugin Store', link: '/features/dynamic-plugin-store' },
          { text: 'Myanmar 🇲🇲 Localization & Compliance', link: '/features/myanmar-localization-and-payments' },
          { text: 'Guardian Dynamic Plugin Module', link: '/features/guardian-plugin' },
          { text: 'Driver SOS & Family Guardian', link: '/features/driver-sos-and-family-guardian' },
          { text: 'Driver Protecting Mode & CCTV', link: '/features/driver-protecting-cctv' },
          { text: 'Intelligent 15s Cascading Dispatch', link: '/features/dispatch-engine' },
          { text: 'E-Wallets & Driver Payouts', link: '/features/payments-and-settlement' }
        ]
      },
      {
        text: '🎨 UX/UI & Figma Design System',
        collapsed: false,
        items: [
          { text: '📱 Interactive Mobile Prototype', link: '/design/interactive-prototype' },
          { text: '📐 Master Wireframes Gallery', link: '/design/wireframes' },
          { text: '🚖 Passenger App (4 Screens)', link: '/design/wireframes-passenger' },
          { text: '🚗 Driver App (5 Screens)', link: '/design/wireframes-driver' },
          { text: '🛡️ Guardian Safety (3 Screens)', link: '/design/wireframes-guardian' },
          { text: '🎨 Red & Gold Palette (100-900)', link: '/design/design-system' },
          { text: '🎛️ UI Components & Motion States', link: '/design/ui-components' }
        ]
      },
      {
        text: '☁️ DevOps, VPS & Cloud Infrastructure',
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
      message: 'LarBar - Next-Generation Taxi Booking & Safety Platform',
      copyright: 'Copyright © 2026 LarBar Engineering Team'
    },
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ]
  }
})
