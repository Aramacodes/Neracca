import type { Akun, BusinessType, Satuan } from "./types";
import { uid } from "./storage";

type Row = [string, string, Akun["klasifikasi"], string, Akun["saldoNormal"]];

export const KLASIFIKASI: Akun["klasifikasi"][] = [
  "Aset",
  "Liabilitas",
  "Ekuitas",
  "Pendapatan",
  "Beban",
];

export const KELOMPOK = [
  "Aset Lancar",
  "Aset Tetap",
  "Liabilitas Jangka Pendek",
  "Liabilitas Jangka Panjang",
  "Ekuitas",
  "Pendapatan Usaha",
  "Pendapatan Lain-lain",
  "Harga Pokok Penjualan",
  "Beban Operasional",
  "Beban Lain-lain",
];

const base: Row[] = [
  ["1-1100", "Kas dan Bank", "Aset", "Aset Lancar", "Debit"],
  ["1-1200", "Piutang Usaha", "Aset", "Aset Lancar", "Debit"],
  ["1-1400", "Perlengkapan", "Aset", "Aset Lancar", "Debit"],
  ["1-2100", "Peralatan", "Aset", "Aset Tetap", "Debit"],
  ["1-2200", "Akumulasi Penyusutan", "Aset", "Aset Tetap", "Kredit"],
  ["2-1100", "Utang Usaha", "Liabilitas", "Liabilitas Jangka Pendek", "Kredit"],
  ["2-1200", "Utang Bank", "Liabilitas", "Liabilitas Jangka Panjang", "Kredit"],
  ["2-1300", "Utang Pajak", "Liabilitas", "Liabilitas Jangka Pendek", "Kredit"],
  ["3-1100", "Modal Pemilik", "Ekuitas", "Ekuitas", "Kredit"],
  ["3-1200", "Prive", "Ekuitas", "Ekuitas", "Debit"],
  ["6-1100", "Beban Gaji", "Beban", "Beban Operasional", "Debit"],
  ["6-1200", "Beban Sewa", "Beban", "Beban Operasional", "Debit"],
  ["6-1300", "Beban Listrik, Air, dan Internet", "Beban", "Beban Operasional", "Debit"],
  ["6-1400", "Beban Perlengkapan", "Beban", "Beban Operasional", "Debit"],
  ["6-1500", "Beban Penyusutan", "Beban", "Beban Operasional", "Debit"],
  ["6-1900", "Beban Lain-lain", "Beban", "Beban Lain-lain", "Debit"],
];

const perType: Record<BusinessType, Row[]> = {
  Dagang: [
    ["1-1300", "Persediaan Barang Dagang", "Aset", "Aset Lancar", "Debit"],
    ["4-1100", "Pendapatan Penjualan", "Pendapatan", "Pendapatan Usaha", "Kredit"],
    ["5-1100", "Harga Pokok Penjualan", "Beban", "Harga Pokok Penjualan", "Debit"],
  ],
  Jasa: [["4-1100", "Pendapatan Jasa", "Pendapatan", "Pendapatan Usaha", "Kredit"]],
  Manufaktur: [
    ["1-1310", "Persediaan Bahan Baku", "Aset", "Aset Lancar", "Debit"],
    ["1-1320", "Persediaan Barang Dalam Proses", "Aset", "Aset Lancar", "Debit"],
    ["1-1330", "Persediaan Barang Jadi", "Aset", "Aset Lancar", "Debit"],
    ["4-1100", "Pendapatan Penjualan Produk", "Pendapatan", "Pendapatan Usaha", "Kredit"],
    ["5-1100", "Harga Pokok Penjualan", "Beban", "Harga Pokok Penjualan", "Debit"],
    ["5-1200", "Beban Tenaga Kerja Langsung", "Beban", "Harga Pokok Penjualan", "Debit"],
    ["5-1300", "Beban Overhead Pabrik", "Beban", "Harga Pokok Penjualan", "Debit"],
  ],
};

export function defaultAkun(type: BusinessType): Akun[] {
  return [...base, ...perType[type]]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([kode, nama, klasifikasi, kelompok, saldoNormal]) => ({
      id: uid(),
      kode,
      nama,
      klasifikasi,
      kelompok,
      saldoNormal,
      status: "Aktif" as const,
    }));
}

export function defaultSatuan(type: BusinessType): Satuan[] {
  const common: [string, string, string][] = [
    ["PCS", "Pieces", "Satuan buah/pcs"],
    ["BOX", "Box", "Satuan kotak/kardus"],
    ["KG", "Kilogram", "Satuan berat kilogram"],
    ["LTR", "Liter", "Satuan volume liter"],
  ];
  const extra: Record<BusinessType, [string, string, string][]> = {
    Dagang: [
      ["RIM", "Rim", "Satuan 500 lembar kertas"],
      ["LSN", "Lusin", "Satuan 12 buah"],
    ],
    Jasa: [
      ["JAM", "Jam", "Satuan durasi jam kerja"],
      ["PRJ", "Proyek", "Satuan per proyek"],
    ],
    Manufaktur: [
      ["UNIT", "Unit", "Satuan unit produksi"],
      ["TON", "Ton", "Satuan berat ton"],
    ],
  };
  return [...common, ...extra[type]].map(([kode, nama, deskripsi]) => ({
    id: uid(),
    kode,
    nama,
    deskripsi,
    status: "Aktif" as const,
  }));
}

/** Kode akun persediaan/pembelian default per jenis usaha */
export function inventoryCode(type: BusinessType): string {
  if (type === "Dagang") return "1-1300";
  if (type === "Manufaktur") return "1-1310";
  return "1-1400";
}