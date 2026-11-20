"use client";

import { useEffect, useState } from "react";
import { CONTACT_EMAIL } from "@/lib/config";

type NavbarProps = {
  onLogin: () => void;
  onRegister: () => void;
};

const LINKS = [
  { label: "Fitur Unggulan", href: "#fitur" },
  { label: "Kategori", href: "#kategori" },
  { label: "Q&A", href: "#qna" },
];

export default function Navbar({ onLogin, onRegister }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest("[data-contact-root]")) {
        setContactOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard tidak tersedia */
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const Contact = (
    <div className="contact" data-contact-root>
      <button
        className="nav-link contact-btn"
        onClick={() => setContactOpen((v) => !v)}
        aria-expanded={contactOpen}
      >
        Hubungi Kami
        <svg className={`chev ${contactOpen ? "open" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {contactOpen && (
        <div className="contact-dropdown nav-glass max-w-[calc(100vw_-_3rem)] rounded-2xl border border-white/40 bg-white/80 shadow-xl shadow-black/10 backdrop-blur-xl backdrop-saturate-150">
          <p className="contact-title">Email resmi Neracca</p>
          <div className="contact-row">
            <span className="contact-email">{CONTACT_EMAIL}</span>
            <button className="copy-btn" onClick={copyEmail}>
              {copied ? "Tersalin ✓" : "Salin"}
            </button>
          </div>
          <a
            className="gmail-link"
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Kirim lewat Gmail →
          </a>
        </div>
      )}
    </div>
  );

  return (
    <header
      className={`nav-glass fixed left-1/2 top-4 z-50 w-[calc(100%_-_2rem)] max-w-6xl -translate-x-1/2 rounded-2xl border border-white/40 px-6 py-3 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 md:rounded-full ${
        scrolled ? "bg-white/80 shadow-xl shadow-black/10" : "bg-white/60 shadow-lg shadow-black/5"
      }`}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <a href="#top" className="logo col-start-1 shrink-0 justify-self-start" onClick={closeMenu}>
          <img src="/logoNeracca.png" alt="Neracca" />
        </a>

        <nav className="col-start-2 hidden items-center justify-self-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} className="nav-link" href={link.href} onClick={closeMenu}>
              {link.label}
            </a>
          ))}
          {Contact}
        </nav>

        <div className="col-start-3 flex items-center justify-self-end gap-4">
          <div className="hidden items-center gap-4 md:flex">
            <button className="nav-link" onClick={onLogin}>Masuk</button>
            <button className="btn-pill" onClick={onRegister}>Daftar</button>
          </div>

          <button
            className="grid h-10 w-10 place-items-center rounded-full md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          className="nav-glass absolute left-0 right-0 top-full mt-2 rounded-2xl border border-white/40 bg-white/80 p-4 shadow-xl shadow-black/10 backdrop-blur-xl backdrop-saturate-150 md:hidden"
        >
          <div className="flex flex-col">
            {LINKS.map((link) => (
              <a key={link.href} className="nav-link w-full py-3" href={link.href} onClick={closeMenu}>
                {link.label}
              </a>
            ))}
            {Contact}
            <div className="nav-actions-mobile mt-3 border-t border-black/5">
              <button className="nav-link" onClick={() => { closeMenu(); onLogin(); }}>Masuk</button>
              <button className="btn-pill" onClick={() => { closeMenu(); onRegister(); }}>Daftar</button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
