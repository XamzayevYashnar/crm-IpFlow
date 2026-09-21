import { useEffect, useState } from "react";
import { subscribeToasts, type Toast } from "./toast-store";

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => subscribeToasts(setToasts), []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg px-4 py-2.5 text-sm text-white shadow-lg ${
            t.kind === "success" ? "bg-slate-900" : "bg-red-600"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
