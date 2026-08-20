# 📱 Native Mobile Architecture (iOS & Android)

The client tier comprises 100% **Native Applications** engineered for maximum hardware integration, 60fps fluid rendering, and on-demand dynamic plugin delivery:
- **Native Android**: Kotlin 2.0 + Jetpack Compose + MVI + Play Feature Delivery.
- **Native iOS**: Swift 6 + SwiftUI + MVVM-C + On-Demand Resources (ODR).

---

## 🤖 Android Dynamic Feature Delivery (`SplitInstallManager`)

The core application remains ultra-compact (~18MB). High-value safety modules (Passenger Guardian and Driver Guardian) are delivered dynamically on demand.

```kotlin
class PluginInstallerManager(private val context: Context) {
    private val splitInstallManager = SplitInstallManagerFactory.create(context)

    fun downloadAndInstallPlugin(
        moduleName: String,
        onProgress: (Int) -> Unit,
        onSuccess: () -> Unit,
        onError: (Exception) -> Unit
    ) {
        val request = SplitInstallRequest.newBuilder()
            .addModule(moduleName) // e.g. "driver_guardian"
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
                    onError(Exception("Install failed with error code: ${state.errorCode()}"))
                }
                else -> Unit
            }
        }

        splitInstallManager.startInstall(request)
    }
}
```

---

## 🍏 iOS Dynamic Framework Loading & On-Demand Resources

On iOS, modules are loaded as dynamic XCFrameworks using `NSBundleResourceRequest`:

```swift
final class DynamicGuardianLoader: ObservableObject {
    @Published var downloadProgress: Double = 0.0
    @Published var isLoaded: Bool = false

    private var resourceRequest: NSBundleResourceRequest?

    func loadGuardianPlugin(tag: String = "driver_guardian_pack") async throws {
        let tags = Set([tag])
        let request = NSBundleResourceRequest(tags: tags)
        self.resourceRequest = request

        request.loadingPriority = NSBundleResourceRequestLoadingPriorityUrgent
        try await request.beginAccessingResources()

        await MainActor.run {
            self.isLoaded = true
        }
    }
}
```

---

## 🚨 Driver Covert Hardware Key Interceptor (Android)

Allows drivers to trigger emergency SOS silently by triple-clicking physical volume buttons:

```kotlin
class CovertSOSAccessibilityService : AccessibilityService() {
    private var lastClickTime = 0L
    private var clickCount = 0

    override fun onKeyEvent(event: KeyEvent): Boolean {
        if (event.action == KeyEvent.ACTION_DOWN &&
            (event.keyCode == KeyEvent.KEYCODE_VOLUME_UP || event.keyCode == KeyEvent.KEYCODE_VOLUME_DOWN)) {
            
            val currentTime = System.currentTimeMillis()
            if (currentTime - lastClickTime < 500) {
                clickCount++
            } else {
                clickCount = 1
            }
            lastClickTime = currentTime

            if (clickCount >= 3) {
                clickCount = 0
                EmergencyCoordinator.triggerSilentSOS(applicationContext)
                return true // Consume event
            }
        }
        return super.onKeyEvent(event)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}
    override fun onInterrupt() {}
}
```
