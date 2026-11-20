"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useApp } from "./AppProvider";
import { ConfirmDialog, Icon, Modal, Pagination, StatusBadge } from "./ui";
import { nextCode, readCollection, uid, useCollection } from "@/lib/storage";

export type Row = {
  id: string;
  status: string;
  [key: string]: string | number | undefined;
};

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "number" | "email" | "tel" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: (string | { value: string; label: string })[];
  lookup?: { resource: string; value: string; label: string };
  half?: boolean;
  mono?: boolean;
  uppercase?: boolean;
  lockOnEdit?: boolean;
  autoCode?: { prefix: string; pad: number };
  defaultValue?: string;
};

export type ColumnDef = {
  label: string;
  key?: string;
  render?: (row: Row) => ReactNode;
  align?: "right";
  mono?: boolean;
  strong?: boolean;
  muted?: boolean;
};

export type CrudConfig = {
  resource: string;
  noun: string;
  addLabel: string;
  columns: ColumnDef[];
  fields: FieldDef[];
  searchKeys: string[];
  filters?: { key: string; allLabel: string; options: string[] }[];
  uniqueKey?: string;
  deleteGuard?: (row: Row, companyId: string) => string | null;
};

const PAGE_SIZE = 10;

type FormState = {
  mode: "add" | "edit";
  id?: string;
  values: Record<string, string>;
};

export default function CrudPage({ config }: { config: CrudConfig }) {
  const { company, can } = useApp();
  const writable = can(config.resource);
  const { items, ready, commit } = useCollection<Row>(
    company.id,
    config.resource
  );

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<Row | null>(null);
  const [delError, setDelError] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    return [...items]
      .sort((a, b) =>
        String(a.kode ?? "").localeCompare(
          String(b.kode ?? ""),
          undefined,
          { numeric: true }
        )
      )
      .filter(
        (r) =>
          (!status || r.status === status) &&
          (config.filters ?? []).every(
            (f) => !extra[f.key] || String(r[f.key]) === extra[f.key]
          ) &&
          (!s ||
            config.searchKeys.some((k) =>
              String(r[k] ?? "").toLowerCase().includes(s)
            ))
      );
  }, [items, q, status, extra, config]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const slice = filtered.slice(
    (cur - 1) * PAGE_SIZE,
    cur * PAGE_SIZE
  );

  const optionsOf = (
    f: FieldDef
  ): { value: string; label: string }[] => {
    if (f.lookup) {
      const lk = f.lookup;

      return readCollection<Row>(company.id, lk.resource)
        .filter((x) => x.status === "Aktif")
        .map((x) => ({
          value: String(x[lk.value]),
          label: `${x[lk.value]} — ${x[lk.label]}`,
        }));
    }

    return (f.options ?? []).map((o) =>
      typeof o === "string"
        ? { value: o, label: o }
        : o
    );
  };

  const openAdd = () => {
    const values: Record<string, string> = {};

    config.fields.forEach((f) => {
      values[f.name] = f.autoCode
        ? nextCode(
            items.map((i) => String(i[f.name] ?? "")),
            f.autoCode.prefix,
            f.autoCode.pad
          )
        : f.defaultValue ?? "";
    });

    values.status = "Aktif";

    setErrors({});
    setForm({
      mode: "add",
      values,
    });
  };

  const openEdit = (r: Row) => {
    const values: Record<string, string> = {};

    config.fields.forEach(
      (f) => (values[f.name] = String(r[f.name] ?? ""))
    );

    values.status = r.status;

    setErrors({});
    setForm({
      mode: "edit",
      id: r.id,
      values,
    });
  };

  const setVal = (
    f: FieldDef | { name: string; uppercase?: boolean },
    v: string
  ) =>
    setForm((s) =>
      s
        ? {
            ...s,
            values: {
              ...s.values,
              [f.name]: f.uppercase ? v.toUpperCase() : v,
            },
          }
        : s
    );

  const submit = () => {
    if (!form) return;

    const errs: Record<string, string> = {};

    for (const f of config.fields) {
      const v = (form.values[f.name] ?? "").trim();

      if (f.required && !v) {
        errs[f.name] = `${f.label} wajib diisi.`;
      } else if (
        v &&
        f.type === "email" &&
        !/^\S+@\S+\.\S+$/.test(v)
      ) {
        errs[f.name] = "Format email tidak valid.";
      } else if (
        v &&
        f.type === "number" &&
        (isNaN(Number(v)) || Number(v) < 0)
      ) {
        errs[f.name] = "Masukkan angka yang valid.";
      }
    }

    const uk = config.uniqueKey;

    if (uk && !errs[uk]) {
      const v = (form.values[uk] ?? "")
        .trim()
        .toLowerCase();

      if (
        v &&
        items.some(
          (i) =>
            i.id !== form.id &&
            String(i[uk]).toLowerCase() === v
        )
      ) {
        const label =
          config.fields.find((f) => f.name === uk)?.label ??
          "Kode";

        errs[uk] = `${label} sudah digunakan.`;
      }
    }

    setErrors(errs);

    if (Object.keys(errs).length) return;

    const data: Record<string, string | number> = {};

    config.fields.forEach((f) => {
      const v = (form.values[f.name] ?? "").trim();

      data[f.name] =
        f.type === "number" ? Number(v || 0) : v;
    });

    data.status = form.values.status || "Aktif";

    if (form.mode === "add") {
      commit([
        ...items,
        {
          id: uid(),
          ...data,
          status: String(data.status ?? "Aktif"),
          createdAt: new Date().toISOString(),
        },
      ]);
    } else {
      commit(
        items.map((i) =>
          i.id === form.id
            ? {
                ...i,
                ...data,
                status: String(data.status ?? i.status),
              }
            : i
        )
      );
    }

    setForm(null);
  };

  const toggleStatus = (r: Row) =>
    commit(
      items.map((i) =>
        i.id === r.id
          ? {
              ...i,
              status:
                i.status === "Aktif"
                  ? "Nonaktif"
                  : "Aktif",
            }
          : i
      )
    );

  const askDelete = (r: Row) => {
    setDelError(
      config.deleteGuard?.(r, company.id) ?? ""
    );
    setToDelete(r);
  };

  const confirmDelete = () => {
    if (!toDelete) return;

    commit(
      items.filter((i) => i.id !== toDelete.id)
    );

    setToDelete(null);
  };

  const colSpan =
    config.columns.length + 1 + (writable ? 1 : 0);

  const renderInput = (f: FieldDef) => {
    if (!form) return null;

    const value = form.values[f.name] ?? "";
    const disabled =
      form.mode === "edit" && !!f.lockOnEdit;

    const cls = `app-input ${f.mono ? "mono" : ""} ${
      errors[f.name] ? "invalid" : ""
    }`;

    if (f.type === "select") {
      const opts = optionsOf(f);

      return (
        <select
          className={cls}
          value={value}
          disabled={disabled}
          onChange={(e) =>
            setVal(f, e.target.value)
          }
        >
          <option value="">
            {opts.length
              ? `Pilih ${f.label.toLowerCase()}`
              : "Belum ada pilihan"}
          </option>

          {opts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }

    if (f.type === "textarea") {
      return (
        <textarea
          className={cls}
          rows={3}
          value={value}
          placeholder={f.placeholder}
          onChange={(e) =>
            setVal(f, e.target.value)
          }
        />
      );
    }

    return (
      <input
        className={cls}
        type={f.type ?? "text"}
        min={f.type === "number" ? 0 : undefined}
        step={f.type === "number" ? "any" : undefined}
        value={value}
        disabled={disabled}
        placeholder={f.placeholder}
        onChange={(e) =>
          setVal(f, e.target.value)
        }
      />
    );
  };

  return (
    <div className="app-page">
      <div className="app-toolbar">
        <div className="app-search">
          <Icon name="search" size={15} />

          <input
            className="app-input"
            placeholder="Cari kode atau nama..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {(config.filters ?? []).map((f) => (
          <select
            key={f.key}
            className="app-input app-select"
            value={extra[f.key] ?? ""}
            onChange={(e) => {
              setExtra((s) => ({
                ...s,
                [f.key]: e.target.value,
              }));
              setPage(1);
            }}
          >
            <option value="">
              {f.allLabel}
            </option>

            {f.options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ))}

        <select
          className="app-input app-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">
            Semua Status
          </option>
          <option>Aktif</option>
          <option>Nonaktif</option>
        </select>

        {writable && (
          <button
            className="app-btn push"
            onClick={openAdd}
          >
            <Icon name="plus" size={14} />{" "}
            {config.addLabel}
          </button>
        )}
      </div>

      <div className="app-card">
        <div className="app-table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                {config.columns.map((c) => (
                  <th
                    key={c.label}
                    className={
                      c.align === "right"
                        ? "r"
                        : ""
                    }
                  >
                    {c.label}
                  </th>
                ))}

                <th>Status</th>

                {writable && (
                  <th className="r">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {slice.length === 0 && (
                <tr>
                  <td
                    colSpan={colSpan}
                    className="app-empty-cell"
                  >
                    {!ready
                      ? "Memuat data…"
                      : items.length === 0
                      ? `Belum ada data. ${
                          writable
                            ? `Klik “${config.addLabel}” untuk menambahkan.`
                            : ""
                        }`
                      : "Tidak ada data yang cocok dengan pencarian."}
                  </td>
                </tr>
              )}

              {slice.map((r) => (
                <tr key={r.id}>
                  {config.columns.map((c) => (
                    <td
                      key={c.label}
                      className={`${c.align === "right" ? "r" : ""} ${
                        c.mono ? "mono" : ""
                      } ${c.strong ? "strong" : ""} ${
                        c.muted ? "muted" : ""
                      }`}
                    >
                      {c.render
                        ? c.render(r)
                        : String(
                            (c.key &&
                              r[c.key]) ??
                              ""
                          )}
                    </td>
                  ))}

                  <td>
                    <StatusBadge
                      status={r.status}
                    />
                  </td>

                  {writable && (
                    <td>
                      <div className="app-actions">
                        <button
                          className="app-icon-btn"
                          title="Ubah"
                          onClick={() =>
                            openEdit(r)
                          }
                        >
                          <Icon
                            name="edit"
                            size={15}
                          />
                        </button>

                        <button
                          className="app-icon-btn"
                          title={
                            r.status ===
                            "Aktif"
                              ? "Nonaktifkan"
                              : "Aktifkan"
                          }
                          onClick={() =>
                            toggleStatus(r)
                          }
                        >
                          <Icon
                            name={
                              r.status ===
                              "Aktif"
                                ? "lock"
                                : "unlock"
                            }
                            size={15}
                          />
                        </button>

                        <button
                          className="app-icon-btn danger"
                          title="Hapus"
                          onClick={() =>
                            askDelete(r)
                          }
                        >
                          <Icon
                            name="trash"
                            size={15}
                          />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={cur}
          pages={pages}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onPage={setPage}
        />
      </div>

      {form && (
        <Modal
          title={`${
            form.mode === "add"
              ? "Tambah"
              : "Ubah"
          } ${config.noun}`}
          subtitle="Lengkapi data di bawah ini."
          onClose={() => setForm(null)}
          footer={
            <>
              <button
                className="app-btn-outline lg"
                onClick={() =>
                  setForm(null)
                }
              >
                Batal
              </button>

              <button
                className="app-btn"
                onClick={submit}
              >
                Simpan
              </button>
            </>
          }
        >
          <div className="app-form-grid">
            {config.fields.map((f) => (
              <div
                key={f.name}
                className={`app-field ${
                  f.half ? "" : "full"
                }`}
              >
                <label>
                  {f.label}
                  {f.required && (
                    <em> *</em>
                  )}
                </label>

                {renderInput(f)}

                {errors[f.name] && (
                  <span className="app-field-err">
                    {errors[f.name]}
                  </span>
                )}
              </div>
            ))}

            <div className="app-field">
              <label>Status</label>

              <select
                className="app-input"
                value={
                  form.values.status
                }
                onChange={(e) =>
                  setVal(
                    {
                      name: "status",
                    },
                    e.target.value
                  )
                }
              >
                <option>
                  Aktif
                </option>
                <option>
                  Nonaktif
                </option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title={`Hapus ${config.noun}`}
          message={`Hapus ${config.noun.toLowerCase()} “${
            toDelete.nama ??
            toDelete.kode
          }”? Tindakan ini tidak dapat dibatalkan.`}
          error={delError}
          onConfirm={confirmDelete}
          onCancel={() =>
            setToDelete(null)
          }
        />
      )}
    </div>
  );
}