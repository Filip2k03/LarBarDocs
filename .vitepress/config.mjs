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
      { text: 'Guardian Plugin', link: '/features/guardian-plugin' },
      { text: 'Design System', link: '/design/design-system' },
      { text: 'DevOps & VPS', link: '/devops/vps-deployment' }
    ],
    sidebar: [
      {
        text: '🚀 Overview & Setup',
        collapsed: false,
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Tech Stack & Standards', link: '/guide/tech-stack' }
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
          { text: 'Guardian Dynamic Plugin Module', link: '/features/guardian-plugin' },
          { text: 'Driver Protecting Mode & CCTV', link: '/features/driver-protecting-cctv' },
          { text: 'Intelligent 15s Cascading Dispatch', link: '/features/dispatch-engine' },
          { text: 'E-Wallets & Driver Payouts', link: '/features/payments-and-settlement' }
        ]
      },
      {
        text: '🎨 UX/UI & Figma Design System',
        collapsed: false,
        items: [
          { text: 'Red & Gold Color Palette (100-900)', link: '/design/design-system' },
          { text: 'UI Components & Motion States', link: '/design/ui-components' },
          { text: 'Wireframe Mockups & Flows', link: '/design/wireframes' }
        ]
      },
      {
        text: '☁️ DevOps, VPS & Cloud Infrastructure',
        collapsed: false,
        items: [
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
