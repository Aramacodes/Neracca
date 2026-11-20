export const rupiah = (n: number) =>
  (n < 0 ? "-" : "") + "Rp " + Math.abs(Math.round(n)).toLocaleString("id-ID");

export function rupiahCompact(n: number) {
  const a = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  const f = (v: number) => v.toLocaleString("id-ID", { maximumFractionDigits: 1 });
  if (a >= 1e9) return `${sign}Rp ${f(a / 1e9)} M`;
  if (a >= 1e6) return `${sign}Rp ${f(a / 1e6)} jt`;
  if (a >= 1e3) return `${sign}Rp ${f(a / 1e3)} rb`;
  return `${sign}Rp ${Math.round(a)}`;
}

export const tanggal = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export function todayISO() {
  const d = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "U";