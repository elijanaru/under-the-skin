import UIKit
import Capacitor
import StoreKit
import WidgetKit
import HealthKit

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
        bridge?.registerPluginInstance(UTSWidgetPlugin())
        bridge?.registerPluginInstance(UTSHealthPlugin())
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


// Home screen widget (28 Nov 2026): the app hands over the next 14 days as JSON, already in her language; the widget
// (DayWidget target) reads it from the shared app group and switches day at midnight.
@objc(UTSWidgetPlugin)
public class UTSWidgetPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "UTSWidgetPlugin"
    public let jsName = "UTSWidget"
    public let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name: "set", returnType: CAPPluginReturnPromise)]
    @objc func set(_ call: CAPPluginCall) {
        let json = call.getString("json") ?? ""
        UserDefaults(suiteName: "group.com.elijanaru.undertheskin")?.set(json, forKey: "uts.widget")
        WidgetCenter.shared.reloadAllTimelines()
        call.resolve()
    }
}

// Apple Health (28 Nov 2026): read-only. Her period days from Health (menstrual flow samples), so the app knows her
// rhythm from day one. Nothing is written to Health and nothing leaves the phone from here.
@objc(UTSHealthPlugin)
public class UTSHealthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "UTSHealthPlugin"
    public let jsName = "UTSHealth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "available", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "periods", returnType: CAPPluginReturnPromise),
    ]
    private let store = HKHealthStore()
    @objc func available(_ call: CAPPluginCall) { call.resolve(["ok": HKHealthStore.isHealthDataAvailable()]) }
    @objc func periods(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable(), let type = HKObjectType.categoryType(forIdentifier: .menstrualFlow) else { call.reject("unavailable"); return }
        let days = call.getInt("days") ?? 730
        store.requestAuthorization(toShare: nil, read: [type]) { [weak self] _, error in
            if let error = error { call.reject(error.localizedDescription); return }
            let start = Calendar.current.date(byAdding: .day, value: -days, to: Date())
            let pred = HKQuery.predicateForSamples(withStart: start, end: Date(), options: [])
            let q = HKSampleQuery(sampleType: type, predicate: pred, limit: HKObjectQueryNoLimit,
                                  sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)]) { _, samples, error in
                if let error = error { call.reject(error.localizedDescription); return }
                let f = DateFormatter(); f.calendar = Calendar(identifier: .gregorian); f.locale = Locale(identifier: "en_US_POSIX"); f.timeZone = .current; f.dateFormat = "yyyy-MM-dd"
                // raw values of the flow category: 1 unspecified, 2 light, 3 medium, 4 heavy, 5 none
                let names = [1: "medium", 2: "light", 3: "medium", 4: "heavy"]
                var out: [[String: String]] = []
                for s in (samples as? [HKCategorySample]) ?? [] {
                    guard let flow = names[s.value] else { continue }
                    out.append(["d": f.string(from: s.startDate), "flow": flow])
                }
                call.resolve(["days": out])
            }
            self?.store.execute(q)
        }
    }
}
