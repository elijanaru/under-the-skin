// The shield's buttons: "Back to me" closes the app; on a period day "Open for 15 minutes" lifts the soft block,
// and the monitor puts it back when the 15 minutes are over.
import ManagedSettings
import Foundation

class BlockAction: ShieldActionDelegate {
    private func respond(_ action: ShieldAction, _ done: @escaping (ShieldActionResponse) -> Void) {
        switch action {
        case .primaryButtonPressed: done(.close)
        case .secondaryButtonPressed:
            if #available(iOS 16.0, *), UTSBlock.softOnly {
                UTSBlock.clear("period")
                try? UTSBlock.once("pause", minutes: 15)
                done(.none)
            } else { done(.close) }
        @unknown default: done(.close)
        }
    }
    override func handle(action: ShieldAction, for application: ApplicationToken, completionHandler: @escaping (ShieldActionResponse) -> Void) { respond(action, completionHandler) }
    override func handle(action: ShieldAction, for webDomain: WebDomainToken, completionHandler: @escaping (ShieldActionResponse) -> Void) { respond(action, completionHandler) }
    override func handle(action: ShieldAction, for category: ActivityCategoryToken, completionHandler: @escaping (ShieldActionResponse) -> Void) { respond(action, completionHandler) }
}
