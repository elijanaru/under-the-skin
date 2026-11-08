# Supabase email templates

Pasted into Supabase → Authentication → Emails. The app signs in with a 6-digit code (no passwords), so both emails show `{{ .Token }}`.

| Template | Subject | Body |
|---|---|---|
| Magic Link | `Your Underskin code: {{ .Token }}` | `code.html` |
| Confirm signup | `Welcome to Underskin: your code {{ .Token }}` | `confirm-signup.html` |

Set up 8 Nov 2026: custom SMTP via Resend (`smtp.resend.com`, port 465, user `resend`, sender `login@undertheskin.life`, name Underskin, EU region; DNS records `resend._domainkey`, `send`, `rsend` in Namecheap). Email OTP length is 6 (Sign In / Providers → Email) to match the app; email rate limit 100 an hour.
