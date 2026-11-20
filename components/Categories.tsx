type Category = { t: string; d: string; pts: string[] };

const CATS: Category[] = [
  {
    t: "Dagang",
    d: "Cocok untuk toko, distributor, dan retailer. Kelola stok, pembelian, penjualan, serta margin keuntungan.",
    pts: ["Persediaan & HPP", "Penjualan & pembelian", "Piutang dan utang usaha"],
  },
  {
    t: "Jasa",
    d: "Untuk konsultan, agensi, dan penyedia layanan. Catat pendapatan jasa, tagihan, dan biaya operasional.",
    pts: ["Invoice & penagihan", "Pendapatan per proyek", "Biaya operasional"],
  },
  {
    t: "Manufaktur",
    d: "Untuk produsen barang. Hitung biaya bahan baku, tenaga kerja, dan overhead hingga barang jadi.",
    pts: ["Bahan baku & produksi", "Harga pokok produksi", "Persediaan barang jadi"],
  },
];

export default function Categories() {
  return (
    <section id="kategori" className="section section-alt">
      <div className="container">
        <p className="label">KATEGORI</p>
        <h2 className="section-title">Dirancang untuk berbagai jenis usaha</h2>
        <p className="section-sub">Pilih jenis usaha Anda, Neracca menyesuaikan alur akuntansinya.</p>
        <div className="cat-grid">
          {CATS.map((c) => (
            <div className="cat-card" key={c.t}>
              <h3>{c.t}</h3>
              <p>{c.d}</p>
              <ul>
                {c.pts.map((p) => (
                  <li key={p}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D00E0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}