"use client";

import { useState } from "react";
import { useApp } from "@/components/app/AppProvider";
import { Icon, Tag } from "@/components/app/ui";
import { changePassword, updateCompany, updateUser } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { initials } from "@/lib/format";

type Msg = { ok: boolean; text: string } | null;

export default function AkunPage() {
  const { user, company, role, refresh, logout } = useApp();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [pMsg, setPMsg] = useState<Msg>(null);

  const [cName, setCName] = useState(company.name);
  const [cMsg, setCMsg] = useState<Msg>(null);

  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [cf, setCf] = useState("");
  const [wMsg, setWMsg] = useState<Msg>(null);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setPMsg({ ok: false, text: "Nama tidak boleh kosong." });
    const res = await updateUser(user.id, { name, email });
    if (!res.ok) return setPMsg({ ok: false, text: res.error });
    refresh();
    setPMsg({ ok: true, text: "Profil berhasil diperbarui." });
  };

  const saveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) return setCMsg({ ok: false, text: "Nama perusahaan tidak boleh kosong." });
    updateCompany(company.id, { name: cName });
    refresh();
    setCMsg({ ok: true, text: "Data perusahaan berhasil diperbarui." });
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nw.length < 8) return setWMsg({ ok: false, text: "Password baru minimal 8 karakter." });
    if (nw !== cf) return setWMsg({ ok: false, text: "Konfirmasi password tidak sama." });
    const res = await changePassword(user.id, cur, nw);
    if (!res.ok) return setWMsg({ ok: false, text: res.error });
    setCur(""); setNw(""); setCf("");
    setWMsg({ ok: true, text: "Password berhasil diubah." });
  };

  const Msg = ({ m }: { m: Msg }) =>
    m ? <p className={`app-msg ${m.ok ? "ok" : "err"}`}>{m.text}</p> : null;

  return (
    <div className="acc-grid">
      <div className="dash-panel acc-profile">
        <span className="app-avatar xl">{initials(user.name)}</span>
        <h3>{user.name}</h3>
        <p className="muted">{user.email}</p>
        <div className="acc-tags">
          <Tag tone="violet">{ROLES[role].label}</Tag>
          {user.isOwner && <Tag tone="blue">Pemilik</Tag>}
        </div>
        <dl className="acc-dl">
          <div><dt>Perusahaan</dt><dd>{company.name}</dd></div>
          <div><dt>Jenis Usaha</dt><dd>{company.type}</dd></div>
          <div>
            <dt>Bergabung</dt>
            <dd>{new Date(user.createdAt).toLocaleDateString("id-ID", { dateStyle: "long" })}</dd>
          </div>
        </dl>
        <p className="acc-role-desc">{ROLES[role].desc}</p>
        <button className="app-btn-outline lg" onClick={logout}>
          <Icon name="logout" size={14} /> Keluar
        </button>
      </div>

      <div className="acc-forms">
        <form className="dash-panel" onSubmit={saveProfile}>
          <h3>Profil</h3>
          <div className="app-form-grid">
            <div className="app-field">
              <label>Nama Lengkap</label>
              <input className="app-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="app-field">
              <label>Email</label>
              <input className="app-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <Msg m={pMsg} />
          <button className="app-btn" type="submit">Simpan Profil</button>
        </form>

        <form className="dash-panel" onSubmit={saveCompany}>
          <h3>Perusahaan</h3>
          <div className="app-form-grid">
            <div className="app-field">
              <label>Nama Perusahaan</label>
              <input className="app-input" value={cName} disabled={role !== "admin"} onChange={(e) => setCName(e.target.value)} />
            </div>
            <div className="app-field">
              <label>Jenis Usaha</label>
              <input className="app-input" value={company.type} disabled />
            </div>
          </div>
          {role === "admin" ? (
            <>
              <Msg m={cMsg} />
              <button className="app-btn" type="submit">Simpan Perusahaan</button>
            </>
          ) : (
            <p className="muted small">Hanya Admin yang dapat mengubah data perusahaan.</p>
          )}
        </form>

        <form className="dash-panel" onSubmit={savePassword}>
          <h3>Ubah Password</h3>
          <div className="app-form-grid">
            <div className="app-field full">
              <label>Password Saat Ini</label>
              <input className="app-input" type="password" value={cur} onChange={(e) => setCur(e.target.value)} required />
            </div>
            <div className="app-field">
              <label>Password Baru</label>
              <input className="app-input" type="password" value={nw} onChange={(e) => setNw(e.target.value)} required />
            </div>
            <div className="app-field">
              <label>Konfirmasi Password Baru</label>
              <input className="app-input" type="password" value={cf} onChange={(e) => setCf(e.target.value)} required />
            </div>
          </div>
          <Msg m={wMsg} />
          <button className="app-btn" type="submit">Ubah Password</button>
        </form>
      </div>
    </div>
  );
}