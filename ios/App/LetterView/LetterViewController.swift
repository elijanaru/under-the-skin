// Letters From Your Body, as a real letter when she long-presses the notification:
// cream paper, her name, the words in blue handwriting ink, her phase's lotus as the stamp, signed by her body.
import UIKit
import SwiftUI
import UserNotifications
import UserNotificationsUI

private let ink = Color(red: 0.184, green: 0.247, blue: 0.525)        // #2f3f86, the in-app letter ink
private let rose = Color(red: 0.690, green: 0.310, blue: 0.424)       // #b04f6c
private let paper = Color(red: 1.0, green: 0.988, blue: 0.965)        // warm cream
private let blush = Color(red: 0.965, green: 0.933, blue: 0.941)      // #f6eef0, the app's mist page

private func hand(_ size: CGFloat) -> Font {
    UIFont(name: "BradleyHandITCTT-Bold", size: size) != nil ? .custom("BradleyHandITCTT-Bold", size: size) : .system(size: size, weight: .regular, design: .serif)
}
private func phaseTint(_ phase: String) -> Color {
    switch phase {
    case "menstrual": return Color(red: 0.79, green: 0.42, blue: 0.50)
    case "follicular": return Color(red: 0.42, green: 0.51, blue: 0.24)
    case "ovulatory": return Color(red: 0.73, green: 0.53, blue: 0.18)
    default: return Color(red: 0.55, green: 0.47, blue: 0.70)
    }
}

struct LetterCard: View {
    let name: String
    let text: String
    let phase: String
    let stamp: UIImage?
    let date: String

    var body: some View {
        ZStack {
            LinearGradient(colors: [blush, Color(red: 0.94, green: 0.83, blue: 0.87)], startPoint: .top, endPoint: .bottom)
            VStack(alignment: .leading, spacing: 14) {
                HStack(alignment: .top) {
                    Text(date).font(.system(size: 12, weight: .medium)).foregroundColor(ink.opacity(0.55)).padding(.top, 6)
                    Spacer()
                    stampView.rotationEffect(.degrees(4))
                }
                Text(name.isEmpty ? "Dear you," : "Dear \(name),").font(hand(24)).foregroundColor(ink)
                Text(text).font(hand(19)).foregroundColor(ink).lineSpacing(5).fixedSize(horizontal: false, vertical: true)
                HStack {
                    Spacer()
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("With love,").font(hand(18)).foregroundColor(ink)
                        (Text("your body ").font(hand(21)).foregroundColor(ink) + Text("♡").font(.system(size: 18)).foregroundColor(rose))
                    }
                }
            }
            .padding(EdgeInsets(top: 18, leading: 22, bottom: 22, trailing: 22))
            .background(paper)
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 8, style: .continuous).stroke(ink.opacity(0.06), lineWidth: 1))
            .shadow(color: Color(red: 0.35, green: 0.16, blue: 0.24).opacity(0.18), radius: 14, x: 0, y: 10)
            .rotationEffect(.degrees(-0.8))
            .padding(EdgeInsets(top: 22, leading: 18, bottom: 26, trailing: 18))
        }
    }

    private var stampView: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 3).fill(Color.white)
            RoundedRectangle(cornerRadius: 3).strokeBorder(phaseTint(phase), style: StrokeStyle(lineWidth: 2, dash: [3, 2.5]))
            if let img = stamp {
                Image(uiImage: img).resizable().scaledToFill().frame(width: 50, height: 58).clipped().cornerRadius(2)
            } else {
                Text("✿").font(.system(size: 26)).foregroundColor(phaseTint(phase))
            }
        }
        .frame(width: 62, height: 70)
        .shadow(color: .black.opacity(0.08), radius: 3, x: 0, y: 2)
    }
}

final class LetterViewController: UIViewController, UNNotificationContentExtension {
    private var host: UIHostingController<LetterCard>?

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.965, green: 0.933, blue: 0.941, alpha: 1)
    }

    func didReceive(_ notification: UNNotification) {
        let content = notification.request.content
        let extra = content.userInfo["cap_extra"] as? [String: Any] ?? [:]
        var stamp: UIImage?
        if let a = content.attachments.first {
            let open = a.url.startAccessingSecurityScopedResource()
            stamp = UIImage(contentsOfFile: a.url.path)
            if open { a.url.stopAccessingSecurityScopedResource() }
        }
        let df = DateFormatter(); df.dateFormat = "EEEE, d MMMM"
        let card = LetterCard(name: extra["name"] as? String ?? "", text: content.body, phase: extra["phase"] as? String ?? "", stamp: stamp, date: df.string(from: notification.date))

        host?.view.removeFromSuperview(); host?.removeFromParent()
        let h = UIHostingController(rootView: card)
        h.view.backgroundColor = .clear
        addChild(h)
        view.addSubview(h.view)
        h.view.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            h.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            h.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            h.view.topAnchor.constraint(equalTo: view.topAnchor),
            h.view.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])
        h.didMove(toParent: self)
        host = h
        let width = view.bounds.width > 0 ? view.bounds.width : UIScreen.main.bounds.width
        let fit = h.sizeThatFits(in: CGSize(width: width, height: .greatestFiniteMagnitude))
        preferredContentSize = CGSize(width: width, height: ceil(fit.height))
    }
}
