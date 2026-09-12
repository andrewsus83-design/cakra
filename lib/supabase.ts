// Dependency-free Supabase client for the static-export member app.
// Supabase Auth (GoTrue) + PostgREST are plain HTTPS APIs, so we talk to them with fetch —
// no npm package, tiny bundle, works in `output: "export"`. Session lives in localStorage and
// auto-refreshes. The anon key is public by design; all access is enforced by RLS + the JWT.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const LS_KEY = "cakra_session";

export type SupaUser = { id: string; email: string };
export type Session = { access_token: string; refresh_token: string; expires_at: number; user: SupaUser };

export const supabaseReady = Boolean(URL && ANON);

// Admin allowlist for the internal backend (cakra.xyz/admin). Hardcoded for now; move to a
// `profiles.role` column when there is more than one admin.
export const ADMIN_EMAILS = ["andrewsus83@gmail.com"];
export const isAdmin = (email?: string) => !!email && ADMIN_EMAILS.some((e) => e.toLowerCase() === email.toLowerCase());

// Normalizes an Indonesian phone number to E.164 digits (62…) for wa.me links. "0812…"→"62812…",
// bare "812…"→"62812…", already-"62…"/"+62…" kept. Returns "" for empty/garbage.
export function toWaE164(raw?: string): string {
  const d = String(raw || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("62")) return d;
  if (d.startsWith("0")) return "62" + d.slice(1);
  if (d.startsWith("8")) return "62" + d;
  return d;
}

function save(s: Session | null) {
  try { s ? localStorage.setItem(LS_KEY, JSON.stringify(s)) : localStorage.removeItem(LS_KEY); } catch {}
}
function load(): Session | null {
  try { const r = localStorage.getItem(LS_KEY); return r ? (JSON.parse(r) as Session) : null; } catch { return null; }
}
function toSession(d: any): Session {
  return {
    access_token: d.access_token,
    refresh_token: d.refresh_token,
    expires_at: Date.now() + (d.expires_in || 3600) * 1000,
    user: { id: d.user?.id, email: d.user?.email },
  };
}

async function authPost(path: string, body: any): Promise<any> {
  const r = await fetch(`${URL}/auth/v1/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error_description || data.msg || data.message || `Gagal (${r.status})`);
  return data;
}

export const auth = {
  getSession: load,
  async signIn(email: string, password: string): Promise<Session> {
    const d = await authPost("token?grant_type=password", { email, password });
    const s = toSession(d); save(s); return s;
  },
  // Returns a Session when the project has email-confirmation OFF (instant login),
  // or null when a confirmation email was sent (no session yet).
  async signUp(email: string, password: string): Promise<Session | null> {
    const d = await authPost("signup", { email, password });
    if (d.access_token) { const s = toSession(d); save(s); return s; }
    return null;
  },
  signOut() { save(null); },
  async refresh(): Promise<Session | null> {
    const cur = load(); if (!cur) return null;
    try {
      const r = await fetch(`${URL}/auth/v1/token?grant_type=refresh_token`, { method: "POST", headers: { "Content-Type": "application/json", apikey: ANON }, body: JSON.stringify({ refresh_token: cur.refresh_token }) });
      if (r.ok) { const d = await r.json(); const s = toSession(d); save(s); return s; }
      // Only a definitive auth rejection (bad/expired refresh token) logs the user out. Transient
      // 5xx / network failures keep the stored session so a blip doesn't sign the agent out.
      if (r.status === 400 || r.status === 401) { save(null); return null; }
      return cur;
    } catch { return cur; }
  },
  // Sends a password-reset email via the send-reset Edge Function (Resend), which lands on
  // /reset?t=<token_hash>. Always resolves (the function returns 200 regardless) so the UI shows the
  // same "check your email" confirmation for any address — no account enumeration.
  async recover(email: string): Promise<void> {
    const reset_base = typeof window !== "undefined" ? `${window.location.origin}/reset` : "https://cakra.xyz/reset";
    await fetch(`${URL}/functions/v1/send-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
      body: JSON.stringify({ email, reset_base }),
    }).catch(() => {});
  },
  // Exchanges a recovery token_hash (from the reset link's ?t=) for a recovery session access-token.
  async verifyRecovery(tokenHash: string): Promise<string> {
    const r = await fetch(`${URL}/auth/v1/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON },
      body: JSON.stringify({ type: "recovery", token_hash: tokenHash }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.access_token) throw new Error(d.error_description || d.msg || d.message || "Link reset tidak valid atau sudah kedaluwarsa.");
    return d.access_token as string;
  },
  // Sets a new password using a recovery access-token (from verifyRecovery, or the link's URL hash).
  async updatePassword(accessToken: string, password: string): Promise<void> {
    const r = await fetch(`${URL}/auth/v1/user`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ password }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error_description || d.msg || d.message || `Gagal memperbarui kata sandi (${r.status}).`);
  },
};

async function token(): Promise<string | null> {
  let s = load(); if (!s) return null;
  if (Date.now() > s.expires_at - 60_000) s = await auth.refresh();
  return s?.access_token || null;
}

// Minimal PostgREST helper. `query` is a raw querystring (e.g. `agent_id=eq.<id>&order=created_at.desc`).
export async function db(
  table: string,
  opts: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: any; query?: string } = {}
): Promise<any> {
  const t = await token();
  const headers: Record<string, string> = { apikey: ANON, "Content-Type": "application/json" };
  if (t) headers.Authorization = `Bearer ${t}`;
  if (opts.method === "POST" || opts.method === "PATCH") headers.Prefer = "return=representation";
  const r = await fetch(`${URL}/rest/v1/${table}${opts.query ? `?${opts.query}` : ""}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await r.text();
  const data = text ? JSON.parse(text) : null;
  if (!r.ok) throw new Error((data && (data.message || data.hint || data.details)) || `HTTP ${r.status}`);
  return data;
}

// ---- Asset upload (agent's own files → public assets-global/uploads/<uid>/) ----
function toWebpBlob(file: File, maxW = 2200, quality = 0.85): Promise<{ blob: Blob; ext: string; ct: string }> {
  return new Promise((resolve) => {
    const raw = () => resolve({ blob: file, ext: (file.name.split(".").pop() || "jpg").toLowerCase(), ct: file.type || "image/jpeg" });
    try {
      const url = window.URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          const scale = Math.min(1, maxW / (img.naturalWidth || maxW));
          const w = Math.max(1, Math.round((img.naturalWidth || maxW) * scale));
          const h = Math.max(1, Math.round((img.naturalHeight || maxW) * scale));
          const c = document.createElement("canvas"); c.width = w; c.height = h;
          const ctx = c.getContext("2d");
          if (!ctx) { window.URL.revokeObjectURL(url); return raw(); }
          ctx.drawImage(img, 0, 0, w, h);
          c.toBlob((b) => { window.URL.revokeObjectURL(url); if (b && b.type === "image/webp") resolve({ blob: b, ext: "webp", ct: "image/webp" }); else if (b) resolve({ blob: b, ext: "jpg", ct: "image/jpeg" }); else raw(); }, "image/webp", quality);
        } catch { window.URL.revokeObjectURL(url); raw(); }
      };
      img.onerror = () => { window.URL.revokeObjectURL(url); raw(); };
      img.src = url;
    } catch { raw(); }
  });
}

// Uploads one file to the agent's own library and returns the inserted `assets` row.
export async function uploadAsset(file: File, opts: { kind?: "image" | "audio" | "video"; title?: string; meta?: any } = {}): Promise<any> {
  const s = load(); const t = await token(); const uid = s?.user?.id;
  if (!t || !uid) throw new Error("Sesi berakhir — masuk lagi untuk mengunggah.");
  const kind = opts.kind || (file.type.startsWith("audio") ? "audio" : file.type.startsWith("video") ? "video" : "image");
  const cap = kind === "video" ? 104_857_600 : 26_214_400;
  if (file.size > cap) throw new Error(kind === "video" ? "File terlalu besar (maks 100 MB)." : "File terlalu besar (maks 25 MB).");
  if (kind === "audio" && file.type && !/^audio\/(mpeg|mp3|wav|x-wav|mp4|aac|ogg)$/i.test(file.type)) throw new Error("Format audio tidak didukung (mp3/wav/aac/ogg).");
  if (kind === "video" && file.type && !/^video\/(mp4|webm|quicktime|x-matroska|ogg)$/i.test(file.type)) throw new Error("Format video tidak didukung (mp4/webm/mov).");
  if (kind === "image" && file.type && !/^image\/(jpeg|jpg|png|webp|gif)$/i.test(file.type)) throw new Error("Format gambar tidak didukung (jpg/png/webp/gif).");
  let body: Blob = file, ext = (file.name.split(".").pop() || "bin").toLowerCase(), ct = file.type || "application/octet-stream";
  if (kind === "image") { const r = await toWebpBlob(file); body = r.blob; ext = r.ext; ct = r.ct; }
  const safe = (opts.title || file.name).replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 40).toLowerCase() || "file";
  const path = `uploads/${uid}/${Date.now()}-${safe}.${ext}`;
  const up = await fetch(`${URL}/storage/v1/object/assets-global/${path}`, { method: "POST", headers: { Authorization: `Bearer ${t}`, apikey: ANON, "Content-Type": ct, "x-upsert": "true" }, body });
  if (!up.ok) { const e = await up.text().catch(() => ""); throw new Error("Gagal mengunggah file. " + e.slice(0, 100)); }
  const publicUrl = `${URL}/storage/v1/object/public/assets-global/${path}`;
  const row = await db("assets", { method: "POST", body: { agent_id: uid, type: kind, format: ext, storage_path: publicUrl, title: opts.title || file.name.replace(/\.[^.]+$/, ""), source: "upload", meta: { ...(opts.meta || {}), uploaded: true } } });
  return Array.isArray(row) ? row[0] : row;
}

// ---- MFA (TOTP authenticator app) ----
// Reads the `aal` (assurance level) claim from the current access token — "aal2" means MFA is satisfied.
export function currentAAL(): string | null {
  const s = load(); if (!s) return null;
  try { const p = JSON.parse(atob(s.access_token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))); return p.aal || null; } catch { return null; }
}
async function authApi(path: string, method: string, body?: any): Promise<any> {
  const t = await token();
  const headers: Record<string, string> = { apikey: ANON, "Content-Type": "application/json" };
  if (t) headers.Authorization = `Bearer ${t}`;
  const r = await fetch(`${URL}/auth/v1/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error_description || d.msg || d.message || `Gagal (${r.status})`);
  return d;
}
export const mfa = {
  async listFactors(): Promise<any[]> {
    try { const u = await authApi("user", "GET"); return (u.factors || []) as any[]; } catch { return []; }
  },
  async enroll(): Promise<{ factorId: string; qr: string; secret: string; uri: string }> {
    const d = await authApi("factors", "POST", { factor_type: "totp", friendly_name: `cakra-${Date.now()}` });
    return { factorId: d.id, qr: d.totp?.qr_code || "", secret: d.totp?.secret || "", uri: d.totp?.uri || "" };
  },
  async unenroll(factorId: string): Promise<void> { try { await authApi(`factors/${factorId}`, "DELETE"); } catch {} },
  // Challenge + verify a 6-digit code; on success saves the upgraded (aal2) session and returns it.
  async verifyCode(factorId: string, code: string): Promise<Session> {
    const ch = await authApi(`factors/${factorId}/challenge`, "POST", {});
    const d = await authApi(`factors/${factorId}/verify`, "POST", { challenge_id: ch.id, code });
    if (d.access_token) { const s = toSession(d); save(s); return s; }
    throw new Error("Verifikasi gagal");
  },
};

// ---- RPC + public runtime config ----
// Calls a Postgres function via PostgREST with the current user's JWT (so SECURITY DEFINER
// functions see the caller's email/aal claims for authorization).
export async function rpc(fn: string, args?: any): Promise<any> {
  const t = await token();
  const headers: Record<string, string> = { apikey: ANON, "Content-Type": "application/json" };
  if (t) headers.Authorization = `Bearer ${t}`;
  const r = await fetch(`${URL}/rest/v1/rpc/${fn}`, { method: "POST", headers, body: JSON.stringify(args || {}) });
  const text = await r.text();
  const data = text ? JSON.parse(text) : null;
  if (!r.ok) throw new Error((data && (data.message || data.hint || data.details)) || `HTTP ${r.status}`);
  return data;
}

// Calls a Supabase Edge Function with the caller's access token (so the function can resolve the
// current user). Throws with the function's { error } message on non-2xx.
export async function invokeFn(name: string, body?: any): Promise<any> {
  const t = await token();
  const headers: Record<string, string> = { apikey: ANON, "Content-Type": "application/json" };
  if (t) headers.Authorization = `Bearer ${t}`;
  const r = await fetch(`${URL}/functions/v1/${name}`, { method: "POST", headers, body: JSON.stringify(body || {}) });
  const text = await r.text();
  const data = text ? JSON.parse(text) : null;
  if (!r.ok) throw new Error((data && (data.error || data.message)) || `HTTP ${r.status}`);
  return data;
}

// Public listings for an agent's live site (anon; RLS "public listings" allows status dijual/disewa).
export async function publicListings(agentId: string): Promise<any[]> {
  try {
    const r = await fetch(`${URL}/rest/v1/listings?agent_id=eq.${encodeURIComponent(agentId)}&status=in.(dijual,disewa)&order=created_at.asc&select=title,status,price_label,location,beds,baths,size_m2,images`, { headers: { apikey: ANON } });
    const d = await r.json();
    return Array.isArray(d) ? d : [];
  } catch { return []; }
}

// The general cakra.xyz marketplace: every agent listing an admin has APPROVED for the public
// feed (public_all_listings RPC is anon-granted + filters public_featured=true). Returns [] on
// error/empty so the page can fall back to its editorial seed set.
export async function publicAllListings(limit = 60): Promise<any[]> {
  try {
    const d = await rpc("public_all_listings", { p_limit: limit });
    return Array.isArray(d) ? d : [];
  } catch { return []; }
}

// Public site data for an agent (by subdomain or agent id) so a live site can render the agent's
// real persona. Anon-granted RPC; returns { found:false } when nothing matches.
export async function publicAgentSite(key: string): Promise<any | null> {
  try {
    const d = await rpc("public_agent_site", { p_key: key });
    return d && d.found ? d : null;
  } catch { return null; }
}

// Reads a public runtime-config value (the anon-readable public_config table) — used for public
// keys (e.g. Maps/GA) so the static frontend can pick them up without a rebuild.
export async function publicConfig(key: string): Promise<string | null> {
  try {
    const r = await fetch(`${URL}/rest/v1/public_config?key=eq.${encodeURIComponent(key)}&select=value`, { headers: { apikey: ANON } });
    const d = await r.json();
    return Array.isArray(d) && d[0] ? d[0].value : null;
  } catch { return null; }
}
