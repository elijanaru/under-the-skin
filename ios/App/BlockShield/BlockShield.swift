// The screen she sees when she opens a paused app: blush glass, the swirl logo, a short line from her body.
// Around her period it is softer: a second button opens the apps for 15 minutes.
import ManagedSettings
import ManagedSettingsUI
import UIKit

class BlockShield: ShieldConfigurationDataSource {
    private func make() -> ShieldConfiguration {
        let ink = UIColor(red: 0x30 / 255, green: 0x40 / 255, blue: 0x23 / 255, alpha: 1)
        let moss = UIColor(red: 0x6c / 255, green: 0x82 / 255, blue: 0x3e / 255, alpha: 1)
        let blush = UIColor(red: 0xf6 / 255, green: 0xee / 255, blue: 0xf0 / 255, alpha: 0.92)
        var t = ["Your phone is resting", "Take a breath. This can wait."], soft = false, back = "Back to me", open = "Open for 15 minutes"
        if #available(iOS 16.0, *) {
            t = UTSBlock.text(UTSBlock.shieldMode); soft = UTSBlock.softOnly
            let b = UTSBlock.text("buttons"); if b.count == 2 { back = b[0]; open = b[1] }
        }
        return ShieldConfiguration(
            backgroundBlurStyle: .systemUltraThinMaterialLight,
            backgroundColor: blush,
            icon: UIImage(named: "ShieldIcon"),
            title: .init(text: t.first ?? "", color: ink),
            subtitle: .init(text: t.count > 1 ? t[1] : "", color: ink.withAlphaComponent(0.8)),
            primaryButtonLabel: .init(text: back, color: .white),
            primaryButtonBackgroundColor: moss,
            secondaryButtonLabel: soft ? .init(text: open, color: moss) : nil)
    }
    override func configuration(shielding application: Application) -> ShieldConfiguration { make() }
    override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration { make() }
    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration { make() }
    override func configuration(shielding webDomain: WebDomain, in category: ActivityCategory) -> ShieldConfiguration { make() }
}
