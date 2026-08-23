# 🗺️ Cartography, Live Maps & Turn-by-Turn Routing Engine

The **LaBar Platform** operates a self-hosted, enterprise-grade cartography and spatial routing pipeline designed to provide sub-10ms route calculations, real-time 60fps vector map rendering, and 1-second GPS breadcrumb smoothing without relying on expensive recurring third-party map APIs (e.g. Google Maps or Mapbox).

---

## 🏗️ Cartography Architecture Blueprint

```text
                                  ┌──────────────────────────────────────────────┐
                                  │      REACT NATIVE CLIENT MAP VIEWPORT        │
                                  │      (Leaflet.js / `react-native-maps`)      │
                                  └──────────────────────┬───────────────────────┘
                                                         │
                           ┌─────────────────────────────┴─────────────────────────────┐
                           ▼                                                           ▼
         [ Vector Map Tiles (HTTP/2 PBF) ]                           [ Real-Time GPS Stream (WSS) ]
                           │                                                           │
                           ▼ (Port 8080)                                               ▼ (Port 6379)
┌──────────────────────────────────────────────────┐        ┌──────────────────────────────────────────────────┐
│ SERVER 2: TILESERVER GL (OpenStreetMap Engine)   │        │ SERVER 2: REDIS 7 SPATIAL CLUSTER                │
│ - Pre-compiled `myanmar-latest.mbtiles`          │        │ - 1-second driver GPS breadcrumb stream          │
│ - CartoDB Voyager / Dark Matter custom styles    │        │ - `GEOSEARCH` within 1.0 km (SOS) & 3.0 km (Ride)│
│ - Sub-15ms cached tile response latency          │        │ - Pub/Sub real-time vehicle broadcast channels   │
└──────────────────────────────────────────────────┘        └──────────────────────────────────────────────────┘
                           │                                                           ▲
                           ▼                                                           │
┌──────────────────────────────────────────────────┐                                   │
│ SERVER 2: OSRM MYANMAR ROUTER (`osrm-routed`)    │                                   │
│ - Multi-Level Dijkstra (MLD) algorithm           │                                   │
│ - Multi-stop waypoint routing & ETA calculation  │───────────────────────────────────┘
│ - Downtown Yangon one-way grid penalties         │
└──────────────────────────────────────────────────┘
```

---

## 📍 Key Cartography & Navigation Features

### 1. Real Yangon Cartography & Landmark Layer
- **Downtown Sule Square (`16.7794, 96.1554`)**: Center of the colonial downtown grid with turn-by-turn routing along Merchant, Maha Bandula, Anawrahta, and Bogyoke Aung San Roads.
- **Kandawgyi Lake & Shwedagon Pagoda (`16.7983, 96.1497`)**: High-fidelity park and water body vector geometry rendering.
- **Inya Lake & Pyay Road Corridor (`16.8275, 96.1333`)**: High-speed arterial corridor with live speed telemetry (38 – 45 km/h).

### 2. Kalman Filter GPS Telemetry Smoothing (60fps)
To prevent jerky taxi icon jumps on the map, raw 1-second GPS fixes from driver phones are smoothed using a client-side **Extended Kalman Filter (EKF)**:

$$\hat{x}_{k} = \hat{x}_{k}^- + K_k (z_k - H \hat{x}_{k}^-)$$

- **Position Drift Correction**: Eliminates multi-path GPS reflections in downtown urban canyons between tall buildings.
- **Bearing Smoothing**: Automatically aligns vehicle icon heading with the road polyline vector.

---

## 🖥️ Interactive Live Map Prototypes

Experience the live Leaflet.js cartography and interactive routing directly:

| Prototype View | Direct Launch Link | Simulated Features |
|---|---|---|
| 🚖 **Passenger App** | [**Launch Passenger Live Map**](/prototypes/passenger-app.html) | Sule ➔ Bogyoke ➔ Junction City live route, 15s cascading search, in-trip taximeter, and in-app driver chat. |
| 🚗 **Driver App** | [**Launch Driver Live Map**](/prototypes/driver-app.html) | Shift mode, incoming 15s offer modal, in-car CCTV turn HUD, and 1km fellow driver emergency SOS intercept radar. |
| 🛡️ **Guardian Safety** | [**Launch Guardian Live Map**](/prototypes/guardian-shield.html) | 60fps live route stream with cross-track anomaly alerts ($d_{xt} > 300\text{m}$), driver spouse shift health, and QR pairing. |
