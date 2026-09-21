import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  STAFF: "Xodim",
};

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-right text-sm">
          <div className="font-medium text-slate-900">{user?.fullName ?? user?.email}</div>
          <div className="text-xs text-slate-500">{user ? roleLabel[user.role] : ""}</div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <LogOut size={14} />
          Chiqish
        </button>
      </div>
    </header>
  );
}
