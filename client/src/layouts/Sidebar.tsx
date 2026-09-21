import { NavLink } from "react-router-dom";
import { navGroups } from "../lib/nav-config";

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-navy-900 text-slate-300">
      <div className="px-6 py-5 text-base font-semibold text-white">Textile CRM</div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) =>
                item.ready ? (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2 text-sm transition ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-slate-300 hover:bg-navy-800 hover:text-white"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ) : (
                  <div
                    key={item.to}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-600"
                    title="Backend kutilmoqda"
                  >
                    <span>{item.label}</span>
                    <span className="rounded bg-navy-800 px-1.5 py-0.5 text-[10px] text-slate-500">
                      tez orada
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
