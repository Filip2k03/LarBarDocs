# 🧩 On-Demand Add-Ons & Dynamic Plugin Architecture

The **LaBar Platform** implements an **On-Demand Add-On & Dynamic Plugin Architecture** that keeps the base mobile applications ultra-lightweight (**~18 MB** for both Passenger and Driver apps). Heavy, specialized, or optional features (such as the Guardian Family Shield, In-Car CCTV Dashcam Sentinel, and Acoustic Panic Detectors) are packaged as dynamic add-ons (**~2.4 MB – ~3.8 MB**) that users can download, install, and activate directly inside the app on demand.

---

## 📱 Mobile Wireframe: In-App Add-Ons Store

<div style="display: flex; justify-content: center; margin: 28px 0;">
  <img src="/wireframes/plugins_01_addons_store.svg" alt="On-Demand Add-Ons Store Screen" style="max-width: 380px; border-radius: 28px; box-shadow: 0 16px 40px rgba(0,0,0,0.7); border: 2px solid #282836;" />
</div>

- 🖼️ [View High-Resolution Vector SVG](/wireframes/plugins_01_addons_store.svg)
- 🚀 [**Launch Interactive Add-Ons Store Prototype**](/prototypes/plugin-store.html)

---

## 🎯 Why On-Demand Add-Ons are Essential

1. **Ultra-Fast Initial App Downloads**:
   - Base app install size is reduced from **~45 MB down to ~18 MB**, enabling instant downloads over 3G/4G/5G networks in Myanmar.
2. **Zero App Store Waiting Times**:
   - Add-on plugins can be updated, patched, or installed dynamically without forcing users to download an entire new version from Google Play or Apple App Store.
3. **Storage & Battery Optimization**:
   - Casual riders only run the lightweight core booking app. Family members and power drivers activate only the safety plugins they actually use.

---

## 📦 Dynamic Add-On Plugin Catalog

| Plugin Identifier | Name & Myanmar Translation | Target Audience | Size | Key Capabilities |
|---|---|---|---|---|
| `com.labar.plugin.guardian` | **Guardian Safety Shield**<br>(မိသားစု အကာအကွယ်) | Passenger & Driver Families | **~3.8 MB** | 60fps real-time live route tracking, cross-track anomaly alerts ($d_{xt} > 300\text{m}$), DND-override remote siren alarms, emergency contact auto-dialer. |
| `com.labar.plugin.cctv` | **In-Car CCTV Sentinel**<br>(ကားတွင်း CCTV စနစ်) | Professional Drivers | **~3.2 MB** | 1080p 30fps continuous loop recording, rolling cloud video buffer, G-sensor collision impact lock, SHA-256 tamper-proofing. |
| `com.labar.plugin.audio` | **Silent Voice Panic Sentinel**<br>(အသံဖမ်း အရေးပေါ် စနစ်) | Passengers & Drivers | **~2.4 MB** | On-device acoustic distress keyword detector ("Help", "Save me", "ကယ်ပါ") with encrypted cloud audio vault capture. |
| `com.labar.plugin.telemetry` | **Street Radar & Fuel Optimizer**<br>(လမ်းကြောင်းနှင့် ဆီဆိုင်ရှာဖွေမှု) | Drivers | **~1.8 MB** | Real-time Yangon traffic heatmaps, gas/CNG station price comparison, and Yangon municipal motorbike restriction routing. |

---

## ⚙️ Native Dynamic Loading Engine

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ REACT NATIVE HOST APP SHELL (~18 MB)                                                   │
│ - Core Navigation, Auth, REST/WS Client, Red & Gold Design System Tokens               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ DYNAMIC PLUGIN MANAGER (Hot-Swappable Micro-Frontend Bridge)                           │
│                                                                                        │
│ 1. Check Local Cache ➔ 2. Fetch CDN Dynamic Bundle ➔ 3. Verify SHA-256 ➔ 4. Mount      │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
     ┌─────────────────────────────┐               ┌─────────────────────────────┐
     │ ANDROID DYNAMIC FEATURE     │               │ IOS ON-DEMAND RESOURCES     │
     │ Play Core SplitInstallMgr   │               │ NSBundleResourceRequest     │
     │ Downloads `.apk` split      │               │ Loads asset pack / framework│
     └─────────────────────────────┘               └─────────────────────────────┘
```

### React Native Dynamic Module Loading Code
```typescript
import React, { Suspense, lazy } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { PluginManager } from '@labar/api-client';

// Dynamic lazy import resolved on demand
const DynamicGuardianView = lazy(async () => {
  const isInstalled = await PluginManager.isPluginInstalled('com.labar.plugin.guardian');
  if (!isInstalled) {
    await PluginManager.downloadAndInstall('com.labar.plugin.guardian', (progress) => {
      console.log(`Downloading Guardian Plugin: ${progress}%`);
    });
  }
  return import('@labar/guardian-plugin');
});

export function GuardianTabScreen() {
  return (
    <Suspense fallback={
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0E0F14' }}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={{ color: '#FFFFFF', marginTop: 12 }}>Loading Guardian Shield (~3.8MB)...</Text>
      </View>
    }>
      <DynamicGuardianView />
    </Suspense>
  );
}
```

---

## 🌐 Golang Backend Plugin Registry Endpoint

### `GET /api/v1/plugins/manifest`
```json
{
  "status": "success",
  "plugins": [
    {
      "id": "com.labar.plugin.guardian",
      "name": "Guardian Family Safety Shield",
      "name_myanmar": "မိသားစု အကာအကွယ် စနစ်",
      "target_app": "BOTH",
      "version": "1.4.0",
      "download_size_bytes": 3984512,
      "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "bundle_url": "https://cdn.labartaxi.com/plugins/guardian-v1.4.0.bundle",
      "required_permissions": ["BACKGROUND_LOCATION", "RECORD_AUDIO"]
    }
  ]
}
```
