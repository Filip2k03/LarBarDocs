import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
  private var privacyView: UIView?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "LabarDriverReg",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  func applicationWillResignActive(_ application: UIApplication) {
    guard let window else { return }
    let cover = UIView(frame: window.bounds)
    cover.backgroundColor = UIColor(red: 247/255, green: 247/255, blue: 245/255, alpha: 1)
    let label = UILabel(frame: cover.bounds)
    label.text = "LaBar DriverReg\nIdentity information protected"
    label.numberOfLines = 2
    label.textAlignment = .center
    label.font = .boldSystemFont(ofSize: 20)
    cover.addSubview(label)
    window.addSubview(cover)
    privacyView = cover
  }

  func applicationDidBecomeActive(_ application: UIApplication) {
    privacyView?.removeFromSuperview()
    privacyView = nil
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
