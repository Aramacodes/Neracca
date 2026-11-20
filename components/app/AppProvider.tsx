"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getCurrent } from "@/lib/auth";
import { canWrite } from "@/lib/roles";
import type { Company, RoleKey, User } from "@/lib/types";

type Ctx = {
  user: User;
  company: Company;
  role: RoleKey;
  can: (resource: string) => boolean;
  refresh: () => void;
  logout: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function useApp(): Ctx {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp harus dipakai di dalam AppProvider");
  return c;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<{ user: User; company: Company } | null>(null);
  const [checked, setChecked] = useState(false);

  const refresh = useCallback(() => setState(getCurrent()), []);

  useEffect(() => {
    const cur = getCurrent();
    setState(cur);
    setChecked(true);
    if (!cur) router.replace("/");
  }, [router]);

  const logout = useCallback(() => {
    clearSession();
    router.replace("/");
  }, [router]);

  if (!checked || !state) {
    return <div className="app-loading">Memuat…</div>;
  }

  return (
    <AppCtx.Provider
      value={{
        user: state.user,
        company: state.company,
        role: state.user.role,
        can: (resource) => canWrite(state.user.role, resource, state.company.type),
        refresh,
        logout,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}