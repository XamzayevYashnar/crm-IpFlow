import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Delete } from "lucide-react";
import { pinLogin } from "../../api/terminal";
import { useTerminalAuth } from "../../context/TerminalAuthContext";
import type { ApiError } from "../../lib/http";

export default function TerminalLogin() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useTerminalAuth();
  const navigate = useNavigate();

  function pressDigit(d: string) {
    if (pin.length >= 4) return;
    setError(null);
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      submit(next);
    }
  }

  function backspace() {
    setPin(pin.slice(0, -1));
  }

  async function submit(value: string) {
    setLoading(true);
    setError(null);
    try {
      const worker = await pinLogin(value);
      login(worker);
      navigate("/terminal/home", { replace: true });
    } catch (e) {
      setError((e as ApiError).message);
      setPin("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-card border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-center text-2xl font-semibold text-slate-900">Terminal</h1>
        <p className="mb-6 text-center text-sm text-slate-500">4 xonali PIN kodni kiriting</p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mb-6 flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-slate-300 text-xl font-semibold text-slate-900"
            >
              {pin[i] ? "•" : ""}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              onClick={() => pressDigit(d)}
              disabled={loading}
              className="rounded-lg border border-slate-200 bg-slate-50 py-4 text-xl font-medium text-slate-900 active:bg-slate-200 disabled:opacity-50"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => setPin("")}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-slate-50 py-4 text-sm font-medium text-slate-500 active:bg-slate-200 disabled:opacity-50"
          >
            Tozalash
          </button>
          <button
            onClick={() => pressDigit("0")}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-slate-50 py-4 text-xl font-medium text-slate-900 active:bg-slate-200 disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={backspace}
            disabled={loading}
            className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 py-4 text-slate-500 active:bg-slate-200 disabled:opacity-50"
          >
            <Delete size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
