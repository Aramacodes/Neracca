"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useApp } from "./AppProvider";
import { Icon } from "./ui";
import { getNav } from "@/lib/roles";

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { role, company, logout } = useApp();
  const [mdOpen, setMdOpen] = useState(pathname.startsWith("/master-data"));

  const items = getNav(role, company.type);

  return (
    <>
      {open && <div className="app-backdrop" onClick={onClose} />}
      <aside className={`app-side ${open ? "open" : ""}`}>
        <div className="app-brand">
          <img src="/logoNeracca.png" alt="Neracca" />
          <small>{company.name}</small>
        </div>

        <div className="app-side-label">MENU UTAMA</div>
        <nav className="app-nav sidebar-scroll">
          {items.map((n) => {
            if (n.children) {
              const active = pathname.startsWith("/master-data");
              return (
                <div key={n.key}>
                  <button
                    className={`app-nav-item ${active ? "active" : ""}`}
                    onClick={() => setMdOpen((v) => !v)}
                  >
                    <Icon name={n.icon} size={16} />
                    <span>{n.label}</span>
                    <Icon name={mdOpen ? "chevron-up" : "chevron-down"} size={14} className="push" />
                  </button>
                  {mdOpen && (
                    <div className="app-sub">
                      {n.children.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          className={`app-sub-item ${pathname === c.href ? "active" : ""}`}
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={n.key}
                href={n.href!}
                className={`app-nav-item ${pathname === n.href ? "active" : ""}`}
              >
                <Icon name={n.icon} size={16} />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="app-side-foot">
          <button className="app-logout" onClick={logout}>
            <Icon name="logout" size={14} /> Keluar
          </button>
        </div>
      </aside>
    </>
  );
}