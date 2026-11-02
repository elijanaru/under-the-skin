// Account server (Supabase). Fill both in to switch accounts on — see ACCOUNTS.md.
// The anon key is public by design; row-level security keeps each woman's data readable only by her.
export const SUPABASE_URL = 'https://yscpgbmnaltfghjthbex.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzY3BnYm1uYWx0ZmdoanRoYmV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2Mjc0ODEsImV4cCI6MjEwOTIwMzQ4MX0.-Id0Cd5FsiPuk02NGvmXHirQ-y73jvgn27CfyoU-qmU';

// Google sign-in client IDs (public, from Google Cloud → Credentials). The web one is also the server's audience.
export const GOOGLE_WEB_CLIENT_ID = '883575718064-9ip5a33hlilu4krpmt7plq17fnceg6t8.apps.googleusercontent.com';
export const GOOGLE_IOS_CLIENT_ID = '883575718064-7vq25j7690mb819gaui67eq3ee5k11lj.apps.googleusercontent.com';
// Providers that work on the website too (needs the Google client secret / Apple Services ID in Supabase).
export const WEB_OAUTH = [];
