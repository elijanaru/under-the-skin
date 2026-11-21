// Quiet phone (21 Nov 2026): what the app, the monitor, the shield and the shield-button extensions share.
// Her picked apps (opaque tokens from Apple's picker, we never see names) and the shield texts live in the App Group.
// Each mode (now, morning, evening, period) shields through its own named store, so ending one never lifts another.
#if SCREEN_TIME
import Foundation
import FamilyControls
import ManagedSettings
import DeviceActivity

@available(iOS 16.0, *)
enum UTSBlock {
    static let group = "group.com.elijanaru.undertheskin"
    static var defaults: UserDefaults { UserDefaults(suiteName: group) ?? .standard }
    static let modes = ["now", "evening", "morning", "period"] // the shield shows the first one that is on

    static func selection() -> FamilyActivitySelection? {
        guard let d = defaults.data(forKey: "selection") else { return nil }
        return try? JSONDecoder().decode(FamilyActivitySelection.self, from: d)
    }
    static func save(_ s: FamilyActivitySelection) {
        if let d = try? JSONEncoder().encode(s) { defaults.set(d, forKey: "selection") }
    }
    static var active: Set<String> {
        get { Set(defaults.stringArray(forKey: "active") ?? []) }
        set { defaults.set(Array(newValue), forKey: "active") }
    }
    static func store(_ mode: String) -> ManagedSettingsStore { ManagedSettingsStore(named: .init(mode)) }

    static func apply(_ mode: String) {
        guard let s = selection() else { return }
        let st = store(mode)
        st.shield.applications = s.applicationTokens.isEmpty ? nil : s.applicationTokens
        st.shield.applicationCategories = s.categoryTokens.isEmpty ? nil : .specific(s.categoryTokens)
        st.shield.webDomains = s.webDomainTokens.isEmpty ? nil : s.webDomainTokens
        active.insert(mode)
    }
    static func clear(_ mode: String) {
        store(mode).clearAllSettings()
        active.remove(mode)
    }
    // re-shield every mode that is on with the current pick (after she changes her apps)
    static func refresh() { for m in active { apply(m) } }

    // the period window, as seconds since 1970 (the app writes it, the monitor reads it after a 15-minute pause)
    static var periodWindow: (Double, Double)? {
        let a = defaults.double(forKey: "periodStart"), b = defaults.double(forKey: "periodEnd")
        return b > a ? (a, b) : nil
    }
    static var inPeriodWindow: Bool {
        guard defaults.bool(forKey: "periodOn"), let (a, b) = periodWindow else { return false }
        let now = Date().timeIntervalSince1970; return now >= a && now < b
    }

    // the words on the shield for the mode that is shielding, written by the app in her language
    static func text(_ mode: String) -> [String] {
        (defaults.dictionary(forKey: "texts")?[mode] as? [String]) ?? ["Your phone is resting", "Take a breath. This can wait."]
    }
    static var shieldMode: String { modes.first { active.contains($0) } ?? "now" }
    static var softOnly: Bool { shieldMode == "period" }

    // a one-off interval from now (repeats: false); DeviceActivity needs at least 15 minutes
    static func once(_ name: String, minutes: Int) throws {
        let cal = Calendar.current, now = Date(), end = now.addingTimeInterval(Double(max(minutes, 15)) * 60 + 5)
        let f: Set<Calendar.Component> = [.year, .month, .day, .hour, .minute, .second]
        let c = DeviceActivityCenter()
        c.stopMonitoring([DeviceActivityName(name)])
        try c.startMonitoring(DeviceActivityName(name), during: DeviceActivitySchedule(intervalStart: cal.dateComponents(f, from: now), intervalEnd: cal.dateComponents(f, from: end), repeats: false))
    }
}
#endif
