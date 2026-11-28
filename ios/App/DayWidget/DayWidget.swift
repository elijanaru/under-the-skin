// Underskin home screen and lock screen widget (28 Nov 2026): her cycle day, phase, today's mode and one tip.
// The app writes the next 14 days into the shared app group (UTSWidgetPlugin in SceneDelegate.swift), already in her
// language, so the widget stays right for two weeks even if she doesn't open the app.
import WidgetKit
import SwiftUI
import UIKit

private let groupID = "group.com.elijanaru.undertheskin"

struct UDay: Codable {
    let d: String, n: Int, L: Int, ph: String, phn: String, mode: String, tip: String, sub: String, day: String, dl: String, today: String
    var say: String? = nil, work: String? = nil, teaN: String? = nil, cup: String? = nil, move: String? = nil, ease: String? = nil, moveT: String? = nil, easeT: String? = nil, tea: String? = nil, teaWhy: String? = nil
    static let sample = UDay(d: "", n: 12, L: 28, ph: "follicular", phn: "Follicular", mode: "Build", tip: "Train more, try something new.", sub: "Period in 16 days", day: "Day", dl: "Day 12", today: "Today", say: "Start new things", work: "Start new projects, brainstorm, learn, say yes to plans.", teaN: "Green tea", cup: "greentea", tea: "🍵 Green tea", teaWhy: "Calm energy and antioxidants as estrogen rises.")
}
struct UNow: Codable {
    static let sample = UNow(d: "", feel: "Calm · Good energy", ask: "How do you feel today?", check: "Tap to check in", feelT: "How you feel", teaT: "Your tea today", alerts: ["🌙 Late nights lately"], headsT: "Heads-up")
    let d: String; var feel: String? = nil, ask: String? = nil, check: String? = nil, feelT: String? = nil, teaT: String? = nil, alerts: [String]? = nil, headsT: String? = nil }
struct UPayload: Codable { let days: [UDay]; var now: UNow? = nil; let empty: String? }

private func loadPayload() -> UPayload? {
    guard let s = UserDefaults(suiteName: groupID)?.string(forKey: "uts.widget"), let data = s.data(using: .utf8) else { return nil }
    return try? JSONDecoder().decode(UPayload.self, from: data)
}

struct DayEntry: TimelineEntry { let date: Date; let day: UDay?; let empty: String; var now: UNow? = nil }

struct DayProvider: TimelineProvider {
    func placeholder(in context: Context) -> DayEntry { DayEntry(date: Date(), day: .sample, empty: "", now: .sample) }
    func getSnapshot(in context: Context, completion: @escaping (DayEntry) -> Void) {
        let e = entries()
        completion(e.first(where: { $0.day != nil }) ?? DayEntry(date: Date(), day: .sample, empty: "", now: .sample))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<DayEntry>) -> Void) {
        let e = entries()
        completion(Timeline(entries: e.isEmpty ? [DayEntry(date: Date(), day: nil, empty: loadPayload()?.empty ?? "Open Underskin to see your day")] : e, policy: .atEnd))
    }
    // one entry per day from today, switching at midnight; after the last known day it asks her to open the app
    private func entries() -> [DayEntry] {
        guard let p = loadPayload() else { return [] }
        let cal = Calendar.current, today = cal.startOfDay(for: Date()), empty = p.empty ?? "Open Underskin to see your day"
        let f = DateFormatter(); f.calendar = Calendar(identifier: .gregorian); f.locale = Locale(identifier: "en_US_POSIX"); f.timeZone = .current; f.dateFormat = "yyyy-MM-dd"
        var out: [DayEntry] = []
        for d in p.days {
            guard let dt = f.date(from: d.d) else { continue }
            let s = cal.startOfDay(for: dt)
            if s < today { continue }
            out.append(DayEntry(date: s == today ? Date() : s, day: d, empty: empty, now: p.now?.d == d.d ? p.now : nil))
        }
        if let last = out.last, let next = cal.date(byAdding: .day, value: 1, to: cal.startOfDay(for: last.date)) { out.append(DayEntry(date: next, day: nil, empty: empty)) }
        return out
    }
}

// ---------- look: misty blush page, palm-leaf ink, a soft tint of her phase ----------
extension Color { init(hex h: UInt32) { self.init(red: Double((h >> 16) & 0xff) / 255, green: Double((h >> 8) & 0xff) / 255, blue: Double(h & 0xff) / 255) } }
private let ink = Color(hex: 0x304023)
private func accent(_ ph: String) -> Color {
    switch ph { case "menstrual": return Color(hex: 0xc2577a); case "follicular": return Color(hex: 0x6c823e); case "ovulatory": return Color(hex: 0xb9862f); default: return Color(hex: 0x8e6fa8) }
}
private struct Mist: View {
    let ph: String
    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(hex: 0xfcf5f7), Color(hex: 0xf6e8eb), Color(hex: 0xeef0e3)], startPoint: .top, endPoint: .bottom)
            RadialGradient(colors: [accent(ph).opacity(0.22), .clear], center: .topTrailing, startRadius: 2, endRadius: 150)
            RadialGradient(colors: [Color.white.opacity(0.7), .clear], center: .bottomLeading, startRadius: 2, endRadius: 120)
        }
    }
}
private extension View {
    @ViewBuilder func widgetBack<B: View>(_ b: B) -> some View {
        if #available(iOSApplicationExtension 17.0, *) { containerBackground(for: .widget) { b } } else { padding(14).background(b) }
    }
}

// small sparkles drifting around the lotus, fixed positions so the widget never flickers
private struct Sparkles: View {
    let c: Color
    let pts: [(CGFloat, CGFloat, CGFloat)]
    var body: some View {
        GeometryReader { g in
            ForEach(0..<pts.count, id: \.self) { i in
                Image(systemName: "sparkle").font(.system(size: pts[i].2, weight: .light)).foregroundColor(c.opacity(0.55))
                    .position(x: g.size.width * pts[i].0, y: g.size.height * pts[i].1)
            }
        }.allowsHitTesting(false)
    }
}
private struct Lotus: View {
    let w: CGFloat
    var body: some View {
        Image("lotus").resizable().interpolation(.high).aspectRatio(contentMode: .fit).frame(width: w)
            .shadow(color: Color(hex: 0xe6b1c4).opacity(0.55), radius: 8, y: 2)
    }
}
// her tea as the app's own 3D cup render (28 Nov 2026, her ask: a picture of the tea, not just words)
private struct TeaCup: View {
    let cup: String?
    let size: CGFloat
    var body: some View {
        if let c = cup, UIImage(named: "cup-\(c)") != nil {
            Image("cup-\(c)").resizable().interpolation(.high).aspectRatio(contentMode: .fit).frame(width: size, height: size)
                .shadow(color: ink.opacity(0.18), radius: 4, y: 3)
        }
    }
}
private func hasCup(_ d: UDay) -> Bool { if let c = d.cup { return UIImage(named: "cup-\(c)") != nil } else { return false } }
private struct Eyebrow: View {
    let t: String
    var body: some View { Text(t.uppercased()).font(.system(size: 10, weight: .medium)).tracking(1.2).foregroundColor(ink.opacity(0.5)).lineLimit(1) }
}
// the pearl glass pill with her mode: Slow down, Build, Push, Steady...
private struct ModePill: View {
    let d: UDay
    var size: CGFloat = 12
    var body: some View {
        HStack(spacing: 5) {
            Circle().fill(accent(d.ph)).frame(width: 6, height: 6)
            Text(d.mode).font(.system(size: size, weight: .semibold)).foregroundColor(ink).lineLimit(1)
        }
        .padding(.horizontal, 9).padding(.vertical, 4)
        .background(Capsule().fill(Color.white.opacity(0.72)))
        .overlay(Capsule().stroke(accent(d.ph).opacity(0.28), lineWidth: 0.6))
    }
}
private struct Glass<C: View>: View {
    var pad: CGFloat = 11
    @ViewBuilder let content: C
    var body: some View {
        content.padding(pad).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .background(RoundedRectangle(cornerRadius: 16, style: .continuous).fill(Color.white.opacity(0.62)))
            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(Color.white.opacity(0.9), lineWidth: 0.7))
    }
}
private struct BigDay: View {
    let d: UDay
    var size: CGFloat = 46
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Eyebrow(t: d.day)
            Text("\(d.n)").font(.system(size: size, weight: .thin, design: .rounded)).monospacedDigit().foregroundColor(ink).minimumScaleFactor(0.6).lineLimit(1)
            Text(d.phn).font(.system(size: 13, weight: .medium)).foregroundColor(accent(d.ph)).lineLimit(1).minimumScaleFactor(0.8)
        }
    }
}

private func sayLine(_ d: UDay) -> String {
    guard let s = d.say, !s.isEmpty else { return d.sub }
    return s.lowercased().hasPrefix(d.mode.lowercased()) ? d.sub : s
}
// small: only her day, her mode and one short line on how to be today
private struct SmallView: View {
    let d: UDay
    var body: some View {
        ZStack(alignment: .topTrailing) {
            Lotus(w: 74).offset(x: 14, y: -6).opacity(0.95)
            Sparkles(c: accent(d.ph), pts: [(0.62, 0.06, 7), (0.97, 0.42, 6), (0.5, 0.36, 5)])
            VStack(alignment: .leading, spacing: 0) {
                BigDay(d: d)
                Spacer(minLength: 4)
                ModePill(d: d, size: 11)
                Text(sayLine(d)).font(.system(size: 12, weight: .regular)).foregroundColor(ink.opacity(0.78)).lineLimit(2).minimumScaleFactor(0.85).padding(.top, 5)
            }.frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

// medium: lotus and day on the left, today's mode, how to be and her tea on the right
private struct MediumView: View {
    let d: UDay
    var body: some View {
        HStack(alignment: .center, spacing: 12) {
            ZStack {
                Sparkles(c: accent(d.ph), pts: [(0.12, 0.1, 6), (0.9, 0.2, 7), (0.85, 0.9, 5)])
                VStack(spacing: 2) {
                    Lotus(w: 92)
                    Text("\(d.n)").font(.system(size: 36, weight: .thin, design: .rounded)).monospacedDigit().foregroundColor(ink).lineLimit(1)
                    Text("\(d.day) · \(d.phn)").font(.system(size: 11, weight: .medium)).foregroundColor(accent(d.ph)).lineLimit(1).minimumScaleFactor(0.7)
                }
            }.frame(width: 104)
            VStack(alignment: .leading, spacing: 6) {
                HStack { Eyebrow(t: d.today); Spacer(minLength: 0); ModePill(d: d, size: 11) }
                Text(d.say ?? d.sub).font(.system(size: 16, weight: .medium)).foregroundColor(ink).lineLimit(1).minimumScaleFactor(0.75)
                Text(d.tip).font(.system(size: 12, weight: .regular)).foregroundColor(ink.opacity(0.75)).lineSpacing(1).lineLimit(2).minimumScaleFactor(0.85)
                Spacer(minLength: 0)
                if hasCup(d) {
                    HStack(spacing: 8) {
                        TeaCup(cup: d.cup, size: 38)
                        Text(d.teaN ?? d.tea ?? "").font(.system(size: 13, weight: .medium)).foregroundColor(ink).lineLimit(1).minimumScaleFactor(0.75)
                        Spacer(minLength: 0)
                    }
                    .padding(.leading, 4).padding(.trailing, 10).padding(.vertical, 1)
                    .background(Capsule().fill(Color.white.opacity(0.7)))
                } else if let t = d.tea {
                    HStack(spacing: 6) {
                        Text(t).font(.system(size: 12, weight: .medium)).foregroundColor(ink).lineLimit(1).minimumScaleFactor(0.8)
                        Spacer(minLength: 0)
                    }
                    .padding(.horizontal, 10).padding(.vertical, 6)
                    .background(Capsule().fill(Color.white.opacity(0.7)))
                }
            }
        }
    }
}

// large: the whole morning at a glance, lotus on top, then today's card, how she feels, her tea, heads-ups
private struct LargeView: View {
    let d: UDay
    let now: UNow?
    var body: some View {
        ZStack(alignment: .top) {
            Sparkles(c: accent(d.ph), pts: [(0.12, 0.05, 8), (0.88, 0.04, 6), (0.22, 0.2, 5), (0.8, 0.19, 7)])
            VStack(spacing: 8) {
                VStack(spacing: 0) {
                    Lotus(w: 118)
                    HStack(alignment: .firstTextBaseline, spacing: 6) {
                        Text(d.day).font(.system(size: 15, weight: .light)).foregroundColor(ink.opacity(0.7))
                        Text("\(d.n)").font(.system(size: 34, weight: .thin, design: .rounded)).monospacedDigit().foregroundColor(ink)
                        Text("· \(d.phn)").font(.system(size: 15, weight: .medium)).foregroundColor(accent(d.ph))
                    }.lineLimit(1).minimumScaleFactor(0.7)
                    Text(d.sub).font(.system(size: 11, weight: .regular)).foregroundColor(ink.opacity(0.6)).lineLimit(1)
                }
                Glass {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack { Eyebrow(t: d.today); Spacer(minLength: 0); ModePill(d: d, size: 11) }
                        Text(d.say ?? d.sub).font(.system(size: 15, weight: .medium)).foregroundColor(ink).lineLimit(1).minimumScaleFactor(0.8)
                        Text(d.work ?? d.tip).font(.system(size: 12, weight: .regular)).foregroundColor(ink.opacity(0.75)).lineLimit(2).minimumScaleFactor(0.85)
                    }
                }
                HStack(spacing: 8) {
                    Link(destination: URL(string: "underskin://open#/log")!) {
                        Glass(pad: 10) {
                            VStack(alignment: .leading, spacing: 3) {
                                Eyebrow(t: now?.feelT ?? "How you feel")
                                if let f = now?.feel, !f.isEmpty {
                                    Text(f).font(.system(size: 13, weight: .medium)).foregroundColor(ink).lineLimit(2).minimumScaleFactor(0.8)
                                } else {
                                    Text(now?.ask ?? "How do you feel today?").font(.system(size: 13, weight: .medium)).foregroundColor(ink).lineLimit(2).minimumScaleFactor(0.8)
                                    Text(now?.check ?? "Tap to check in").font(.system(size: 10, weight: .regular)).foregroundColor(accent(d.ph)).lineLimit(1)
                                }
                            }
                        }
                    }
                    Link(destination: URL(string: "underskin://open#/do/tea")!) {
                        Glass(pad: 10) {
                            if hasCup(d) {
                                VStack(alignment: .leading, spacing: 2) {
                                    Eyebrow(t: now?.teaT ?? "Your tea today")
                                    HStack(alignment: .center, spacing: 4) {
                                        Text(d.teaN ?? "").font(.system(size: 13, weight: .medium)).foregroundColor(ink).lineLimit(2).minimumScaleFactor(0.75)
                                        Spacer(minLength: 0)
                                        TeaCup(cup: d.cup, size: 50)
                                    }
                                }
                            } else {
                                VStack(alignment: .leading, spacing: 3) {
                                    Eyebrow(t: now?.teaT ?? "Your tea today")
                                    Text(d.tea ?? "").font(.system(size: 13, weight: .medium)).foregroundColor(ink).lineLimit(1).minimumScaleFactor(0.75)
                                    Text(d.teaWhy ?? "").font(.system(size: 10, weight: .regular)).foregroundColor(ink.opacity(0.65)).lineLimit(2).minimumScaleFactor(0.85)
                                }
                            }
                        }
                    }
                }.fixedSize(horizontal: false, vertical: true)
                if let al = now?.alerts, !al.isEmpty {
                    VStack(alignment: .leading, spacing: 3) {
                        Eyebrow(t: now?.headsT ?? "Heads-up")
                        ForEach(0..<min(al.count, 2), id: \.self) { i in
                            Text(al[i]).font(.system(size: 12, weight: .regular)).foregroundColor(ink).lineLimit(1).minimumScaleFactor(0.8)
                        }
                    }.frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 4)
                } else if let mv = d.move, let ez = d.ease {
                    // no heads-up today: how to move and what to go easy on
                    HStack(alignment: .top, spacing: 8) {
                        VStack(alignment: .leading, spacing: 2) {
                            Eyebrow(t: d.moveT ?? "Move")
                            Text(mv).font(.system(size: 12, weight: .medium)).foregroundColor(ink).lineLimit(1).minimumScaleFactor(0.8)
                        }.frame(maxWidth: .infinity, alignment: .leading)
                        VStack(alignment: .leading, spacing: 2) {
                            Eyebrow(t: d.easeT ?? "Go easy on")
                            Text(ez).font(.system(size: 12, weight: .medium)).foregroundColor(ink).lineLimit(1).minimumScaleFactor(0.8)
                        }.frame(maxWidth: .infinity, alignment: .leading)
                    }.padding(.horizontal, 6)
                }
                Spacer(minLength: 0)
            }
        }
    }
}

struct DayWidgetView: View {
    @Environment(\.widgetFamily) var family
    let e: DayEntry
    var body: some View {
        if let d = e.day {
            switch family {
            case .accessoryCircular:
                Gauge(value: Double(min(max(d.n, 1), max(d.L, 2))), in: 1...Double(max(d.L, 2))) { Text(d.day) } currentValueLabel: { Text("\(d.n)").monospacedDigit() }
                    .gaugeStyle(.accessoryCircular).widgetBack(Color.clear)
            case .accessoryRectangular:
                VStack(alignment: .leading, spacing: 1) {
                    Text("\(d.dl) · \(d.phn)").font(.headline).lineLimit(1).minimumScaleFactor(0.8)
                    Text("\(d.mode) · \(d.say ?? "")").font(.body).lineLimit(1).minimumScaleFactor(0.8)
                    Text(d.sub).font(.caption).foregroundStyle(.secondary).lineLimit(1)
                }.frame(maxWidth: .infinity, alignment: .leading).widgetBack(Color.clear)
            case .accessoryInline:
                Text("\(d.dl) · \(d.phn) · \(d.mode)").widgetBack(Color.clear)
            case .systemMedium:
                MediumView(d: d).widgetBack(Mist(ph: d.ph))
            case .systemLarge:
                LargeView(d: d, now: e.now).widgetBack(Mist(ph: d.ph))
            default:
                SmallView(d: d).widgetBack(Mist(ph: d.ph))
            }
        } else {
            switch family {
            case .accessoryCircular, .accessoryRectangular, .accessoryInline:
                Text("Underskin").widgetBack(Color.clear)
            default:
                VStack(alignment: .leading, spacing: 6) {
                    Lotus(w: 70)
                    Spacer(minLength: 0)
                    Text(e.empty).font(.system(size: 14, weight: .medium)).foregroundColor(ink).lineLimit(3)
                }.frame(maxWidth: .infinity, alignment: .leading).widgetBack(Mist(ph: "luteal"))
            }
        }
    }
}

@main
struct DayWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "UTSDay", provider: DayProvider()) { e in DayWidgetView(e: e) }
            .configurationDisplayName("Underskin")
            .description("Your day, your phase, how to be today and your tea.")
            .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryCircular, .accessoryRectangular, .accessoryInline])
    }
}
