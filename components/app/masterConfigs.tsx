import type { CrudConfig, FieldDef } from "./CrudPage";
import { Tag } from "./ui";
import { rupiah } from "@/lib/format";
import { KELOMPOK, KLASIFIKASI } from "@/lib/seed";
import { readCollection } from "@/lib/storage";
import type { BusinessType, Transaksi } from "@/lib/types";
import type { Row } from "./CrudPage";

/* ---------- Bagan Akun ---------- */
export const akunConfig: CrudConfig = {
  resource: "akun",
  noun: "Akun",
  addLabel: "Tambah Akun",
  searchKeys: ["kode", "nama"],
  uniqueKey: "kode",
  filters: [{ key: "klasifikasi", allLabel: "Semua Tipe", options: KLASIFIKASI }],
  columns: [
    { label: "Kode Akun", key: "kode", mono: true },
    { label: "Nama Akun", key: "nama", strong: true },
    { label: "Klasifikasi", render: (r) => <Tag tone="gray">{String(r.klasifikasi)}</Tag> },
    { label: "Kelompok", key: "kelompok", muted: true },
    {
      label: "Saldo Normal",
      render: (r) => <Tag tone={r.saldoNormal === "Debit" ? "blue" : "violet"}>{String(r.saldoNormal)}</Tag>,
    },
  ],
  fields: [
    { name: "kode", label: "Kode Akun", required: true, mono: true, half: true, placeholder: "1-1100", lockOnEdit: true },
    { name: "saldoNormal", label: "Saldo Normal", type: "select", required: true, half: true, options: ["Debit", "Kredit"] },
    { name: "nama", label: "Nama Akun", required: true, placeholder: "Contoh: Kas dan Bank" },
    { name: "klasifikasi", label: "Klasifikasi", type: "select", required: true, half: true, options: KLASIFIKASI },
    { name: "kelompok", label: "Kelompok", type: "select", required: true, half: true, options: KELOMPOK },
  ],
  deleteGuard: (row, companyId) =>
    readCollection<Transaksi>(companyId, "transaksi").some(
      (t) => t.akunDebit === row.kode || t.akunKredit === row.kode
    )
      ? "Akun ini sudah dipakai pada transaksi sehingga tidak dapat dihapus. Nonaktifkan saja jika tidak ingin dipakai lagi."
      : null,
};

/* ---------- Produk & Layanan ---------- */
export const getProdukConfig = (type?: BusinessType): CrudConfig => {
  if (type === "Jasa") {
    return {
      resource: "produk",
      noun: "Layanan",
      addLabel: "Tambah Layanan",
      searchKeys: ["kode", "nama", "kategori"],
      uniqueKey: "kode",
      columns: [
        { label: "Kode Layanan", key: "kode", mono: true },
        { label: "Nama Layanan", key: "nama", strong: true },
        { label: "Kategori", key: "kategori", muted: true },
        { label: "Satuan / Basis", key: "satuan", mono: true, muted: true },
        { label: "Tarif (Rp)", align: "right", render: (r) => rupiah(Number(r.hargaJual ?? 0)) },
      ],
      fields: [
        { name: "kode", label: "Kode Layanan", required: true, mono: true, half: true, autoCode: { prefix: "SRV-", pad: 3 } },
        { name: "kategori", label: "Kategori", half: true, placeholder: "Contoh: Konsultasi" },
        { name: "nama", label: "Nama Layanan", required: true, placeholder: "Contoh: Jasa Audit Keuangan" },
        { name: "satuan", label: "Satuan / Basis", type: "select", required: true, half: true, lookup: { resource: "satuan", value: "kode", label: "nama" } },
        { name: "hargaJual", label: "Tarif Layanan (Rp)", type: "number", half: true, defaultValue: "0" },
      ],
    };
  }

  if (type === "Manufaktur") {
    return {
      resource: "produk",
      noun: "Item",
      addLabel: "Tambah Item",
      searchKeys: ["kode", "nama", "kategori"],
      uniqueKey: "kode",
      columns: [
        { label: "Kode Item", key: "kode", mono: true },
        { label: "Nama Item", key: "nama", strong: true },
        { label: "Kategori", key: "kategori", muted: true },
        { label: "Satuan", key: "satuan", mono: true, muted: true },
        { label: "Biaya Bahan (Rp)", align: "right", render: (r) => rupiah(Number(r.hargaBeli ?? 0)) },
        { label: "Harga Jual (Rp)", align: "right", render: (r) => rupiah(Number(r.hargaJual ?? 0)) },
      ],
      fields: [
        { name: "kode", label: "Kode Item", required: true, mono: true, half: true, autoCode: { prefix: "MFG-", pad: 3 } },
        { name: "kategori", label: "Kategori (Bahan/Produk)", half: true, placeholder: "Contoh: Bahan Baku / Barang Jadi" },
        { name: "nama", label: "Nama Item", required: true, placeholder: "Contoh: Biji Plastik HDPE / Kursi Kantor" },
        { name: "satuan", label: "Satuan", type: "select", required: true, half: true, lookup: { resource: "satuan", value: "kode", label: "nama" } },
        { name: "hargaBeli", label: "Biaya / Harga Beli (Rp)", type: "number", half: true, defaultValue: "0" },
        { name: "hargaJual", label: "Harga Jual (Rp)", type: "number", half: true, defaultValue: "0" },
      ],
    };
  }

  return {
    resource: "produk",
    noun: "Produk",
    addLabel: "Tambah Produk",
    searchKeys: ["kode", "nama", "kategori"],
    uniqueKey: "kode",
    columns: [
      { label: "Kode Produk", key: "kode", mono: true },
      { label: "Nama Produk", key: "nama", strong: true },
      { label: "Kategori", key: "kategori", muted: true },
      { label: "Satuan", key: "satuan", mono: true, muted: true },
      { label: "Harga Beli", align: "right", render: (r) => rupiah(Number(r.hargaBeli ?? 0)) },
      { label: "Harga Jual", align: "right", render: (r) => rupiah(Number(r.hargaJual ?? 0)) },
    ],
    fields: [
      { name: "kode", label: "Kode Produk", required: true, mono: true, half: true, autoCode: { prefix: "PRD-", pad: 3 } },
      { name: "kategori", label: "Kategori", half: true, placeholder: "Contoh: Alat Tulis" },
      { name: "nama", label: "Nama Produk", required: true, placeholder: "Contoh: Kertas A4 70gsm" },
      { name: "satuan", label: "Satuan", type: "select", required: true, half: true, lookup: { resource: "satuan", value: "kode", label: "nama" } },
      { name: "hargaBeli", label: "Harga Beli (Rp)", type: "number", half: true, defaultValue: "0" },
      { name: "hargaJual", label: "Harga Jual (Rp)", type: "number", half: true, defaultValue: "0" },
    ],
  };
};

export const produkConfig = getProdukConfig("Dagang");

/* ---------- Pemasok & Pelanggan ---------- */
function mitraConfig(o: {
  resource: "pemasok" | "pelanggan";
  noun: string;
  prefix: string;
}): CrudConfig {
  const fields: FieldDef[] = [
    { name: "kode", label: `Kode ${o.noun}`, required: true, mono: true, half: true, autoCode: { prefix: o.prefix, pad: 3 } },
    { name: "kontak", label: "Contact Person", half: true },
    { name: "nama", label: `Nama ${o.noun}`, required: true },
    { name: "telepon", label: "Telepon", type: "tel", half: true, mono: true },
    { name: "email", label: "Email", type: "email", half: true },
    { name: "alamat", label: "Alamat", type: "textarea" },
  ];
  return {
    resource: o.resource,
    noun: o.noun,
    addLabel: `Tambah ${o.noun}`,
    searchKeys: ["kode", "nama", "kontak"],
    uniqueKey: "kode",
    columns: [
      { label: "Kode", key: "kode", mono: true },
      { label: `Nama ${o.noun}`, key: "nama", strong: true },
      { label: "Contact Person", key: "kontak", muted: true },
      { label: "Telepon", key: "telepon", mono: true, muted: true },
      { label: "Email", key: "email", muted: true },
    ],
    fields,
    deleteGuard: (row: Row, companyId: string) =>
      readCollection<Transaksi>(companyId, "transaksi").some((t) => t.pihak === row.nama)
        ? `${o.noun} ini sudah tercatat pada transaksi sehingga tidak dapat dihapus. Nonaktifkan saja.`
        : null,
  };
}

export const pemasokConfig = mitraConfig({ resource: "pemasok", noun: "Pemasok", prefix: "SUP-" });
export const pelangganConfig = mitraConfig({ resource: "pelanggan", noun: "Pelanggan", prefix: "CUS-" });

/* ---------- Satuan ---------- */
export const satuanConfig: CrudConfig = {
  resource: "satuan",
  noun: "Satuan",
  addLabel: "Tambah Satuan",
  searchKeys: ["kode", "nama", "deskripsi"],
  uniqueKey: "kode",
  columns: [
    { label: "Kode Satuan", key: "kode", mono: true },
    { label: "Nama Satuan", key: "nama", strong: true },
    { label: "Deskripsi", key: "deskripsi", muted: true },
  ],
  fields: [
    { name: "kode", label: "Kode Satuan", required: true, mono: true, uppercase: true, half: true, placeholder: "PCS", lockOnEdit: true },
    { name: "nama", label: "Nama Satuan", required: true, half: true, placeholder: "Pieces" },
    { name: "deskripsi", label: "Deskripsi", placeholder: "Contoh: Satuan buah/pcs" },
  ],
  deleteGuard: (row, companyId) =>
    readCollection<Row>(companyId, "produk").some((p) => p.satuan === row.kode)
      ? "Satuan ini dipakai oleh data produk sehingga tidak dapat dihapus. Nonaktifkan saja."
      : null,
};