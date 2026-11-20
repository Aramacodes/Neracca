"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "./AppProvider";
import { Icon } from "./ui";
import { getMeta } from "@/lib/roles";
import { initials } from "@/lib/format";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const { user, company } = useApp();
  const meta = getMeta(pathname, company.type);

  return (
    <header className="app-topbar">
      <button className="app-burger" onClick={onMenu} aria-label="Buka menu">
        <Icon name="menu" size={22} />
      </button>
      <div className="app-titles">
        <h1>{meta?.title ?? "Neracca"}</h1>
        {meta && <p>{meta.subtitle}</p>}
      </div>
      <Link href="/akun" className="app-user" title="Informasi akun">
        <span className="app-avatar">{initials(user.name)}</span>
        <span className="app-user-text">
          <strong>{user.name}</strong>
          <small>{company.name}</small>
        </span>
      </Link>
    </header>
  );
}