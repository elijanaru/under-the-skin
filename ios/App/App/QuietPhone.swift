// Quiet phone (21 Nov 2026, her ask): pause the apps she picks, with Apple's Screen Time (Family Controls).
// Only built when SCREEN_TIME is set (Debug for now). Apple must approve the Family Controls distribution
// entitlement before Release builds can carry it; then add SCREEN_TIME to Release too (see the project memory).
#if SCREEN_TIME
import Capacitor
import FamilyControls
import DeviceActivity
import ManagedSettings
import SwiftUI

@objc(UTSBlockPlugin)
public class UTSBlockPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "UTSBlockPlugin"
    public let jsName = "UTSBlock"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "state", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "authorize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "pick", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setTexts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "daily", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "period", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "blockNow", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "unblock", returnType: CAPPluginReturnPromise),
    ]

    private func info() -> [String: Any] {
        guard #available(iOS 16.0, *) else { return ["supported": false] }
        let s = UTSBlock.selection()
        let st: String = { switch AuthorizationCenter.shared.authorizationStatus { case .approved: return "approved"; case .denied: return "denied"; default: return "notDetermined" } }()
        return ["supported": true, "status": st, "apps": s?.applicationTokens.count ?? 0, "categories": s?.categoryTokens.count ?? 0,
                "sites": s?.webDomainTokens.count ?? 0, "active": Array(UTSBlock.active),
                "nowUntil": UTSBlock.defaults.double(forKey: "nowUntil")]
    }

    @objc func state(_ call: CAPPluginCall) {
        if #available(iOS 16.0, *) { // a timed "block now" that ran out while the app was closed
            let u = UTSBlock.defaults.double(forKey: "nowUntil")
            if u > 0 && u < Date().timeIntervalSince1970 && UTSBlock.active.contains("now") { UTSBlock.clear("now"); UTSBlock.defaults.set(0, forKey: "nowUntil") }
        }
        call.resolve(info())
    }

    @objc func authorize(_ call: CAPPluginCall) {
        guard #available(iOS 16.0, *) else { return call.resolve(info()) }
        Task { @MainActor in
            do { try await AuthorizationCenter.shared.requestAuthorization(for: .individual) } catch {}
            call.resolve(self.info())
        }
    }

    // Apple's own app picker in a sheet; the choice stays private to the phone
    @objc func pick(_ call: CAPPluginCall) {
        guard #available(iOS 16.0, *) else { return call.resolve(info()) }
        DispatchQueue.main.async {
            let model = PickModel(UTSBlock.selection() ?? FamilyActivitySelection())
            var host: UIViewController?
            let view = PickView(model: model, done: { save in
                if save { UTSBlock.save(model.selection); UTSBlock.refresh() }
                host?.dismiss(animated: true) { call.resolve(self.info()) }
            })
            let h = UIHostingController(rootView: view); host = h
            h.isModalInPresentation = true
            self.bridge?.viewController?.present(h, animated: true)
        }
    }

    // {texts: {now: [title, line], morning: [...], evening: [...], period: [...], buttons: [back, open]}}
    @objc func setTexts(_ call: CAPPluginCall) {
        guard #available(iOS 16.0, *) else { return call.resolve() }
        UTSBlock.defaults.set(call.getObject("texts") ?? [:], forKey: "texts"); call.resolve()
    }

    // {mode: "morning"|"evening", on, sh, sm, eh, em}: every day from start to end (may cross midnight)
    @objc func daily(_ call: CAPPluginCall) {
        guard #available(iOS 16.0, *) else { return call.resolve(info()) }
        let mode = call.getString("mode") ?? "", on = call.getBool("on") ?? false
        guard mode == "morning" || mode == "evening" else { return call.reject("mode") }
        let c = DeviceActivityCenter(), name = DeviceActivityName(mode)
        c.stopMonitoring([name]); UTSBlock.clear(mode)
        if on {
            let sh = call.getInt("sh") ?? 7, sm = call.getInt("sm") ?? 0, eh = call.getInt("eh") ?? 8, em = call.getInt("em") ?? 0
            do {
                try c.startMonitoring(name, during: DeviceActivitySchedule(intervalStart: DateComponents(hour: sh, minute: sm), intervalEnd: DateComponents(hour: eh, minute: em), repeats: true))
            } catch { return call.reject("Too short. A quiet time needs at least 15 minutes.") }
            // if we are inside the window right now, start at once
            let n = Calendar.current.dateComponents([.hour, .minute], from: Date()), t = n.hour! * 60 + n.minute!, a = sh * 60 + sm, b = eh * 60 + em
            if a < b ? (t >= a && t < b) : (t >= a || t < b) { UTSBlock.apply(mode) }
        }
        call.resolve(info())
    }

    // {on, start, end} in ms since 1970: the soft block around her period (two days before until it ends)
    @objc func period(_ call: CAPPluginCall) {
        guard #available(iOS 16.0, *) else { return call.resolve(info()) }
        let on = call.getBool("on") ?? false, a = (call.getDouble("start") ?? 0) / 1000, b = (call.getDouble("end") ?? 0) / 1000
        let d = UTSBlock.defaults, c = DeviceActivityCenter(), name = DeviceActivityName("period")
        d.set(on, forKey: "periodOn"); d.set(a, forKey: "periodStart"); d.set(b, forKey: "periodEnd")
        c.stopMonitoring([name]); if !on || b <= Date().timeIntervalSince1970 { UTSBlock.clear("period"); return call.resolve(info()) }
        let cal = Calendar.current, f: Set<Calendar.Component> = [.year, .month, .day, .hour, .minute, .second]
        let from = max(a, Date().timeIntervalSince1970)
        try? c.startMonitoring(name, during: DeviceActivitySchedule(intervalStart: cal.dateComponents(f, from: Date(timeIntervalSince1970: from)), intervalEnd: cal.dateComponents(f, from: Date(timeIntervalSince1970: b)), repeats: false))
        if UTSBlock.inPeriodWindow { UTSBlock.apply("period") } else { UTSBlock.clear("period") }
        call.resolve(info())
    }

    // {minutes}: 0 = until she lifts it
    @objc func blockNow(_ call: CAPPluginCall) {
        guard #available(iOS 16.0, *) else { return call.resolve(info()) }
        let min = call.getInt("minutes") ?? 0
        UTSBlock.apply("now")
        DeviceActivityCenter().stopMonitoring([DeviceActivityName("now")])
        if min > 0 { try? UTSBlock.once("now", minutes: min); UTSBlock.defaults.set(Date().timeIntervalSince1970 + Double(max(min, 15)) * 60, forKey: "nowUntil") }
        else { UTSBlock.defaults.set(0, forKey: "nowUntil") }
        call.resolve(info())
    }

    @objc func unblock(_ call: CAPPluginCall) {
        guard #available(iOS 16.0, *) else { return call.resolve(info()) }
        let mode = call.getString("mode") ?? "now"
        UTSBlock.clear(mode)
        if mode == "now" { DeviceActivityCenter().stopMonitoring([DeviceActivityName("now")]); UTSBlock.defaults.set(0, forKey: "nowUntil") }
        call.resolve(info())
    }
}

@available(iOS 16.0, *)
final class PickModel: ObservableObject {
    @Published var selection: FamilyActivitySelection
    init(_ s: FamilyActivitySelection) { selection = s }
}

@available(iOS 16.0, *)
struct PickView: View {
    @ObservedObject var model: PickModel
    let done: (Bool) -> Void
    var body: some View {
        NavigationView {
            FamilyActivityPicker(selection: $model.selection)
                .navigationTitle("Apps to pause")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) { Button("Cancel") { done(false) } }
                    ToolbarItem(placement: .confirmationAction) { Button("Done") { done(true) }.fontWeight(.semibold) }
                }
        }
        .tint(Color(red: 0x6c / 255, green: 0x82 / 255, blue: 0x3e / 255))
    }
}
#endif
