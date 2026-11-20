import type { BusinessType, RoleKey } from "./types";
import type { IconName } from "@/components/app/ui";

export const DATA_RESOURCES = ["akun", "produk", "pemasok", "pelanggan", "satuan", "transaksi"];

const ALL_MENUS = [
  "dashboard",
  "master-data",
  "transaksi",
  "validasi",
  "jurnal-umum",
  "buku-besar",
  "laporan-keuangan",
  "pengaturan",
];

export type RoleConfig = {
  label: string;
  desc: string;
  menus: string[];
  write: string[];
};

export const BUSINESS_ROLES: Record<BusinessType, Record<RoleKey, RoleConfig>> = {
  Dagang: {
    admin: {
      label: "Admin",
      desc: "Akses penuh ke seluruh menu dan data usaha dagang, termasuk pengaturan pengguna dan inventori.",
      menus: ALL_MENUS,
      write: DATA_RESOURCES,
    },
    akuntan: {
      label: "Akuntan",
      desc: "Mengelola bagan akun (COA), transaksi, validasi, jurnal, buku besar, dan laporan keuangan usaha dagang.",
      menus: ALL_MENUS.filter((m) => m !== "pengaturan"),
      write: DATA_RESOURCES,
    },
    staf: {
      label: "Staf",
      desc: "Mengelola katalog produk dagang, pemasok, pelanggan, satuan, dan mencatat transaksi penjualan/pembelian.",
      menus: ["dashboard", "master-data", "transaksi"],
      write: ["produk", "pemasok", "pelanggan", "satuan", "transaksi"],
    },
    pegawai: {
      label: "Pegawai",
      desc: "Hanya dapat melihat dashboard, stok produk dagang, dan riwayat transaksi (tanpa izin mengubah data).",
      menus: ["dashboard", "master-data", "transaksi"],
      write: [],
    },
  },
  Jasa: {
    admin: {
      label: "Admin",
      desc: "Akses penuh ke seluruh menu dan operasional usaha jasa, termasuk pengaturan pengguna dan tarif layanan.",
      menus: ALL_MENUS,
      write: DATA_RESOURCES,
    },
    akuntan: {
      label: "Akuntan",
      desc: "Mengelola bagan akun (COA), pendapatan layanan, beban operasional, validasi, jurnal, dan laporan laba rugi.",
      menus: ALL_MENUS.filter((m) => m !== "pengaturan"),
      write: DATA_RESOURCES,
    },
    staf: {
      label: "Staf",
      desc: "Mengelola katalog layanan, klien/pelanggan, vendor, dan mencatat transaksi penagihan jasa.",
      menus: ["dashboard", "master-data", "transaksi"],
      write: ["produk", "pemasok", "pelanggan", "satuan", "transaksi"],
    },
    pegawai: {
      label: "Pegawai",
      desc: "Hanya dapat melihat dashboard, katalog layanan, dan riwayat transaksi jasa (tanpa izin mengubah data).",
      menus: ["dashboard", "master-data", "transaksi"],
      write: [],
    },
  },
  Manufaktur: {
    admin: {
      label: "Admin",
      desc: "Akses penuh ke seluruh siklus manufaktur, termasuk pengaturan pengguna dan parameter pabrikasi.",
      menus: ALL_MENUS,
      write: DATA_RESOURCES,
    },
    akuntan: {
      label: "Akuntan",
      desc: "Mengelola COA manufaktur, perhitungan HPP produksi, alokasi biaya pabrik, validasi, dan laporan.",
      menus: ALL_MENUS.filter((m) => m !== "pengaturan"),
      write: DATA_RESOURCES,
    },
    staf: {
      label: "Staf",
      desc: "Mengelola data bahan baku, produk jadi, pemasok, pelanggan, dan mencatat transaksi operasional pabrik.",
      menus: ["dashboard", "master-data", "transaksi"],
      write: ["produk", "pemasok", "pelanggan", "satuan", "transaksi"],
    },
    pegawai: {
      label: "Pegawai",
      desc: "Hanya dapat melihat dashboard, stok persediaan bahan/barang, dan riwayat transaksi (tanpa izin mengubah data).",
      menus: ["dashboard", "master-data", "transaksi"],
      write: [],
    },
  },
};

// Fallback alias untuk kompabilitas backward
export const ROLES: Record<RoleKey, RoleConfig> = BUSINESS_ROLES.Dagang;

export const getRoleConfig = (role: RoleKey, businessType?: BusinessType): RoleConfig => {
  const b = businessType && BUSINESS_ROLES[businessType] ? businessType : "Dagang";
  return BUSINESS_ROLES[b][role];
};

export const canAccessMenu = (role: RoleKey, menu: string, businessType?: BusinessType) =>
  menu === "akun" || getRoleConfig(role, businessType).menus.includes(menu);

export const canWrite = (role: RoleKey, resource: string, businessType?: BusinessType) =>
  getRoleConfig(role, businessType).write.includes(resource);

export type NavItem = {
  key: string;
  label: string;
  href?: string;
  icon: IconName;
  children?: { label: string; href: string }[];
};

export const NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: "grid" },
  {
    key: "master-data",
    label: "Master Data",
    icon: "database",
    children: [
      { label: "Bagan Akun (COA)", href: "/master-data/akun" },
      { label: "Produk", href: "/master-data/produk" },
      { label: "Pemasok", href: "/master-data/pemasok" },
      { label: "Pelanggan", href: "/master-data/pelanggan" },
      { label: "Satuan", href: "/master-data/satuan" },
    ],
  },
  { key: "transaksi", label: "Transaksi", href: "/transaksi", icon: "card" },
  { key: "validasi", label: "Validasi", href: "/validasi", icon: "check-circle" },
  { key: "jurnal-umum", label: "Jurnal Umum", href: "/jurnal-umum", icon: "file" },
  { key: "buku-besar", label: "Buku Besar", href: "/buku-besar", icon: "book" },
  { key: "laporan-keuangan", label: "Laporan Keuangan", href: "/laporan-keuangan", icon: "chart" },
  { key: "pengaturan", label: "Pengaturan", href: "/pengaturan", icon: "settings" },
];

export const getNav = (role: RoleKey, businessType?: BusinessType): NavItem[] => {
  const b = businessType ?? "Dagang";
  const produkLabel =
    b === "Jasa" ? "Layanan & Tarif" : b === "Manufaktur" ? "Bahan & Produk" : "Produk Dagang";

  return NAV.filter((n) => canAccessMenu(role, n.key, b)).map((n) => {
    if (n.key === "master-data" && n.children) {
      return {
        ...n,
        children: n.children.map((c) =>
          c.href === "/master-data/produk" ? { ...c, label: produkLabel } : c
        ),
      };
    }
    return n;
  });
};

export const PAGE_META: Record<string, { title: string; subtitle: string; menu: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Ringkasan kondisi keuangan bisnis Anda", menu: "dashboard" },
  "/master-data/akun": { title: "Bagan Akun (Chart of Accounts)", subtitle: "Daftar seluruh rekening akuntansi dan saldo normal", menu: "master-data" },
  "/master-data/produk": { title: "Data Produk", subtitle: "Katalog barang dagangan, harga beli, dan harga jual", menu: "master-data" },
  "/master-data/pemasok": { title: "Data Pemasok", subtitle: "Daftar mitra pemasok dan informasi kontak", menu: "master-data" },
  "/master-data/pelanggan": { title: "Data Pelanggan", subtitle: "Daftar pelanggan dan penanggung jawab", menu: "master-data" },
  "/master-data/satuan": { title: "Satuan Ukuran", subtitle: "Daftar unit pengukuran", menu: "master-data" },
  "/transaksi": { title: "Transaksi", subtitle: "Catat dan kelola transaksi keuangan", menu: "transaksi" },
  "/validasi": { title: "Validasi", subtitle: "Tinjau dan setujui transaksi yang masuk", menu: "validasi" },
  "/jurnal-umum": { title: "Jurnal Umum", subtitle: "Catatan jurnal dari seluruh transaksi", menu: "jurnal-umum" },
  "/buku-besar": { title: "Buku Besar", subtitle: "Rincian mutasi dan saldo tiap akun", menu: "buku-besar" },
  "/laporan-keuangan": { title: "Laporan Keuangan", subtitle: "Neraca, laba rugi, dan arus kas", menu: "laporan-keuangan" },
  "/pengaturan": { title: "Pengaturan", subtitle: "Kelola pengguna dan peran di perusahaan Anda", menu: "pengaturan" },
  "/akun": { title: "Informasi Akun", subtitle: "Kelola profil dan keamanan akun Anda", menu: "akun" },
};

export const getMeta = (pathname: string, businessType?: BusinessType) => {
  const clean = pathname.replace(/\/$/, "") || "/";
  const base = PAGE_META[clean];
  if (!base) return undefined;
  if (clean === "/master-data/produk") {
    if (businessType === "Jasa") {
      return { ...base, title: "Data Layanan & Tarif", subtitle: "Katalog jasa dan tarif layanan" };
    }
    if (businessType === "Manufaktur") {
      return { ...base, title: "Data Bahan Baku & Produk", subtitle: "Katalog bahan mentah dan produk jadi pabrik" };
    }
  }
  return base;
};