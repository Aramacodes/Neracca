import { useCallback, useEffect, useState } from "react";

const P = "neracca:";

export const KEYS = {
  users: `${P}users`,
  companies: `${P}companies`,
  session: `${P}session`,
};

const hasWindow = () => typeof window !== "undefined";

export function readJSON<T>(key: string, fallback: T, store?: Storage): T {
  if (!hasWindow()) return fallback;
  try {
    const raw = (store ?? window.localStorage).getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown, store?: Storage) {
  if (!hasWindow()) return;
  try {
    (store ?? window.localStorage).setItem(key, JSON.stringify(value));
  } catch {
    /* storage penuh / diblokir */
  }
}

export function removeKey(key: string, store?: Storage) {
  if (!hasWindow()) return;
  try {
    (store ?? window.localStorage).removeItem(key);
  } catch {
    /* abaikan */
  }
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/* ---------- Koleksi data per perusahaan ---------- */

export const collectionKey = (companyId: string, resource: string) =>
  `${P}data:${companyId}:${resource}`;

export function readCollection<T>(companyId: string, resource: string): T[] {
  return readJSON<T[]>(collectionKey(companyId, resource), []);
}

export function writeCollection<T>(companyId: string, resource: string, items: T[]) {
  writeJSON(collectionKey(companyId, resource), items);
}

/** Membuat kode berikutnya, contoh: nextCode(["SUP-001"], "SUP-", 3) => "SUP-002" */
export function nextCode(codes: string[], prefix: string, pad: number): string {
  let max = 0;
  for (const c of codes) {
    if (c.toUpperCase().startsWith(prefix.toUpperCase())) {
      const n = parseInt(c.slice(prefix.length).replace(/\D/g, ""), 10);
      if (!isNaN(n) && n > max) max = n;
    }
  }
  return prefix + String(max + 1).padStart(pad, "0");
}

/** Hook: baca + simpan koleksi ke localStorage */
export function useCollection<T extends { id: string }>(
  companyId: string | undefined,
  resource: string
) {
  const [items, setItems] = useState<T[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    setItems(readCollection<T>(companyId, resource));
    setReady(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === collectionKey(companyId, resource)) {
        setItems(readCollection<T>(companyId, resource));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [companyId, resource]);

  const commit = useCallback(
    (next: T[]) => {
      if (!companyId) return;
      setItems(next);
      writeCollection(companyId, resource, next);
    },
    [companyId, resource]
  );

  return { items, ready, commit };
}