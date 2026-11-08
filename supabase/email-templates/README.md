# Supabase email templates

Pasted into Supabase → Authentication → Emails. The app signs in with a 6-digit code (no passwords), so both emails show `{{ .Token }}`.

| Template | Subject | Body |
|---|---|---|
| Magic Link | `Your Underskin code: {{ .Token }}` | `code.html` |
| Confirm signup | `Welcome to Underskin: your code {{ .Token }}` | `confirm-signup.html` |
