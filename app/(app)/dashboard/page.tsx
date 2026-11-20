"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useApp } from "@/components/app/AppProvider";
import { Icon, StatusBadge, Tag, type IconName } from "@/components/app/ui";
import { getRoleConfig } from "@/lib/roles";
import { useCollection } from "@/lib/storage";
import { rupiah, rupiahCompact, tanggal } from "@/lib/format";
import type { Akun, Mitra, Produk, Transaksi } from "@/lib/types";

const pad = (n: number) => String(n).padStart(2, "0");

export default function DashboardPage() {
  const { user, company, role, can } = useApp();
  const trx = useCollection<Transaksi>(company.id, "transaksi");
  const akun = useCollection<Akun>(company.id, "akun");
  const produk = useCollection<Produk>(company.id, "produk");
  const pelanggan = useCollection<Mitra>(company.id, "pelanggan");
  const pemasok = useCollection<Mitra>(company.id, "pemasok");

  const stats = useMemo(() => {
    const map = new Map(akun.items.map((a) => [a.kode, a]));
    const rev: Record<string, number> = {};
    const exp: Record<string, number> = {};
    let kas = 0, piutang = 0, utang = 0, menunggu = 0;

    for (const t of trx.items) {
      if (t.status === "Menunggu") menunggu++;
      if (t.status === "Ditolak") continue;
      const m = t.tanggal.slice(0, 7);
      const d = map.get(t.akunDebit);
      const k = map.get(t.akunKredit);

      if (d?.klasifikasi === "Pendapatan") rev[m] = (rev[m] ?? 0) - t.jumlah;
      if (k?.klasifikasi === "Pendapatan") rev[m] = (rev[m] ?? 0) + t.jumlah;
      if (d?.klasifikasi === "Beban") exp[m] = (exp[m] ?? 0) + t.jumlah;
      if (k?.klasifikasi === "Beban") exp[m] = (exp[m] ?? 0) - t.jumlah;

      if (t.akunDebit === "1-1100") kas += t.jumlah;
      if (t.akunKredit === "1-1100") kas -= t.jumlah;
      if (t.akunDebit === "1-1200") piutang += t.jumlah;
      if (t.akunKredit === "1-1200") piutang -= t.jumlah;
      if (t.akunKredit === "2-1100") utang += t.jumlah;
      if (t.akunDebit === "2-1100") utang -= t.jumlah;
    }

    const now = new Date();
    const series = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      return {
        key,
        label: d.toLocaleDateString("id-ID", { month: "short" }),
        rev: rev[key] ?? 0,
        exp: exp[key] ?? 0,
      };
    });
    const thisKey = series[series.length - 1].key;
    return {
      kas, piutang, utang, menunggu, series,
      revNow: rev[thisKey] ?? 0,
      expNow: exp[thisKey] ?? 0,
    };
  }, [trx.items, akun.items]);

  const recent = useMemo(
    () => [...trx.items].sort((a, b) => (b.tanggal + b.createdAt).localeCompare(a.tanggal + a.createdAt)).slice(0, 5),
    [trx.items]
  );

  const max = Math.max(1, ...stats.series.flatMap((s) => [Math.max(s.rev, 0), Math.max(s.exp, 0)]));
  const laba = stats.revNow - stats.expNow;
  const firstName = user.name.split(" ")[0];

  const cards: { label: string; value: string; hint: string; icon: IconName }[] = [
    { label: "Saldo Kas & Bank", value: rupiah(stats.kas), hint: "Akumulasi seluruh transaksi", icon: "wallet" },
    { label: "Pendapatan Bulan Ini", value: rupiah(stats.revNow), hint: "Dari akun pendapatan", icon: "trend-up" },
    { label: "Beban Bulan Ini", value: rupiah(stats.expNow), hint: "Beban & HPP", icon: "trend-down" },
    { label: laba >= 0 ? "Laba Bulan Ini" : "Rugi Bulan Ini", value: rupiah(laba), hint: "Pendapatan dikurangi beban", icon: "chart" },
  ];

  return (
    <div className="app-page">
      <div className="dash-hero">
        <div>
          <h2>Halo, {firstName} 👋</h2>
          <p>
            <span>{company.name}</span>
            <Tag tone="violet">Bisnis {company.type}</Tag>
            <Tag tone="gray">{getRoleConfig(role, company.type).label}</Tag>
          </p>
        </div>
        <div className="dash-hero-actions">
          {can("transaksi") && (
            <Link href="/transaksi" className="app-btn"><Icon name="plus" size={14} /> Catat Transaksi</Link>
          )}
        </div>
      </div>

      <div className="dash-stats">
        {cards.map((c) => (
          <div className="dash-stat" key={c.label}>
            <div className="dash-stat-top">
              <span>{c.label}</span>
              <span className="dash-ico"><Icon name={c.icon} size={16} /></span>
            </div>
            <b>{c.value}</b>
            <small>{c.hint}</small>
          </div>
        ))}
      </div>

      <div className="dash-cols">
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h3>Pendapatan vs Beban</h3>
            <div className="dash-legend">
              <span><i className="rev" /> Pendapatan</span>
              <span><i className="exp" /> Beban</span>
            </div>
          </div>
          <div className="dash-chart">
            {stats.series.map((s) => (
              <div className="dash-col" key={s.key}>
                <div className="dash-bars">
                  <span className="dash-bar rev" style={{ height: `${(Math.max(s.rev, 0) / max) * 100}%` }} title={`Pendapatan ${rupiah(s.rev)}`} />
                  <span className="dash-bar exp" style={{ height: `${(Math.max(s.exp, 0) / max) * 100}%` }} title={`Beban ${rupiah(s.exp)}`} />
                </div>
                <span className="dash-lbl">{s.label}</span>
              </div>
            ))}
          </div>
          <p className="dash-note">Nilai tertinggi periode ini: {rupiahCompact(max === 1 ? 0 : max)}</p>
        </div>

        <div className="dash-panel">
          <h3>Ringkasan</h3>
          <ul className="dash-list">
            <li><span>Piutang usaha</span><b>{rupiah(stats.piutang)}</b></li>
            <li><span>Utang usaha</span><b>{rupiah(stats.utang)}</b></li>
            <li><span>Transaksi menunggu validasi</span><b>{stats.menunggu}</b></li>
            <li><span>Akun aktif (COA)</span><b>{akun.items.filter((a) => a.status === "Aktif").length}</b></li>
            <li><span>Produk aktif</span><b>{produk.items.filter((p) => p.status === "Aktif").length}</b></li>
            <li><span>Pelanggan aktif</span><b>{pelanggan.items.filter((p) => p.status === "Aktif").length}</b></li>
            <li><span>Pemasok aktif</span><b>{pemasok.items.filter((p) => p.status === "Aktif").length}</b></li>
          </ul>
        </div>
      </div>

      <div className="dash-panel">
        <div className="dash-panel-head">
          <h3>Transaksi Terbaru</h3>
          <Link href="/transaksi" className="dash-link">Lihat semua →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="dash-empty">Belum ada transaksi. Catat transaksi pertama Anda di menu Transaksi.</p>
        ) : (
          <div className="app-table-wrap">
            <table className="app-table" style={{ minWidth: 640 }}>
              <thead>
                <tr><th>Nomor</th><th>Tanggal</th><th>Keterangan</th><th className="r">Jumlah</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id}>
                    <td className="mono">{t.nomor}</td>
                    <td className="muted">{tanggal(t.tanggal)}</td>
                    <td className="strong">{t.keterangan}</td>
                    <td className="r strong">{rupiah(t.jumlah)}</td>
                    <td><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}