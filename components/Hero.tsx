"use client";

import { useEffect, useState } from "react";

const WORDS = ["Perdagangan", "Jasa", "Manufaktur"];
const LINE_H = 24; // px, harus sama dengan CSS .rot-item

function RotatingText() {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const list = [...WORDS, WORDS[0]]; // item pertama diulang agar loop mulus

  // ganti teks tiap 3 detik
  useEffect(() => {
    const t = setInterval(() => {
      setAnimate(true);
      setIndex((p) => p + 1);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  // setelah sampai item duplikat, lompat ke awal tanpa animasi
  useEffect(() => {
    if (index === WORDS.length) {
      const t = setTimeout(() => {
        setAnimate(false);
        setIndex(0);
      }, 650);
      return () => clearTimeout(t);
    }
  }, [index]);

  return (
    <span className="rot-window">
      {/* Penentu lebar tetap: semua kata ditumpuk, lebar mengikuti kata terpanjang */}
      <span className="rot-sizer" aria-hidden="true">
        {WORDS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </span>

      <span
        className="rot-track"
        style={{
          transform: `translateY(-${index * LINE_H}px)`,
          transition: animate ? "transform 0.6s cubic-bezier(.65,0,.35,1)" : "none",
        }}
      >
        {list.map((w, i) => (
          <span key={i} className="rot-item">
            {w}
          </span>
        ))}
      </span>
    </span>
  );
}

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="container hero-text">
        <p className="eyebrow">
          <span>Sistem akuntansi untuk Bisnis</span>
          <RotatingText />
        </p>
        <h1>Bisnis lebih tertata, keputusan lebih terarah</h1>
        <p className="subhead">
          <span className="sub-line">Kelola informasi keuangan secara lengkap dalam satu sistem, mulai dari</span>{" "}
          <span className="sub-line">pencatatan transaksi hingga penyusunan laporan.</span>
        </p>
      </div>
      <img className="hero-img" src="/gambarLandingPage.png" alt="Ilustrasi pencatatan keuangan Neracca" />
    </section>
  );
}