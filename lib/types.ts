export type BusinessType = "Dagang" | "Jasa" | "Manufaktur";
export type RoleKey = "admin" | "akuntan" | "staf" | "pegawai";
export type Status = "Aktif" | "Nonaktif";

export type Company = {
  id: string;
  name: string;
  type: BusinessType;
  createdAt: string;
};

export type User = {
  id: string;
  companyId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: RoleKey;
  active: boolean;
  isOwner: boolean; // pendaftar pertama perusahaan
  createdAt: string;
};

export type Session = { userId: string; remember: boolean };

export type Akun = {
  id: string;
  kode: string;
  nama: string;
  klasifikasi: "Aset" | "Liabilitas" | "Ekuitas" | "Pendapatan" | "Beban";
  kelompok: string;
  saldoNormal: "Debit" | "Kredit";
  status: Status;
};

export type Produk = {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  satuan: string;
  hargaBeli: number;
  hargaJual: number;
  status: Status;
};

// dipakai untuk Pemasok dan Pelanggan
export type Mitra = {
  id: string;
  kode: string;
  nama: string;
  kontak: string;
  telepon: string;
  email: string;
  alamat: string;
  status: Status;
};

export type Satuan = {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  status: Status;
};

export type TrxStatus = "Menunggu" | "Tervalidasi" | "Ditolak";

export type Transaksi = {
  id: string;
  nomor: string;
  tanggal: string; // YYYY-MM-DD
  jenis: string;
  pihak: string;
  keterangan: string;
  akunDebit: string; // kode akun
  akunKredit: string; // kode akun
  jumlah: number;
  status: TrxStatus;
  createdBy: string;
  createdAt: string;
};