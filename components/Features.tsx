type MarqueeItem = { name: string; icon: string };
type FeatureCard = { t: string; d: string };

const MARQUEE: MarqueeItem[] = [
  { name: "Pencatatan", icon: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM21 21l-4.3-4.3M11 8v6M8 11h6" },
  { name: "Jurnal Umum", icon: "M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" },
  { name: "Buku Besar", icon: "M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM9 8h6M9 12h6M9 16h4" },
  { name: "Neraca", icon: "M12 21s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.5-8 11-8 11Z" },
  { name: "Laporan", icon: "M12 16V4M7 9l5-5 5 5M5 20h14" },
];

const CARDS: FeatureCard[] = [
  { t: "Pencatatan Transaksi", d: "Catat penjualan, pembelian, kas, dan biaya dengan cepat dan rapi." },
  { t: "Jurnal Otomatis", d: "Setiap transaksi langsung tercatat menjadi jurnal akuntansi yang akurat." },
  { t: "Laporan Keuangan", d: "Neraca, laba rugi, dan arus kas tersusun otomatis kapan pun dibutuhkan." },
  { t: "Manajemen Persediaan", d: "Pantau stok barang dan nilai persediaan secara real-time." },
  { t: "Piutang & Utang", d: "Kontrol tagihan pelanggan dan kewajiban ke pemasok dalam satu tempat." },
  { t: "Akses Aman", d: "Data bisnis tersimpan terenkripsi dengan hak akses sesuai peran." },
];

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function Features() {
  const items = [...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE];
  return (
    <section id="fitur" className="features">
      <p className="label">BERBAGAI FITUR UNGGULAN</p>
      <div className="marquee">
        <div className="marquee-track">
          {items.map((it, i) => (
            <div className="marquee-item" key={i}>
              <span className="marquee-icon"><Icon d={it.icon} /></span>
              <span>{it.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container card-grid">
        {CARDS.map((c) => (
          <div className="card" key={c.t}>
            <h3>{c.t}</h3>
            <p>{c.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}