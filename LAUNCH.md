# Launching Under the Skin on the App Store and Google Play

Everything that can be done in code is done. What's left needs **your** accounts, because the apps are
published in your name. Do the parts in order; each one says how long it takes.

---

## Part 1 · Switch on accounts (30 min, free)

Accounts let women save their data. Full click-by-click details are in `ACCOUNTS.md`; the short version:

1. Go to **supabase.com** → *Start your project* → sign up with GitHub or email.
2. **New project**: name `under-the-skin`, choose a strong database password (save it in your password
   manager), region **Central EU (Frankfurt)**. Wait ~2 minutes.
3. Left menu → **SQL Editor** → *New query* → paste the SQL block from `ACCOUNTS.md` → **Run**.
4. Left menu → **Project Settings → API**. Copy two things and send them to Claude:
   - **Project URL** (looks like `https://abcdxyz.supabase.co`)
   - **anon public** key (a long text starting with `eyJ`). This one is safe to share.
   - ⚠️ Never send or paste the **service_role** key anywhere.
5. **Authentication → URL Configuration**: Site URL `https://elijanaru.github.io/under-the-skin/`.
6. **Authentication → Providers → Email**: minimum password length **8**.

Claude then puts the URL and key into the app and tests sign-up for real.
Apple and Google sign-in (sections 3–4 of `ACCOUNTS.md`) can come later. Email works on its own.

---

## Part 2 · Developer accounts (1–2 days of waiting)

| Store | Where | Cost | Notes |
|---|---|---|---|
| Apple App Store | developer.apple.com/programs → *Enroll* | 99 USD / year | Needs your Apple ID with two-factor sign-in. As an individual, approval takes 1–2 days. |
| Google Play | play.google.com/console → *Create account* | 25 USD once | Needs ID verification. New personal accounts must run a **closed test with 12 testers for 14 days** before going public, so start early. |

If you already sent something to Apple earlier, check developer.apple.com → *Account*: if you're enrolled,
skip the Apple row.

---

## Part 3 · Install the build tools (1–2 h, mostly downloading)

- **Xcode** (for iPhone): Mac App Store → search "Xcode" → Get. Open it once and accept the licence.
  Then in Terminal run `sudo xcode-select -s /Applications/Xcode.app` (asks for your Mac password).
- **Android Studio** (for Android): developer.android.com/studio → download → open → follow the setup
  wizard (it downloads the Android SDK).

---

## Part 4 · Build and upload

The app project is ready in this folder (`ios/` and `android/`). Every time the app changes:

```
npm run ios        # copies the latest app into the iPhone project and opens Xcode
npm run android    # same for Android Studio
```

**iPhone (in Xcode)**
1. Left: click **App** → *Signing & Capabilities* → Team: your Apple developer account.
2. Bundle identifier: `com.elijanaru.undertheskin` (change it here *and* in `capacitor.config.json` if you want another).
3. Plug in your iPhone or pick a simulator → ▶ to try it.
4. Menu **Product → Archive** → *Distribute App* → *App Store Connect* → Upload.
5. On **appstoreconnect.apple.com** → *My Apps* → **+** → New app → fill in the listing, pick the upload, submit.

**Android: already built**
- The signed upload file is ready: `release/under-the-skin-1.0.aab`.
- Its upload key lives in `~/Documents/UnderTheSkin-keys/` (key file + password file).
  ⚠️ Back up that folder now (e.g. to iCloud Drive or a USB stick) and save the password in your password
  manager. Use **Play App Signing** when Google asks (the default): then a lost upload key can be reset.
- To rebuild after changes: `npm run sync`, then in `android/` run `./gradlew bundleRelease`
  (or Android Studio → Build → Generate Signed Bundle).
- On **play.google.com/console** → *Create app* → *Testing → Closed testing* → upload the `.aab`.
- Each new upload needs a higher `versionCode` in `android/app/build.gradle` (1 → 2 → 3…).

---

## Part 5 · Store forms (copy these answers)

**Links both stores ask for**
- Privacy policy: `https://elijanaru.github.io/under-the-skin/privacy.html`
- Support: `https://elijanaru.github.io/under-the-skin/support.html`
- Category: Health & Fitness · Age rating: 12+ (Apple) / Teen (Google) · Contains ads: No

**Apple · App Privacy ("nutrition label")**
- Do you collect data? **Yes**
- **Health & Fitness → Health**: collected · *App Functionality* · **Linked to the user** · **Not** used for tracking
- **Contact Info → Email Address**: collected · *App Functionality* · Linked to the user · Not used for tracking
- **Contact Info → Name**: collected · *App Functionality* · Linked · Not tracking
- **User Content → Photos** (profile photo, optional): collected · *App Functionality* · Linked · Not tracking
- **Identifiers → User ID**: collected · *App Functionality* · Linked · Not tracking
- Everything else: **not collected**. Tracking: **No**.
- Note for review: "Health data is only collected if the user creates an optional account; without an account all data stays on the device."

**Google Play · Data safety**
- Does your app collect or share user data? **Yes, collects** · Shares: **No**
- Encrypted in transit: **Yes** · Users can request deletion: **Yes** (in-app "Delete account" + email)
- Data types, all *Collected*, *Optional*, purpose **App functionality** and **Account management**:
  - Personal info → **Name**, **Email address**, **User IDs**
  - Health and fitness → **Health info**
  - Photos and videos → **Photos** (profile photo)
- Google also asks for an **account deletion URL**: use the support page (it explains Profile → Account → Delete account).

**Google Play · Health apps declaration**
- Choose *Period tracking / reproductive health*. Confirm it is not a medical device and not a contraceptive.

---

## Before you press submit
- [ ] Replace or get permission for the menstrual-phase photo (it carries the **@softlyevolve** watermark).
- [ ] App icon: the store icon is upscaled from a 512 px image, and its source isn't recorded. Use your own
      1024×1024 original (put it at `assets/icon-only.png`, then run `npx capacitor-assets generate`).
- [ ] Screenshots: iPhone 6.9" (1320×2868) and Android phone. Claude can make these for you.
- [ ] Say **"publish"** to Claude so the website (and the privacy page) go live first.
