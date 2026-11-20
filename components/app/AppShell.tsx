"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppProvider, useApp } from "./AppProvider";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { canAccessMenu, getMeta, getRoleConfig } from "@/lib/roles";

function Frame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { role, company } = useApp();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const meta = getMeta(pathname, company.type);
  const allowed = !meta || canAccessMenu(role, meta.menu, company.type);

  return (
    <div className="app-shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="app-main">
        <Topbar onMenu={() => setOpen(true)} />
        <div className="app-content">
          {allowed ? (
            children
          ) : (
            <div className="app-empty-page">
              <h3>Akses dibatasi</h3>
              <p>Peran Anda ({getRoleConfig(role, company.type).label}) tidak memiliki akses ke halaman ini.</p>
              <Link href="/dashboard" className="app-btn">Kembali ke Dashboard</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <Frame>{children}</Frame>
    </AppProvider>
  );
}