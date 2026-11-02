# Switching on accounts (Apple, Google, email)

The sign-up page is built (`#/account`, `js/account.js`). It stays in "opens very soon" mode
until `js/config.js` has a Supabase URL and key. About 30 minutes, mostly clicking.

## 1. Supabase project (free)
1. Sign up at https://supabase.com → **New project**. Pick an **EU region** (e.g. Frankfurt):
   cycle data is health data under GDPR.
2. **SQL editor** → run:

```sql
create table public.cycle_data (
  user_id    uuid primary key references auth.users on delete cascade,
  data       jsonb  not null,
  updated_at bigint not null
);
alter table public.cycle_data enable row level security;
create policy "each woman reads and writes only her own row" on public.cycle_data
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- in-app "Delete account" (required by Apple when an app lets people sign up)
create function public.delete_my_account() returns void
  language sql security definer set search_path = '' as
$$ delete from auth.users where id = auth.uid(); $$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
```

3. **Project settings → API**: copy the *Project URL* and the *anon public* key into `js/config.js`.
4. **Authentication → URL configuration**: Site URL `https://elijanaru.github.io/under-the-skin/`,
   and add the same URL to *Redirect URLs* (plus `http://127.0.0.1:5173/` for testing).

## 2. Email + password
On by default (Authentication → Providers → Email). Keep "Confirm email" on, and set
*Minimum password length* to **8** (the app asks for 8).
For real launch, set your own SMTP (Authentication → Emails) so the emails come from your address
and aren't limited to a few per hour.

## 3. Google
1. https://console.cloud.google.com → new project → **APIs & Services → OAuth consent screen**
   (External, app name "Underskin", your support email).
2. **Credentials → Create credentials → OAuth client ID → Web application**.
   Authorised redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
3. Paste the Client ID and Secret into Supabase → Authentication → Providers → Google.

## 4. Apple (needs the paid Apple Developer account)
1. developer.apple.com → Certificates, IDs & Profiles → **Identifiers**: enable
   "Sign in with Apple" on your App ID, then create a **Services ID** (e.g. `app.undertheskin.web`),
   enable Sign in with Apple on it, domain `<your-project>.supabase.co`,
   return URL `https://<your-project>.supabase.co/auth/v1/callback`.
2. **Keys** → new key with Sign in with Apple → download the `.p8`.
3. Supabase → Authentication → Providers → Apple: Services ID, Team ID, Key ID and the `.p8`
   (Supabase turns it into the secret; Apple makes you renew it every 6 months).

## How it behaves
- The app still works fully without an account; nothing is uploaded unless she signs up and ticks the consent box.
- Every change is pushed to her row a moment after she logs it; on each open the newer copy wins.
- The first time a phone joins an account, the phone's logs and the cloud's logs are merged.
- "Delete account" erases her login and her cloud row (cascade). The copy on the phone stays.

## Before the App Store
- If the iPhone app is a web view wrapper, Google blocks sign-in inside embedded web views,
  and Apple prefers the native Sign in with Apple sheet. Both then need the native plugins of the
  wrapper (e.g. Capacitor) instead of the web redirect — tell Claude which wrapper you use.
- Update the App Store privacy label: "Health & Fitness" data, linked to the user, not used for tracking.

## Status (2 Nov 2026): switched on
- Supabase project `yscpgbmnaltfghjthbex` (Frankfurt), table + delete function created, URL and anon key in `js/config.js`.
- Apple: "Sign in with Apple" enabled on App ID `com.elijanaru.undertheskin`, `ios/App/App/App.entitlements`, Supabase Apple provider with that bundle ID (native only; web Apple needs a Services ID + .p8 key).
- Google: Cloud project "Underskin" (`skilled-tuner-513514-s8`), consent screen in production, Web + iOS client IDs in `js/config.js` and Supabase. The web client secret is not in Supabase yet (only needed for Google on the website).
- Native sign-in uses `@capgo/capacitor-social-login` + `signInWithIdToken` with a hashed nonce (`js/account.js`).
- Android Google sign-in still needs an Android OAuth client (package + SHA-1).
- Still to do: own SMTP sender (Supabase's built-in one is rate limited).
