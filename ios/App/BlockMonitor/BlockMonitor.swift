// Turns each Quiet phone mode on when its time starts and off when it ends, even while the app is closed.
// "pause" is the 15 minutes she gave herself on a period day: when it ends, the soft period block comes back.
import DeviceActivity
import ManagedSettings
import Foundation

class BlockMonitor: DeviceActivityMonitor {
    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)
        guard #available(iOS 16.0, *) else { return }
        let m = activity.rawValue
        if m == "pause" { return }
        if m == "period" && !UTSBlock.inPeriodWindow { return }
        UTSBlock.apply(m)
    }
    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)
        guard #available(iOS 16.0, *) else { return }
        let m = activity.rawValue
        if m == "pause" { if UTSBlock.inPeriodWindow { UTSBlock.apply("period") }; return }
        UTSBlock.clear(m)
    }
}
