"use client";

import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/components/app/AppProvider";
import { ConfirmDialog, Icon, Modal, StatusBadge, Tag, type Tone } from "@/components/app/ui";
import { addUser, deleteUser, listCompanyUsers, updateUser } from "@/lib/auth";
import { ROLES, getRoleConfig } from "@/lib/roles";
import type { RoleKey, User } from "@/lib/types";

const TONE: Record<RoleKey, Tone> = { admin: "violet", akuntan: "blue", staf: "green", pegawai: "gray" };

type FormState = { id?: string; name: string; email: string; role: RoleKey; password: string; isOwner?: boolean };

export default function PengaturanPage() {
  const { user: me, company } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState<User | null>(null);

  const reload = useCallback(() => setUsers(listCompanyUsers(company.id)), [company.id]);
  useEffect(() => reload(), [reload]);

  const openAdd = () => {
    setErr("");
    setForm({ name: "", email: "", role: "staf", password: "" });
  };
  const openEdit = (u: User) => {
    setErr("");
    setForm({ id: u.id, name: u.name, email: u.email, role: u.role, password: "", isOwner: u.isOwner });
  };

  const submit = async () => {
    if (!form) return;
    if (!form.name.trim()) return setErr("Nama wajib diisi.");
    setBusy(true);
    let res;
    if (form.id) {
      if (form.password && form.password.length < 8) {
        setBusy(false);
        return setErr("Password baru minimal 8 karakter.");
      }
      res = await updateUser(form.id, {
        name: form.name,
        role: form.isOwner ? undefined : form.role,
        password: form.password || undefined,
      });
    } else {
      if (form.password.length < 8) {
        setBusy(false);
        return setErr("Password sementara minimal 8 karakter.");
      }
      res = await addUser(company.id, { name: form.name, email: form.email, role: form.role, password: form.password });
    }
    setBusy(false);
    if (!res.ok) return setErr(res.error);
    setForm(null);
    reload();
  };

  const toggle = async (u: User) => {
    await updateUser(u.id, { active: !u.active });
    reload();
  };

  const confirmDelete = () => {
    if (!del) return;
    deleteUser(del.id);
    setDel(null);
    reload();
  };

  return (
    <div className="app-page">
      <div className="app-toolbar">
        <p className="muted">
          Tambahkan pengguna perusahaan dan atur peran masing-masing. Pengguna pertama yang mendaftar otomatis menjadi Admin (Pemilik).
        </p>
        <button className="app-btn push" onClick={openAdd}><Icon name="plus" size={14} /> Tambah Pengguna</button>
      </div>

      <div className="app-card">
        <div className="app-table-wrap">
          <table className="app-table">
            <thead>
              <tr><th>Nama</th><th>Email</th><th>Peran</th><th>Status</th><th className="r">Aksi</th></tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const self = u.id === me.id;
                return (
                  <tr key={u.id}>
                    <td>
                      <span className="strong">{u.name}</span>{" "}
                      {u.isOwner && <Tag tone="blue">Pemilik</Tag>} {self && <span className="muted small">(Anda)</span>}
                    </td>
                    <td className="muted">{u.email}</td>
                    <td><Tag tone={TONE[u.role]}>{getRoleConfig(u.role, company.type).label}</Tag></td>
                    <td><StatusBadge status={u.active ? "Aktif" : "Nonaktif"} /></td>
                    <td>
                      <div className="app-actions">
                        <button className="app-icon-btn" title="Ubah" onClick={() => openEdit(u)}><Icon name="edit" size={15} /></button>
                        <button
                          className="app-icon-btn"
                          title={u.active ? "Nonaktifkan" : "Aktifkan"}
                          disabled={self || u.isOwner}
                          onClick={() => toggle(u)}
                        >
                          <Icon name={u.active ? "lock" : "unlock"} size={15} />
                        </button>
                        <button className="app-icon-btn danger" title="Hapus" disabled={self || u.isOwner} onClick={() => setDel(u)}>
                          <Icon name="trash" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dash-panel">
        <h3>Hak akses setiap peran ({company.type})</h3>
        <div className="role-grid">
          {(Object.keys(ROLES) as RoleKey[]).map((k) => {
            const cfg = getRoleConfig(k, company.type);
            return (
              <div className="role-card" key={k}>
                <Tag tone={TONE[k]}>{cfg.label}</Tag>
                <p>{cfg.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {form && (
        <Modal
          title={form.id ? "Ubah Pengguna" : "Tambah Pengguna"}
          subtitle={form.id ? form.email : "Pengguna dapat masuk dengan email dan password sementara."}
          onClose={() => setForm(null)}
          footer={
            <>
              <button className="app-btn-outline lg" onClick={() => setForm(null)}>Batal</button>
              <button className="app-btn" onClick={submit} disabled={busy}>{busy ? "Menyimpan…" : "Simpan"}</button>
            </>
          }
        >
          <div className="app-form-grid">
            <div className="app-field full">
              <label>Nama Lengkap <em>*</em></label>
              <input className="app-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            {!form.id && (
              <div className="app-field full">
                <label>Email <em>*</em></label>
                <input className="app-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            )}
            <div className="app-field full">
              <label>Peran</label>
              <select
                className="app-input"
                value={form.role}
                disabled={form.isOwner}
                onChange={(e) => setForm({ ...form, role: e.target.value as RoleKey })}
              >
                {(Object.keys(ROLES) as RoleKey[]).map((k) => (
                  <option key={k} value={k}>{getRoleConfig(k, company.type).label}</option>
                ))}
              </select>
              <span className="muted small">{getRoleConfig(form.role, company.type).desc}</span>
            </div>
            <div className="app-field full">
              <label>{form.id ? "Reset Password (opsional)" : "Password Sementara"}{!form.id && <em> *</em>}</label>
              <input
                className="app-input"
                type="text"
                value={form.password}
                placeholder={form.id ? "Kosongkan jika tidak diubah" : "Minimal 8 karakter"}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>
          {err && <p className="app-error-box">{err}</p>}
        </Modal>
      )}

      {del && (
        <ConfirmDialog
          title="Hapus Pengguna"
          message={`Hapus pengguna “${del.name}”? Ia tidak akan bisa masuk lagi.`}
          onConfirm={confirmDelete}
          onCancel={() => setDel(null)}
        />
      )}
    </div>
  );
}