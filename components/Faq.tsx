"use client";

import { useState } from "react";

type FaqItem = { q: string; a: string };

const FAQS: FaqItem[] = [
  { q: "Apa itu Neracca?", a: "Neracca adalah sistem informasi akuntansi berbasis web untuk mencatat transaksi dan menyusun laporan keuangan bisnis Anda dalam satu tempat." },
  { q: "Apakah saya harus paham akuntansi untuk memakainya?", a: "Tidak. Neracca dirancang agar mudah digunakan, jurnal dan laporan dibuat otomatis dari transaksi yang Anda catat." },
  { q: "Jenis usaha apa saja yang didukung?", a: "Saat ini Neracca mendukung usaha Dagang, Jasa, dan Manufaktur, dengan alur akuntansi yang disesuaikan untuk masing-masing jenis." },
  { q: "Apakah data keuangan saya aman?", a: "Ya. Data disimpan dengan enkripsi dan akses dibatasi sesuai peran pengguna di perusahaan Anda." },
  { q: "Bagaimana cara menghubungi tim Neracca?", a: "Klik menu Hubungi Kami di bagian atas halaman, salin email resmi kami, lalu kirim pesan Anda melalui Gmail." },
];

export default function Faq() {
  const [open, setOpen] = useState<number>(0);
  return (
    <section id="qna" className="section">
      <div className="container faq">
        <p className="label">Q&amp;A</p>
        <h2 className="section-title">Pertanyaan yang sering diajukan</h2>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div className={`faq-item ${open === i ? "open" : ""}`} key={f.q}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <span>{f.q}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </button>
              <div className="faq-a"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}