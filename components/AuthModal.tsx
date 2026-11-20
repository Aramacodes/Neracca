"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login, registerCompany } from "@/lib/auth";
import type { BusinessType } from "@/lib/types";

export type AuthMode = "login" | "register" | "forgot";

type AuthModalProps = {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  onClose: () => void;
};

type FormValues = Record<string, string>;

const getValues = (form: HTMLFormElement): FormValues =>
  Object.fromEntries(
    Array.from(new FormData(form).entries()).map(([k, v]) => [k, String(v)])
  );

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export default function AuthModal({ mode, setMode, onClose }: AuthModalProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [notice, setNotice] = useState(""); // pesan sukses setelah registrasi
  const [prefill, setPrefill] = useState(""); // email otomatis terisi di popup Masuk
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  useEffect(() => {
    setError("");
    setInfo("");
  }, [mode]);

  const go = (m: AuthMode) => {
    setNotice("");
    setMode(m);
  };

  const handleGoogle = () => {
    setError("");
    setInfo("Masuk/Daftar dengan Google belum tersedia pada mode penyimpanan lokal.");
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = getValues(e.currentTarget);
    if (f.password.length < 8) return setError("Password minimal 8 karakter.");
    if (f.password !== f.confirm) return setError("Konfirmasi password tidak sama.");

    setError("");
    setBusy(true);
    const res = await registerCompany({
      companyName: f.company,
      type: f.type as BusinessType,
      ownerName: f.owner,
      email: f.email,
      password: f.password,
    });
    setBusy(false);

    if (!res.ok) return setError(res.error);
    setPrefill(f.email.trim());
    setNotice(`Akun berhasil dibuat. Silakan masuk sebagai Admin ${f.company.trim()}.`);
    setMode("login");
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = getValues(e.currentTarget);
    setError("");
    setBusy(true);
    const res = await login(f.email, f.password, f.remember === "on");
    setBusy(false);

    if (!res.ok) return setError(res.error);
    router.push("/dashboard");
  };

  const handleForgot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: kirim tautan reset password lewat backend/email
    setInfo("Jika email terdaftar, tautan reset password telah dikirim.");
  };

  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Tutup">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>

        <div className="modal-scroll">
          <div className="modal-logo">
            <img src="/logoNeracca.png" alt="Neracca" />
          </div>

          {mode === "register" && (
            <form onSubmit={handleRegister}>
              <h2>Buat akun Neracca</h2>
              <p className="modal-sub">Mulai kelola keuangan bisnis Anda.</p>
              <button type="button" className="google-btn" onClick={handleGoogle}>
                <GoogleIcon /> Daftar dengan Google
              </button>
              <div className="divider"><span>atau</span></div>

              <label>Nama Perusahaan
                <input name="company" required placeholder="PT Maju Jaya" />
              </label>
              <label>Jenis Usaha
                <select name="type" required defaultValue="">
                  <option value="" disabled>Pilih jenis usaha</option>
                  <option>Dagang</option>
                  <option>Jasa</option>
                  <option>Manufaktur</option>
                </select>
              </label>
              <label>Nama Pemilik Akun
                <input name="owner" required placeholder="Nama lengkap" />
              </label>
              <label>Email
                <input name="email" type="email" required placeholder="nama@email.com" />
              </label>
              <label>Password Baru
                <input name="password" type="password" required placeholder="Minimal 8 karakter" />
              </label>
              <label>Konfirmasi Password
                <input name="confirm" type="password" required placeholder="Ulangi password" />
              </label>

              {info && <p className="form-info">{info}</p>}
              {error && <p className="form-error">{error}</p>}
              <button type="submit" className="btn-submit" disabled={busy}>
                {busy ? "Memproses..." : "Daftar"}
              </button>
              <p className="switch">
                Sudah punya akun? <button type="button" onClick={() => go("login")}>Masuk</button>
              </p>
            </form>
          )}

          {mode === "login" && (
            <form onSubmit={handleLogin}>
              <h2>Masuk ke Neracca</h2>
              <p className="modal-sub">Selamat datang kembali.</p>
              {notice && <p className="form-info">{notice}</p>}
              <button type="button" className="google-btn" onClick={handleGoogle}>
                <GoogleIcon /> Masuk dengan Google
              </button>
              <div className="divider"><span>atau</span></div>

              <label>Email
                <input
                  key={prefill}
                  name="email"
                  type="email"
                  required
                  defaultValue={prefill}
                  placeholder="nama@email.com"
                />
              </label>
              <label>Password
                <input name="password" type="password" required placeholder="Masukkan password" />
              </label>
              <div className="row-between">
                <label className="check"><input type="checkbox" name="remember" /> Ingat Saya</label>
                <button type="button" className="link-btn" onClick={() => go("forgot")}>Lupa Password?</button>
              </div>

              {info && <p className="form-info">{info}</p>}
              {error && <p className="form-error">{error}</p>}
              <button type="submit" className="btn-submit" disabled={busy}>
                {busy ? "Memproses..." : "Masuk"}
              </button>
              <p className="switch">
                Belum punya akun? <button type="button" onClick={() => go("register")}>Daftar</button>
              </p>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgot}>
              <h2>Lupa Password</h2>
              <p className="modal-sub">Masukkan email Anda, kami kirimkan tautan untuk mengatur ulang password.</p>
              <label>Email
                <input name="email" type="email" required placeholder="nama@email.com" />
              </label>
              {info && <p className="form-info">{info}</p>}
              <button type="submit" className="btn-submit">Kirim Tautan Reset</button>
              <p className="switch">
                <button type="button" onClick={() => go("login")}>← Kembali ke Masuk</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}