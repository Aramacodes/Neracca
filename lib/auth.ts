import type { BusinessType, Company, RoleKey, Session, User } from "./types";
import {
  KEYS,
  readJSON,
  removeKey,
  uid,
  writeCollection,
  writeJSON,
} from "./storage";
import { defaultAkun, defaultSatuan } from "./seed";

export type Result<T extends object = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

/* Catatan: hash ini hanya untuk demo localStorage, BUKAN pengganti
   keamanan backend. Saat backend siap, pindahkan autentikasi ke server. */
async function hashPassword(pw: string): Promise<string> {
  const text = `neracca:${pw}`;
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch {
    /* fallback di bawah */
  }
  return "b64:" + btoa(unescape(encodeURIComponent(text)));
}

export const normalizeEmail = (e: string) => e.trim().toLowerCase();
const validEmail = (e: string) => /^\S+@\S+\.\S+$/.test(e);

export const getUsers = () => readJSON<User[]>(KEYS.users, []);
const saveUsers = (u: User[]) => writeJSON(KEYS.users, u);
export const getCompanies = () => readJSON<Company[]>(KEYS.companies, []);
const saveCompanies = (c: Company[]) => writeJSON(KEYS.companies, c);

/* ---------- Registrasi (pengguna pertama = Admin) ---------- */

export async function registerCompany(input: {
  companyName: string;
  type: BusinessType;
  ownerName: string;
  email: string;
  password: string;
}): Promise<Result<{ user: User; company: Company }>> {
  const email = normalizeEmail(input.email);
  if (!validEmail(email)) return { ok: false, error: "Format email tidak valid." };
  if (getUsers().some((u) => u.email === email)) {
    return { ok: false, error: "Email sudah terdaftar. Silakan masuk." };
  }

  const now = new Date().toISOString();
  const company: Company = {
    id: uid(),
    name: input.companyName.trim(),
    type: input.type,
    createdAt: now,
  };
  const user: User = {
    id: uid(),
    companyId: company.id,
    name: input.ownerName.trim(),
    email,
    passwordHash: await hashPassword(input.password),
    role: "admin",
    active: true,
    isOwner: true,
    createdAt: now,
  };

  saveCompanies([...getCompanies(), company]);
  saveUsers([...getUsers(), user]);

  // data awal perusahaan
  writeCollection(company.id, "akun", defaultAkun(company.type));
  writeCollection(company.id, "satuan", defaultSatuan(company.type));

  return { ok: true, user, company };
}

/* ---------- Sesi ---------- */

export function setSession(s: Session) {
  clearSession();
  writeJSON(KEYS.session, s, s.remember ? window.localStorage : window.sessionStorage);
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  return (
    readJSON<Session | null>(KEYS.session, null, window.localStorage) ??
    readJSON<Session | null>(KEYS.session, null, window.sessionStorage)
  );
}

export function clearSession() {
  if (typeof window === "undefined") return;
  removeKey(KEYS.session, window.localStorage);
  removeKey(KEYS.session, window.sessionStorage);
}

export async function login(
  emailRaw: string,
  password: string,
  remember: boolean
): Promise<Result> {
  const email = normalizeEmail(emailRaw);
  const user = getUsers().find((u) => u.email === email);
  if (!user || user.passwordHash !== (await hashPassword(password))) {
    return { ok: false, error: "Email atau password salah." };
  }
  if (!user.active) {
    return { ok: false, error: "Akun Anda dinonaktifkan. Hubungi Admin perusahaan." };
  }
  setSession({ userId: user.id, remember });
  return { ok: true };
}

export function getCurrent(): { user: User; company: Company } | null {
  const s = getSession();
  if (!s) return null;
  const user = getUsers().find((u) => u.id === s.userId);
  if (!user || !user.active) {
    clearSession();
    return null;
  }
  const company = getCompanies().find((c) => c.id === user.companyId);
  if (!company) {
    clearSession();
    return null;
  }
  return { user, company };
}

/* ---------- Manajemen pengguna ---------- */

export const listCompanyUsers = (companyId: string) =>
  getUsers().filter((u) => u.companyId === companyId);

export async function addUser(
  companyId: string,
  input: { name: string; email: string; role: RoleKey; password: string }
): Promise<Result<{ user: User }>> {
  const email = normalizeEmail(input.email);
  if (!validEmail(email)) return { ok: false, error: "Format email tidak valid." };
  if (getUsers().some((u) => u.email === email)) {
    return { ok: false, error: "Email sudah digunakan pengguna lain." };
  }
  const user: User = {
    id: uid(),
    companyId,
    name: input.name.trim(),
    email,
    passwordHash: await hashPassword(input.password),
    role: input.role,
    active: true,
    isOwner: false,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...getUsers(), user]);
  return { ok: true, user };
}

export async function updateUser(
  id: string,
  patch: { name?: string; email?: string; role?: RoleKey; active?: boolean; password?: string }
): Promise<Result> {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) return { ok: false, error: "Pengguna tidak ditemukan." };
  const next: User = { ...users[idx] };

  if (patch.email !== undefined) {
    const email = normalizeEmail(patch.email);
    if (!validEmail(email)) return { ok: false, error: "Format email tidak valid." };
    if (users.some((u) => u.id !== id && u.email === email)) {
      return { ok: false, error: "Email sudah digunakan pengguna lain." };
    }
    next.email = email;
  }
  if (patch.name !== undefined) next.name = patch.name.trim();
  if (patch.role) next.role = patch.role;
  if (patch.active !== undefined) next.active = patch.active;
  if (patch.password) next.passwordHash = await hashPassword(patch.password);

  users[idx] = next;
  saveUsers(users);
  return { ok: true };
}

export function deleteUser(id: string) {
  saveUsers(getUsers().filter((u) => u.id !== id));
}

export async function changePassword(
  userId: string,
  current: string,
  next: string
): Promise<Result> {
  const user = getUsers().find((u) => u.id === userId);
  if (!user) return { ok: false, error: "Pengguna tidak ditemukan." };
  if (user.passwordHash !== (await hashPassword(current))) {
    return { ok: false, error: "Password saat ini salah." };
  }
  return updateUser(userId, { password: next });
}

export function updateCompany(id: string, patch: { name?: string }) {
  saveCompanies(
    getCompanies().map((c) => (c.id === id ? { ...c, ...(patch.name ? { name: patch.name.trim() } : {}) } : c))
  );
}