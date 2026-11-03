# Store listing · Underskin

Copy-paste text for App Store Connect and Google Play Console. Every field is within the store's limit.

## Screenshots (ready)
- **iPhone 6.9"** (1320 × 2868): `store/ios-6.9/` (6 images, upload in this order). App Store Connect slot "iPhone with Dynamic Island (medium)": `store/ios-6.3/` (1206 × 2622 JPG, uploaded)
- **Android phone** (1320 × 2640): `store/android-phone/` (same 5 images, cropped to Google's 2:1 maximum)
- **Google feature graphic** (1024 × 500): `store/feature-graphic-1024x500.png` (source: `store/source/feature-graphic.html`)
- **Google app icon** (512 × 512): `icons/icon-512.png`
- **Android upload file:** `release/under-the-skin-1.0.aab` (versionCode 1, app v199)

---

## Apple App Store

| Field | Text |
|---|---|
| Name (30) | Underskin: Cycle & Glow |
| Subtitle (30) | Know when to push & slow down |
| Category | Health & Fitness (secondary: Lifestyle) |
| Keywords (100) | period,tracker,hormones,ovulation,PMS,luteal,TCM,moon,women,energy,wellness,syncing,calendar,fertility |
| Support URL | https://elijanaru.github.io/under-the-skin/support.html |
| Privacy Policy URL | https://elijanaru.github.io/under-the-skin/privacy.html |
| Copyright | 2026 + your legal name or company (as on your developer account) |
| Price | Free |

**Promotional text (170)**
> You're not meant to run like a man. Track your cycle, see your hormones day by day, and know when to push and when to slow down. Same ambition, less burnout.

**Description**
> Underskin is a period and hormone tracker for ambitious women who are tired of running at the same pace every single day.
>
> A man's hormones repeat roughly every 24 hours. Yours move through a cycle of about 28 days. When you plan with that rhythm instead of against it, you sleep better, stress less and feel like yourself again. That's the glow people notice.
>
> KNOW WHEN TO PUSH AND WHEN TO SLOW DOWN
> • Push or slow down: a clear answer every day, with what to lean into and what to go easy on
> • Your cycle in Apple or Google Calendar: one word for each part of your cycle (Gym, Model, Party, Focus, Rest) for the next six months
>
> TRACK YOUR CYCLE
> • One-tap period logging and a calm, clear calendar
> • Predictions for your next period and egg release that learn from your cycles
> • Symptoms, mood, energy and notes in seconds
>
> UNDERSTAND YOUR HORMONES
> • Estrogen, progesterone and testosterone, drawn across your cycle with where you are today
> • Plain-language explanations with evidence labels (Strong / Some / Emerging / Traditional)
>
> EAT WITH YOUR CYCLE AND THE SEASON
> • Natural, whole-food ideas for each phase
> • What's in season where you live, with simple seasonal recipes
> • Warming foods for your period, inspired by Traditional Chinese Medicine
>
> MORE
> • Moon, zodiac and five-element insights
> • Share your cycle with a partner, so they know when to bring tea and when to plan the adventure
> • Private by design: no account needed, and without one your data stays on your phone. An optional account keeps a private backup. No ads, no tracking, no selling data.
>
> Underskin is not a contraceptive and does not diagnose or treat any condition.

**Age rating questionnaire**: answer "None" to everything except *Medical or Treatment Information* → **Infrequent/Mild**. Apple then shows the resulting rating (expect 13+ or 16+; either is fine).

**App Privacy ("nutrition label")**
- **Published (accounts on, 2 Nov 2026):** Name, Email Address, Health, Photos or Videos, Other User Content, User ID. All *App Functionality*, linked to the user, **not** tracking.

**App Review notes**
> No login is needed. Tap Enter, type any first name and follow the short setup (pick any recent date as the last period). Without an account, all data is stored only on the device; signing in is optional and only adds a private backup. The partner-share and "send love" features use links the user shares themselves.

**Export compliance**: already answered in the app (`ITSAppUsesNonExemptEncryption = NO`), so App Store Connect won't ask.

---

## Google Play

| Field | Text |
|---|---|
| App name (30) | Underskin: Cycle & Glow |
| Short description (80) | Period & hormone tracker: know when to push and when to slow down. |
| Full description | Same as the Apple description above |
| Category | Health & Fitness |
| Contact email | elumiebusiness@gmail.com |
| Privacy policy | https://elijanaru.github.io/under-the-skin/privacy.html |

- **Content rating** (IARC questionnaire): category *Reference, News or Educational* or *Health*. No violence, sex, language, drugs or gambling; no user-to-user chat. Expected: **Everyone / PEGI 3** or Teen.
- **Data safety, while accounts are off:** collects **Personal info → Name** (optional, app functionality, sent through the "send love" relay); nothing else; not shared. Update it to the `LAUNCH.md` answers when accounts go live.
- **Health apps declaration:** Period tracking. Not a medical device, not a contraceptive.
- **Ads:** No. **Target audience:** 16 and over.
