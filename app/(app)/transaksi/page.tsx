"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/app/AppProvider";
import { ConfirmDialog, Icon, Modal, Pagination, StatusBadge, Tag } from "@/components/app/ui";
import { nextCode, readCollection, uid, useCollection } from "@/lib/storage";
import { rupiah, tanggal, todayISO } from "@/lib/format";
import { inventoryCode } from "@/lib/seed";
import type { Akun, Mitra, Transaksi } from "@/lib/types";

const PAGE_SIZE = 10;

// "INV" = akun persediaan sesuai jenis usaha
const JENIS: Record<string, { d: string; k: string; pihak?: "pelanggan" | "pemasok" }> = {
  "Penjualan Tunai": { d: "1-1100", k: "4-1100", pihak: "pelanggan" },
  "Penjualan Kredit": { d: "1-1200", k: "4-1100", pihak: "pelanggan" },
  "Penerimaan Piutang": { d: "1-1100", k: "1-1200", pihak: "pelanggan" },
  "Pembelian Tunai": { d: "INV", k: "1-1100", pihak: "pemasok" },
  "Pembelian Kredit": { d: "INV", k: "2-1100", pihak: "pemasok" },
  "Pembayaran Utang": { d: "2-1100", k: "1-1100", pihak: "pemasok" },
  "Pembayaran Beban": { d: "6-1900", k: "1-1100" },
  "Setoran Modal": { d: "1-1100", k: "3-1100" },
  Lainnya: { d: "", k: "" },
};
const JENIS_LIST = Object.keys(JENIS);

type FormState = {
  id?: string;
  nomor: string;
  tanggal: string;
  jenis: string;
  pihak: string;
  keterangan: string;
  akunDebit: string;
  akunKredit: string;
  jumlah: string;
};

export default function TransaksiPage() {
  const { company, user, can } = useApp();
  const writable = can("transaksi");
  const trx = useCollection<Transaksi>(company.id, "transaksi");
  const akun = useCollection<Akun>(company.id, "akun");

  const [q, setQ] = useState("");
  const [fJenis, setFJenis] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<Transaksi | null>(null);

  const akunAktif = useMemo(
    () => [...akun.items].filter((a) => a.status === "Aktif").sort((a, b) => a.kode.localeCompare(b.kode)),
    [akun.items]
  );
  const akunMap = useMemo(() => new Map(akun.items.map((a) => [a.kode, a])), [akun.items]);
  const akunName = (kode: string) => akunMap.get(kode)?.nama ?? kode;

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return [...trx.items]
      .sort((a, b) => (b.tanggal + b.nomor).localeCompare(a.tanggal + a.nomor))
      .filter(
        (t) =>
          (!fJenis || t.jenis === fJenis) &&
          (!fStatus || t.status === fStatus) &&
          (!s || [t.nomor, t.keterangan, t.pihak].some((x) => x.toLowerCase().includes(s)))
      );
  }, [trx.items, q, fJenis, fStatus]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const slice = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  const totalNilai = trx.items.filter((t) => t.status !== "Ditolak").reduce((s, t) => s + t.jumlah, 0);
  const menunggu = trx.items.filter((t) => t.status === "Menunggu").length;

  const templateFor = (jenis: string) => {
    const t = JENIS[jenis];
    const resolve = (c: string) => (c === "INV" ? inventoryCode(company.type) : c);
    const ok = (c: string) => (c && akunAktif.some((a) => a.kode === c) ? c : "");
    return { akunDebit: ok(resolve(t.d)), akunKredit: ok(resolve(t.k)) };
  };

  const openAdd = () => {
    const jenis = "Penjualan Tunai";
    setErrors({});
    setForm({
      nomor: nextCode(trx.items.map((t) => t.nomor), "TRX-", 4),
      tanggal: todayISO(),
      jenis,
      pihak: "",
      keterangan: "",
      jumlah: "",
      ...templateFor(jenis),
    });
  };

  const openEdit = (t: Transaksi) => {
    setErrors({});
    setForm({
      id: t.id,
      nomor: t.nomor,
      tanggal: t.tanggal,
      jenis: t.jenis,
      pihak: t.pihak,
      keterangan: t.keterangan,
      akunDebit: t.akunDebit,
      akunKredit: t.akunKredit,
      jumlah: String(t.jumlah),
    });
  };

  const set = (patch: Partial<FormState>) => setForm((f) => (f ? { ...f, ...patch } : f));

  const changeJenis = (jenis: string) => set({ jenis, pihak: "", ...templateFor(jenis) });

  const pihakOptions = (): string[] => {
    if (!form) return [];
    const type = JENIS[form.jenis]?.pihak;
    if (!type) return [];
    return readCollection<Mitra>(company.id, type)
      .filter((m) => m.status === "Aktif")
      .map((m) => m.nama);
  };

  const submit = () => {
    if (!form) return;
    const errs: Record<string, string> = {};
    if (!form.tanggal) errs.tanggal = "Tanggal wajib diisi.";
    if (!form.keterangan.trim()) errs.keterangan = "Keterangan wajib diisi.";
    if (!form.akunDebit) errs.akunDebit = "Pilih akun debit.";
    if (!form.akunKredit) errs.akunKredit = "Pilih akun kredit.";
    if (form.akunDebit && form.akunDebit === form.akunKredit) errs.akunKredit = "Akun kredit harus berbeda dari akun debit.";
    const jumlah = Number(form.jumlah);
    if (!form.jumlah || isNaN(jumlah) || jumlah <= 0) errs.jumlah = "Masukkan jumlah lebih dari 0.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const base = {
      tanggal: form.tanggal,
      jenis: form.jenis,
      pihak: form.pihak,
      keterangan: form.keterangan.trim(),
      akunDebit: form.akunDebit,
      akunKredit: form.akunKredit,
      jumlah,
    };

    if (form.id) {
      trx.commit(trx.items.map((t) => (t.id === form.id ? { ...t, ...base } : t)));
    } else {
      trx.commit([
        ...trx.items,
        {
          id: uid(),
          nomor: form.nomor,
          ...base,
          status: "Menunggu",
          createdBy: user.name,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    setForm(null);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    trx.commit(trx.items.filter((t) => t.id !== toDelete.id));
    setToDelete(null);
  };

  const pihakOpts = pihakOptions();
  const pihakType = form ? JENIS[form.jenis]?.pihak : undefined;

  return (
    <div className="app-page">
      <div className="app-mini-grid">
        <div className="app-mini"><span>Total transaksi</span><b>{trx.items.length}</b></div>
        <div className="app-mini"><span>Menunggu validasi</span><b>{menunggu}</b></div>
        <div className="app-mini"><span>Total nilai transaksi</span><b>{rupiah(totalNilai)}</b></div>
      </div>

      <div className="app-toolbar">
        <div className="app-search">
          <Icon name="search" size={15} />
          <input
            className="app-input"
            placeholder="Cari nomor, keterangan, atau pihak..."
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
          />
        </div>
        <select className="app-input app-select" value={fJenis} onChange={(e) => { setFJenis(e.target.value); setPage(1); }}>
          <option value="">Semua Jenis</option>
          {JENIS_LIST.map((j) => <option key={j}>{j}</option>)}
        </select>
        <select className="app-input app-select" value={fStatus} onChange={(e) => { setFStatus(e.target.value); setPage(1); }}>
          <option value="">Semua Status</option>
          <option>Menunggu</option>
          <option>Tervalidasi</option>
          <option>Ditolak</option>
        </select>
        {writable && (
          <button className="app-btn push" onClick={openAdd}>
            <Icon name="plus" size={14} /> Tambah Transaksi
          </button>
        )}
      </div>

      <div className="app-card">
        <div className="app-table-wrap">
          <table className="app-table" style={{ minWidth: 980 }}>
            <thead>
              <tr>
                <th>Nomor</th>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Jenis</th>
                <th>Akun Debit</th>
                <th>Akun Kredit</th>
                <th className="r">Jumlah</th>
                <th>Status</th>
                {writable && <th className="r">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 && (
                <tr>
                  <td colSpan={writable ? 9 : 8} className="app-empty-cell">
                    {!trx.ready
                      ? "Memuat data…"
                      : trx.items.length === 0
                      ? `Belum ada transaksi. ${writable ? "Klik “Tambah Transaksi” untuk mencatat transaksi pertama." : ""}`
                      : "Tidak ada transaksi yang cocok."}
                  </td>
                </tr>
              )}
              {slice.map((t) => (
                <tr key={t.id}>
                  <td className="mono">{t.nomor}</td>
                  <td className="muted">{tanggal(t.tanggal)}</td>
                  <td>
                    <div className="strong">{t.keterangan}</div>
                    {t.pihak && <div className="muted small">{t.pihak}</div>}
                  </td>
                  <td><Tag tone="gray">{t.jenis}</Tag></td>
                  <td className="muted" title={t.akunDebit}>{akunName(t.akunDebit)}</td>
                  <td className="muted" title={t.akunKredit}>{akunName(t.akunKredit)}</td>
                  <td className="r strong">{rupiah(t.jumlah)}</td>
                  <td><StatusBadge status={t.status} /></td>
                  {writable && (
                    <td>
                      <div className="app-actions">
                        {t.status === "Tervalidasi" ? (
                          <span className="muted small" title="Transaksi tervalidasi tidak dapat diubah">
                            <Icon name="lock" size={14} />
                          </span>
                        ) : (
                          <>
                            <button className="app-icon-btn" title="Ubah" onClick={() => openEdit(t)}><Icon name="edit" size={15} /></button>
                            <button className="app-icon-btn danger" title="Hapus" onClick={() => setToDelete(t)}><Icon name="trash" size={15} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={cur} pages={pages} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
      </div>

      {form && (
        <Modal
          title={form.id ? "Ubah Transaksi" : "Tambah Transaksi"}
          subtitle={`Nomor ${form.nomor}`}
          size="lg"
          onClose={() => setForm(null)}
          footer={
            <>
              <button className="app-btn-outline lg" onClick={() => setForm(null)}>Batal</button>
              <button className="app-btn" onClick={submit}>Simpan</button>
            </>
          }
        >
          <div className="app-form-grid">
            <div className="app-field">
              <label>Tanggal <em>*</em></label>
              <input type="date" className={`app-input ${errors.tanggal ? "invalid" : ""}`} value={form.tanggal} onChange={(e) => set({ tanggal: e.target.value })} />
              {errors.tanggal && <span className="app-field-err">{errors.tanggal}</span>}
            </div>
            <div className="app-field">
              <label>Jenis Transaksi <em>*</em></label>
              <select className="app-input" value={form.jenis} onChange={(e) => changeJenis(e.target.value)}>
                {JENIS_LIST.map((j) => <option key={j}>{j}</option>)}
              </select>
            </div>

            {pihakType && (
              <div className="app-field full">
                <label>{pihakType === "pelanggan" ? "Pelanggan" : "Pemasok"} (opsional)</label>
                <select className="app-input" value={form.pihak} onChange={(e) => set({ pihak: e.target.value })}>
                  <option value="">{pihakOpts.length ? "Pilih…" : `Belum ada data ${pihakType}`}</option>
                  {pihakOpts.map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>
            )}

            <div className="app-field full">
              <label>Keterangan <em>*</em></label>
              <input className={`app-input ${errors.keterangan ? "invalid" : ""}`} value={form.keterangan} placeholder="Contoh: Penjualan kertas A4 ke SD Negeri 1" onChange={(e) => set({ keterangan: e.target.value })} />
              {errors.keterangan && <span className="app-field-err">{errors.keterangan}</span>}
            </div>

            <div className="app-field">
              <label>Akun Debit <em>*</em></label>
              <select className={`app-input ${errors.akunDebit ? "invalid" : ""}`} value={form.akunDebit} onChange={(e) => set({ akunDebit: e.target.value })}>
                <option value="">Pilih akun</option>
                {akunAktif.map((a) => <option key={a.id} value={a.kode}>{a.kode} · {a.nama}</option>)}
              </select>
              {errors.akunDebit && <span className="app-field-err">{errors.akunDebit}</span>}
            </div>
            <div className="app-field">
              <label>Akun Kredit <em>*</em></label>
              <select className={`app-input ${errors.akunKredit ? "invalid" : ""}`} value={form.akunKredit} onChange={(e) => set({ akunKredit: e.target.value })}>
                <option value="">Pilih akun</option>
                {akunAktif.map((a) => <option key={a.id} value={a.kode}>{a.kode} · {a.nama}</option>)}
              </select>
              {errors.akunKredit && <span className="app-field-err">{errors.akunKredit}</span>}
            </div>

            <div className="app-field full">
              <label>Jumlah (Rp) <em>*</em></label>
              <input type="number" min={0} step="any" className={`app-input ${errors.jumlah ? "invalid" : ""}`} value={form.jumlah} placeholder="0" onChange={(e) => set({ jumlah: e.target.value })} />
              {errors.jumlah && <span className="app-field-err">{errors.jumlah}</span>}
            </div>
          </div>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Hapus Transaksi"
          message={`Hapus transaksi ${toDelete.nomor} (${toDelete.keterangan})? Tindakan ini tidak dapat dibatalkan.`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}