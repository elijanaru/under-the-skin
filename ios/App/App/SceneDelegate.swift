import UIKit
import Capacitor
import StoreKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = UTSBridgeViewController()
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

// The page never rubber-bands past its top or bottom edge, so the background behind the app never shows.
class UTSBridgeViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        webView?.scrollView.bounces = false
        webView?.scrollView.alwaysBounceVertical = false
    }
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(UTSStorePlugin())
        #if SCREEN_TIME
        bridge?.registerPluginInstance(UTSBlockPlugin())
        #endif
    }
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        webView?.scrollView.bounces = false
        webView?.scrollView.alwaysBounceVertical = false
    }
}

// The full version (one non-consumable in-app purchase) through StoreKit 2: buy, restore, check, and Apple's offer-code
// sheet for creator codes. A code redeemed in that sheet arrives as a normal transaction on Transaction.updates.
@objc(UTSStorePlugin)
public class UTSStorePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "UTSStorePlugin"
    public let jsName = "UTSStore"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isTestFlight", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "owned", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "buy", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "redeemCode", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openSettings", returnType: CAPPluginReturnPromise),
    ]
    private var updates: Task<Void, Never>?

    override public func load() {
        updates = Task.detached { [weak self] in
            for await result in Transaction.updates {
                guard case .verified(let t) = result else { continue }
                await t.finish()
                if t.revocationDate == nil {
                    self?.notifyListeners("unlocked", data: ["productId": t.productID, "transactionId": String(t.id)], retainUntilConsumed: true)
                }
            }
        }
    }

    // TestFlight and Xcode builds carry a sandbox receipt; App Store builds don't.
    @objc func isTestFlight(_ call: CAPPluginCall) {
        #if DEBUG
        call.resolve(["value": true])
        #else
        call.resolve(["value": Bundle.main.appStoreReceiptURL?.lastPathComponent == "sandboxReceipt"])
        #endif
    }

    private func entitlement(_ id: String) async -> Transaction? {
        for await result in Transaction.currentEntitlements {
            if case .verified(let t) = result, t.productID == id, t.revocationDate == nil { return t }
        }
        return nil
    }

    @objc func owned(_ call: CAPPluginCall) {
        let id = call.getString("productId") ?? ""
        Task {
            if let t = await entitlement(id) { call.resolve(["owned": true, "transactionId": String(t.id)]) }
            else { call.resolve(["owned": false]) }
        }
    }

    @objc func buy(_ call: CAPPluginCall) {
        let id = call.getString("productId") ?? ""
        Task {
            do {
                guard let product = try await Product.products(for: [id]).first else { return call.reject("not found", "notfound") }
                switch try await product.purchase() {
                case .success(let v):
                    guard case .verified(let t) = v else { return call.reject("unverified", "unverified") }
                    await t.finish()
                    call.resolve(["transactionId": String(t.id)])
                case .userCancelled: call.reject("cancelled", "cancelled")
                case .pending: call.reject("pending", "pending")
                @unknown default: call.reject("unknown", "unknown")
                }
            } catch { call.reject(error.localizedDescription, "failed") }
        }
    }

    @objc func restore(_ call: CAPPluginCall) {
        let id = call.getString("productId") ?? ""
        Task {
            try? await AppStore.sync()
            if let t = await entitlement(id) { call.resolve(["owned": true, "transactionId": String(t.id)]) }
            else { call.resolve(["owned": false]) }
        }
    }

    // Underskin's page in the iPhone Settings app (notifications, location), for a permission she said no to earlier
    @objc func openSettings(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let url = URL(string: UIApplication.openSettingsURLString) { UIApplication.shared.open(url) }
            call.resolve()
        }
    }

    @objc func redeemCode(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if #available(iOS 16.0, *), let scene = self.bridge?.viewController?.view.window?.windowScene {
                Task { @MainActor in
                    do { try await AppStore.presentOfferCodeRedeemSheet(in: scene); call.resolve() }
                    catch { call.reject(error.localizedDescription, "failed") }
                }
            } else {
                SKPaymentQueue.default().presentCodeRedemptionSheet()
                call.resolve()
            }
        }
    }
}
