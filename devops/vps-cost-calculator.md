# VPS Provider Benchmark & Monthly Cost Calculator

We evaluated the top three cloud VPS providers for hosting the LaBar Taxi Platform: **Hetzner Cloud**, **Hostinger KVM**, and **DigitalOcean**.

---

## Cloud Provider Comparison Matrix

| Provider | Strengths | Weaknesses | Best Fit For |
|---|---|---|---|
|  **Hetzner Cloud** | **Highest CPU performance/price ratio**, unmetered 20TB traffic per node, blazing fast NVMe SSDs, private VPC networks. | Data centers in Germany, Finland, USA (Falkenstein/Helsinki/Ashburn/Hillsboro). Use Cloudflare CDN in front. | **Production Scale (Top Recommendation)** |
|  **Hostinger KVM** | **Lowest entry price**, multiple regional locations (Singapore, India, USA, Europe), straightforward UI. | Slower disk I/O on lower tiers, fewer advanced cloud networking features. | **Starter MVP / Low-Budget Prototype** |
|  **DigitalOcean** | **Extensive global regions (including Singapore)**, managed databases, 1-click Kubernetes, excellent developer tooling. | Highest cost per vCPU/RAM ratio among the three. | **Fast Regional Deployment in Asia** |

---

## Dedicated Hetzner 3-Server Production Budget (Recommended)

| Server Role | Server Specification | Hetzner Cloud Model | Monthly Cost (€) | Monthly Cost (USD) |
|---|---|---|---|---|
| **Server 1: API Gateway & Go Core** | 4 vCPU AMD EPYC, 8 GB RAM, 160 GB NVMe | **CPX31** | €13.50 / mo | ~$14.70 / mo |
| **Server 2: Live Map, OSRM & Redis** | 8 vCPU AMD EPYC, 16 GB RAM, 240 GB NVMe | **CPX41** | €26.50 / mo | ~$28.90 / mo |
| **Server 3: PostGIS DB & Storage Vault** | 4 vCPU AMD EPYC, 8 GB RAM, 160 GB NVMe + 1TB Storage Box | **CPX31 + BX11** | €13.50 + €3.80 | ~$18.80 / mo |
| **Private VPC Network (10.0.0.0/24)** | High-speed 10Gbps isolated cloud network | **Included Free** | **€0.00** | **$0.00** |
| **Outbound Traffic (20 TB / server)** | Unlimited inbound + 60 TB total outbound | **Included Free** | **€0.00** | **$0.00** |
| **TOTAL ESTIMATED MONTHLY** | — | — | **~€57.30 / mo** | **~$62.40 / mo** |

---

## Alternative Scenarios Comparison

### Scenario A: Starter / MVP Tier (1,000 - 5,000 rides/day)
*Suitable for initial soft launch and prototype testing.*

| Component | Node Spec | Provider Option 1: Hetzner | Provider Option 2: Hostinger | Provider Option 3: DigitalOcean |
|---|---|---|---|---|
| **App + Gateway + Redis** | 4 vCPU, 8 GB RAM, 80 GB NVMe | CPX31 (~$14.50/mo) | KVM 4 (~$12.99/mo) | Droplet (~$48.00/mo) |
| **PostgreSQL + PostGIS** | 2 vCPU, 4 GB RAM, 40 GB NVMe | CPX21 (~$8.50/mo) | KVM 2 (~$7.99/mo) | Droplet (~$24.00/mo) |
| **OSRM Routing Engine** | 2 vCPU, 4 GB RAM, 40 GB NVMe | CX22 (~$4.50/mo) | Included above | Included above |
| **Object Storage (S3 / CCTV)** | 100 GB Storage Box / Cloudflare R2 | Storage Box (~$3.80/mo) | S3 Compatible (~$5.00/mo) | Spaces (~$5.00/mo) |
| **TOTAL ESTIMATED MONTHLY** | — | **~$31.30 / month** | **~$25.98 / month** | **~$77.00 / month** |

---

### Scenario B: 5-Node High-Availability Scale Tier (50,000+ rides/day)

| Server Role | Node Specification | Hetzner Cloud (Recommended) | DigitalOcean |
|---|---|---|---|
| **Server 1: API Gateway / Caddy** | 2 vCPU, 4 GB RAM (CX22) | $4.50 / mo | $24.00 / mo |
| **Server 2: Go Backend App Core** | 8 vCPU, 16 GB RAM (CPX41) | $28.50 / mo | $96.00 / mo |
| **Server 3: Redis 7 + OSRM Engine**| 4 vCPU, 8 GB RAM (CPX31) | $14.50 / mo | $48.00 / mo |
| **Server 4: PostgreSQL 16 + PostGIS**| 8 vCPU, 32 GB RAM (CCX33 Dedicated) | $62.00 / mo | $168.00 / mo |
| **Server 5: CCTV Cloud Storage Vault**| 1 TB Storage Box / Cloudflare R2 | $12.50 / mo | $20.00 / mo |
| **TOTAL ESTIMATED MONTHLY** | — | **~$122.00 / month** | **~$356.00 / month** |

---

## Recommendation Summary

1. **Top Production Recommendation**: Deploy the **Hetzner 3-Server Architecture** (**~$62.40/month**) for dedicated API, Live Map (OSRM + TileServer), and PostGIS database isolation.
2. **For Initial MVP / Budget Testing**: Start with **Hostinger KVM** (~$26/month single or dual VPS).
3. **If Singapore Edge Latency is Critical**: Route traffic through **Cloudflare CDN (Singapore Edge)** pointing to Hetzner origin servers with Argo Smart Routing.
