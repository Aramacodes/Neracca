import { CONTACT_EMAIL } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="/logoNeracca.png" alt="Neracca" />
          <p>Sistem informasi akuntansi untuk bisnis yang lebih tertata dan keputusan yang lebih terarah.</p>
        </div>
        <div>
          <h4>Navigasi</h4>
          <a href="#fitur">Fitur Unggulan</a>
          <a href="#kategori">Kategori</a>
          <a href="#qna">Q&amp;A</a>
        </div>
        <div>
          <h4>Kategori</h4>
          <a href="#kategori">Dagang</a>
          <a href="#kategori">Jasa</a>
          <a href="#kategori">Manufaktur</a>
        </div>
        <div>
          <h4>Kontak</h4>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2025 Neracca. Hak cipta dilindungi.</span>
      </div>
    </footer>
  );
}