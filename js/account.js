// Accounts and cloud sync: Sign in with Apple, Google, or email + password (Supabase).
// Local-first: the app works fully without an account; signing in only adds a private copy in the cloud.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
const TABLE = 'cycle_data';
let sb = null, ready = null, user = null, told; // told = the user id subscribers last heard about
const subs = new Set();
const tell = ev => { told = user?.id; subs.forEach(f => f(user, ev)); };

export const configured = () => !!(SUPABASE_URL && SUPABASE_ANON_KEY);
export const currentUser = () => user;
export function onUser(f) { subs.add(f); return () => subs.delete(f); }
// In the store apps Apple/Google need their native sign-in plugins (not set up yet), so only email shows there;
// email links open the public website.
const NATIVE = !!window.Capacitor?.isNativePlatform?.();
export const oauthOK = () => !NATIVE;
const redirect = () => (NATIVE ? 'https://elijanaru.github.io/under-the-skin/' : location.origin + location.pathname);

// The library is only fetched when someone has (or wants) an account, so the app stays light.
function client() {
  if (!configured()) return Promise.reject(new Error('Accounts are not open yet.'));
  if (!ready) ready = import(LIB).then(async ({ createClient }) => {
    sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true, storageKey: 'uts.auth' } });
    // subscribe before awaiting anything: the ?code= exchange fires SIGNED_IN / PASSWORD_RECOVERY on a timer
    // right after init, and a later subscription would miss it (password reset would never open)
    sb.auth.onAuthStateChange((ev, s) => {
      user = s?.user || null;
      if (told !== user?.id || ev === 'PASSWORD_RECOVERY') tell(ev);
    });
    const { data } = await sb.auth.getSession();
    user = data.session?.user || null;
    // drop the one-time ?code= from the address bar after an Apple/Google return
    if (new URLSearchParams(location.search).has('code')) history.replaceState(null, '', location.pathname + location.hash);
    return sb;
  }).catch(e => { ready = null; throw e; }); // offline on first try: let a later attempt load the library again
  return ready;
}

// Start quietly on open if this device has signed in before, or is coming back from Apple/Google.
export function boot() {
  if (!configured()) return Promise.resolve(null);
  let had = false; try { had = !!localStorage.getItem('uts.auth'); } catch {}
  const back = new URLSearchParams(location.search).has('code');
  if (!had && !back) return Promise.resolve(null);
  return client().then(() => { if (user && told !== user.id) tell('BOOT'); return user; }).catch(() => null);
}

const fail = error => { if (error) throw new Error(nice(error.message)); };
function nice(m = '') {
  if (/invalid login/i.test(m)) return 'Email or password is not right.';
  if (/already registered/i.test(m)) return 'This email already has an account. Sign in instead.';
  if (/password.*(6|characters)/i.test(m)) return 'Choose a password with at least 8 characters.';
  if (/email not confirmed/i.test(m)) return 'Please confirm your email first. Check your inbox.';
  if (/rate limit/i.test(m)) return 'Too many tries. Wait a minute and try again.';
  return m || 'Something went wrong. Try again.';
}

export async function withProvider(provider) {
  const c = await client();
  const { error } = await c.auth.signInWithOAuth({ provider, options: { redirectTo: redirect() } });
  fail(error); // the page now leaves for Apple/Google and comes back signed in
}
export async function signUp(email, password) {
  const c = await client();
  const { data, error } = await c.auth.signUp({ email, password, options: { emailRedirectTo: redirect() } });
  fail(error);
  return { confirm: !data.session }; // true when the project asks for email confirmation first
}
export async function signIn(email, password) {
  const c = await client();
  const { error } = await c.auth.signInWithPassword({ email, password });
  fail(error);
}
export async function resetPassword(email) {
  const c = await client();
  const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo: redirect() });
  fail(error);
}
export async function setPassword(password) {
  const c = await client();
  const { error } = await c.auth.updateUser({ password });
  fail(error);
}
// supabase keeps the session when the sign-out request fails (offline), so report it instead of pretending
export async function signOut() { const c = await client(); const { error } = await c.auth.signOut(); fail(error); user = null; told = undefined; }
// Removes the account and, through the cascade, every byte of cloud data. The copy on this phone stays.
export async function deleteAccount() {
  const c = await client();
  const { error } = await c.rpc('delete_my_account');
  fail(error);
  const r = await c.auth.signOut({ scope: 'local' }).catch(e => ({ error: e }));
  if (r?.error) { try { localStorage.removeItem('uts.auth'); } catch {} } // the login is gone; never restore it on the next open
  user = null; told = undefined;
}

export async function pull() {
  if (!user) return null;
  const c = await client();
  const { data, error } = await c.from(TABLE).select('data, updated_at').eq('user_id', user.id).maybeSingle();
  fail(error);
  return data;
}
export async function push(state) {
  if (!user || !state) return;
  const c = await client();
  const { error } = await c.from(TABLE).upsert({ user_id: user.id, data: state, updated_at: state.updatedAt || Date.now() });
  fail(error);
}
