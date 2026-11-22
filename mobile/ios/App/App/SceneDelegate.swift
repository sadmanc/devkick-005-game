import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = AppViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

class AppViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        #if DEBUG
        runSmokeClicks()
        #endif
    }

    #if DEBUG
    // CI only: launching with `-smokeClicks "8:#play,10:#consent-agree"` clicks each CSS selector that many
    // seconds after launch, so the simulator job can screenshot every screen without a person tapping.
    private func runSmokeClicks() {
        let args = ProcessInfo.processInfo.arguments
        guard let i = args.firstIndex(of: "-smokeClicks"), i + 1 < args.count else { return }
        for step in args[i + 1].split(separator: ",") {
            let parts = step.split(separator: ":", maxSplits: 1)
            guard parts.count == 2, let delay = Double(parts[0]) else { continue }
            let selector = parts[1].replacingOccurrences(of: "'", with: "\\'")
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
                self?.webView?.evaluateJavaScript("document.querySelector('\(selector)')?.click()")
            }
        }
    }
    #endif
}
