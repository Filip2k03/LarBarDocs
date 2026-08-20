# 🛡️ Guardian Dynamic Feature Plugin Module

To keep the core passenger application lightweight (~18MB), the **Guardian Safety Shield** is engineered as an **on-demand installable dynamic plugin package** (`com.taxi.plugin.guardian` / `GuardianPluginKit.framework`).

---

## 📦 Dynamic Module Delivery Mechanics

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             PASSENGER APP CORE (BASE CONTAINER)                                  │
│                                                                                                  │
│   1. User navigates to Guardian Tab                                                              │
│   2. Checks `splitInstallManager.installedModules.contains("guardian")`                          │
│   3. If False: Shows "Download Guardian Safety Plugin (~3.8MB)" with feature preview            │
│   4. User taps "Install": Asynchronously downloads and verifies cryptographic signature          │
│   5. Dynamic Class Loading: Plugin registers with Base App Event Bus and mounts UI              │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 📱 Android Play Feature Delivery (`:feature_guardian`)

```kotlin
class GuardianPluginInstaller(private val context: Context) {
    private val splitInstallManager = SplitInstallManagerFactory.create(context)

    fun installGuardianModule(
        onProgress: (Int) -> Unit,
        onSuccess: () -> Unit,
        onError: (Exception) -> Unit
    ) {
        val request = SplitInstallRequest.newBuilder()
            .addModule("feature_guardian")
            .build()

        splitInstallManager.registerListener { state ->
            when (state.status()) {
                SplitInstallSessionStatus.DOWNLOADING -> {
                    val progress = (state.bytesDownloaded() * 100 / state.totalBytesToDownload()).toInt()
                    onProgress(progress)
                }
                SplitInstallSessionStatus.INSTALLED -> {
                    onSuccess()
                }
                SplitInstallSessionStatus.FAILED -> {
                    onError(Exception("Install failed with code: ${state.errorCode()}"))
                }
            }
        }
        splitInstallManager.startInstall(request)
    }
}
```

---

## ⚡ Core Submodules Inside Guardian Package

1. **Family Mesh Pairing Engine**:
   - Generates 6-digit one-time pairing tokens and QR codes. Family devices pair in $< 3\text{ seconds}$ without cumbersome account setups.
2. **Real-Time 60fps Telemetry Renderer**:
   - Subscribes to live driver coordinates over WebSocket/WebRTC and renders smooth vehicle movement on family devices.
3. **Local & Remote Cross-Track Anomaly Detector**:
   - Computes orthogonal distance $d_{xt}$ from the vehicle coordinate to the active route polyline.
   - If $d_{xt} > 300\text{m}$ for consecutive $> 45\text{s}$, sounds high-priority emergency sirens.
4. **Emergency SOS & DND Bypass**:
   - Bypasses device "Do Not Disturb" using Apple Critical Alerts and Android High-Priority Notification Channels to ensure family guardians are immediately alerted.
