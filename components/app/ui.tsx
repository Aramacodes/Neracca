"use client";

import { useEffect, type ReactNode } from "react";

export type IconName =
  | "grid" | "database" | "card" | "check-circle" | "file" | "book" | "chart" | "settings"
  | "search" | "plus" | "edit" | "lock" | "unlock" | "trash" | "chevron-down" | "chevron-up"
  | "menu" | "x" | "logout" | "user" | "users" | "wallet" | "trend-up" | "trend-down"
  | "package" | "clock";

const PATHS: Record<IconName, ReactNode> = {
  grid: (<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>),
  database: (<><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>),
  card: (<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>),
  "check-circle": (<><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>),
  file: (<><path d="M6 3h8l4 4v14H6Z" /><path d="M14 3v4h4M9 13h6M9 17h6" /></>),
  book: (<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5ZM4 21.5v-17" />),
  chart: (<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />),
  settings: (<><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></>),
  search: (<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>),
  plus: (<path d="M12 5v14M5 12h14" />),
  edit: (<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />),
  lock: (<><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>),
  unlock: (<><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.5-2" /></>),
  trash: (<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" />),
  "chevron-down": (<path d="m6 9 6 6 6-6" />),
  "chevron-up": (<path d="m18 15-6-6-6 6" />),
  menu: (<path d="M4 7h16M4 12h16M4 17h16" />),
  x: (<path d="M6 6l12 12M18 6 6 18" />),
  logout: (<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>),
  users: (<><circle cx="9" cy="8" r="3.5" /><path d="M2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a7 7 0 0 1 4 6" /></>),
  wallet: (<><path d="M3 7a2 2 0 0 1 2-2h13v4" /><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2Z" /><circle cx="16" cy="14.5" r="1" /></>),
  "trend-up": (<path d="m3 17 6-6 4 4 8-8M15 7h6v6" />),
  "trend-down": (<path d="m3 7 6 6 4-4 8 8M15 17h6v-6" />),
  package: (<><path d="M12 3 3 7.5v9L12 21l9-4.5v-9Z" /><path d="m3 7.5 9 4.5 9-4.5M12 12v9" /></>),
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
};

export function Icon({ name, size = 16, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

export type Tone = "gray" | "blue" | "violet" | "green" | "amber" | "red";

export function Tag({ tone = "gray", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`app-tag tone-${tone}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const tone: Tone =
    status === "Aktif" || status === "Tervalidasi" ? "green"
    : status === "Menunggu" ? "amber"
    : status === "Ditolak" ? "red"
    : "gray";
  return (
    <span className={`app-badge tone-${tone}`}>
      <i />
      {status}
    </span>
  );
}

export function Pagination({
  page, pages, total, pageSize, onPage,
}: { page: number; pages: number; total: number; pageSize: number; onPage: (p: number) => void }) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="app-pager">
      <span>
        Menampilkan <b>{from}–{to}</b> dari <b>{total}</b> entri
      </span>
      <div className="app-pager-btns">
        <button className="app-btn-outline" disabled={page <= 1} onClick={() => onPage(page - 1)}>Sebelumnya</button>
        <span className="app-pager-num">{page} / {pages}</span>
        <button className="app-btn-outline" disabled={page >= pages} onClick={() => onPage(page + 1)}>Berikutnya</button>
      </div>
    </div>
  );
}

export function Modal({
  title, subtitle, onClose, children, footer, size = "md",
}: {
  title: string; subtitle?: string; onClose: () => void; children: ReactNode;
  footer?: ReactNode; size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="app-overlay">
      <div className={`app-modal ${size}`} role="dialog" aria-modal="true">
        <div className="app-modal-head">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="app-icon-btn" onClick={onClose} aria-label="Tutup"><Icon name="x" size={18} /></button>
        </div>
        <div className="app-modal-body">{children}</div>
        {footer && <div className="app-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title, message, error, confirmLabel = "Hapus", onConfirm, onCancel,
}: {
  title: string; message: string; error?: string; confirmLabel?: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Modal
      title={title}
      size="sm"
      onClose={onCancel}
      footer={
        <>
          <button className="app-btn-outline lg" onClick={onCancel}>Batal</button>
          {!error && <button className="app-btn danger" onClick={onConfirm}>{confirmLabel}</button>}
        </>
      }
    >
      <p className="app-confirm-text">{message}</p>
      {error && <p className="app-error-box">{error}</p>}
    </Modal>
  );
}