import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { TerminalUser } from "../types/terminal";

const STORAGE_KEY = "textile-crm.terminal-worker";

interface TerminalAuthContextValue {
  worker: TerminalUser | null;
  login: (worker: TerminalUser) => void;
  logout: () => void;
}

const TerminalAuthContext = createContext<TerminalAuthContextValue | null>(null);

export function TerminalAuthProvider({ children }: { children: ReactNode }) {
  const [worker, setWorker] = useState<TerminalUser | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as TerminalUser) : null;
    } catch {
      return null;
    }
  });

  function login(nextWorker: TerminalUser) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextWorker));
    setWorker(nextWorker);
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setWorker(null);
  }

  const value = useMemo(() => ({ worker, login, logout }), [worker]);

  return <TerminalAuthContext.Provider value={value}>{children}</TerminalAuthContext.Provider>;
}

export function useTerminalAuth() {
  const ctx = useContext(TerminalAuthContext);
  if (!ctx) throw new Error("useTerminalAuth must be used within TerminalAuthProvider");
  return ctx;
}
