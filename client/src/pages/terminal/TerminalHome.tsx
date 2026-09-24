import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { LogOut } from "lucide-react";
import {
  completeWork,
  listAvailableWork,
  listMyWork,
  myEarnings,
  myPayments,
  returnWork,
  takeWork,
  terminalLogout,
} from "../../api/terminal";
import { useTerminalAuth } from "../../context/TerminalAuthContext";
import type { AvailableWork, Earnings, Payment, WorkAssignment } from "../../types/terminal";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { toast } from "../../components/ui/toast-store";
import type { ApiError } from "../../lib/http";

type Tab = "available" | "my" | "salary";

const statusLabel: Record<string, string> = {
  IN_PROGRESS: "Jarayonda",
  COMPLETED: "Tugatilgan",
  RETURNED: "Qaytarilgan",
};
const statusTone: Record<string, "blue" | "green" | "gray"> = {
  IN_PROGRESS: "blue",
  COMPLETED: "green",
  RETURNED: "gray",
};

export default function TerminalHome() {
  const { worker, logout } = useTerminalAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("available");

  async function handleLogout() {
    try {
      await terminalLogout();
    } catch {
      // cookie tozalash muvaffaqiyatsiz bo'lsa ham lokal sessiyani tugatamiz
    }
    logout();
    navigate("/terminal", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <div className="text-base font-semibold text-slate-900">{worker?.fullName}</div>
          <div className="text-xs text-slate-500">Terminal</div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <LogOut size={16} />
          Chiqish
        </button>
      </header>

      <div className="flex gap-2 border-b border-slate-200 bg-white px-6">
        {[
          { key: "available" as Tab, label: "Mavjud ishlar" },
          { key: "my" as Tab, label: "Mening ishlarim" },
          { key: "salary" as Tab, label: "Maosh" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-4 py-3 text-sm font-medium ${
              tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="p-6">
        {tab === "available" && <AvailableTab />}
        {tab === "my" && <MyWorkTab />}
        {tab === "salary" && <SalaryTab />}
      </main>
    </div>
  );
}

function AvailableTab() {
  const [items, setItems] = useState<AvailableWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taking, setTaking] = useState<AvailableWork | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await listAvailableWork());
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="text-center text-sm text-slate-400">Yuklanmoqda...</div>;
  if (error) return <div className="text-center text-sm text-red-500">{error}</div>;
  if (items.length === 0)
    return <div className="text-center text-sm text-slate-400">Hozircha mavjud ish yo'q</div>;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={`${item.orderBatchId}-${item.modelOperationId}`}
            className="rounded-card border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="text-xs text-slate-500">Partiya #{item.batchNumber}</div>
            <div className="mt-1 text-base font-semibold text-slate-900">{item.modelName}</div>
            <div className="mt-1 text-sm text-slate-600">{item.operationName}</div>
            <div className="mt-1 text-xs text-slate-500">
              {item.color} / {item.size}
            </div>
            <div className="mt-3 text-sm font-medium text-blue-600">Mavjud: {item.available} dona</div>
            <Button className="mt-3 w-full justify-center" onClick={() => setTaking(item)}>
              Ishni olish
            </Button>
          </div>
        ))}
      </div>

      {taking && <TakeWorkModal item={taking} onClose={() => setTaking(null)} onTaken={() => { setTaking(null); load(); }} />}
    </>
  );
}

function TakeWorkModal({ item, onClose, onTaken }: { item: AvailableWork; onClose: () => void; onTaken: () => void }) {
  const { register, handleSubmit, formState } = useForm<{ quantity: number }>({
    defaultValues: { quantity: item.available },
  });

  async function onSubmit(values: { quantity: number }) {
    try {
      await takeWork(item.orderBatchId, item.modelOperationId, Number(values.quantity));
      toast.success("Ish olindi");
      onTaken();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  return (
    <Modal title="Qancha dona olasiz?" onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <div className="mb-2 text-sm text-slate-600">
            {item.modelName} — {item.operationName} ({item.color}/{item.size})
          </div>
          <input
            type="number"
            min={1}
            max={item.available}
            className="w-full rounded-lg border border-slate-300 px-3 py-3 text-center text-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("quantity", { required: true, valueAsNumber: true, min: 1, max: item.available })}
          />
          <p className="mt-1 text-xs text-slate-400">Maksimum: {item.available} dona</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            Olish
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function MyWorkTab() {
  const [items, setItems] = useState<WorkAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await listMyWork());
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleComplete(id: number) {
    try {
      await completeWork(id);
      toast.success("Ish tugatildi");
      load();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  async function handleReturn(id: number) {
    try {
      await returnWork(id);
      toast.success("Ish qaytarildi");
      load();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  if (loading) return <div className="text-center text-sm text-slate-400">Yuklanmoqda...</div>;
  if (error) return <div className="text-center text-sm text-red-500">{error}</div>;
  if (items.length === 0)
    return <div className="text-center text-sm text-slate-400">Hozircha ish olinmagan</div>;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((wa) => (
        <div key={wa.id} className="rounded-card border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">Partiya #{wa.orderBatch.batchNumber}</div>
            <Badge tone={statusTone[wa.status]}>{statusLabel[wa.status]}</Badge>
          </div>
          <div className="mt-1 text-sm font-medium text-slate-900">{wa.modelOperation.operation.name}</div>
          <div className="mt-1 text-xs text-slate-500">
            {wa.orderBatch.color} / {wa.orderBatch.size} — {wa.quantityAssigned} dona
          </div>
          {wa.status === "IN_PROGRESS" && (
            <div className="mt-3 flex gap-2">
              <Button className="flex-1 justify-center" onClick={() => handleComplete(wa.id)}>
                Tugatish
              </Button>
              <Button variant="secondary" className="flex-1 justify-center" onClick={() => handleReturn(wa.id)}>
                Qaytarish
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SalaryTab() {
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [e, p] = await Promise.all([myEarnings(), myPayments()]);
        setEarnings(e);
        setPayments(p);
      } catch (e) {
        setError((e as ApiError).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-center text-sm text-slate-400">Yuklanmoqda...</div>;
  if (error) return <div className="text-center text-sm text-red-500">{error}</div>;
  if (!earnings) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Jami ishlangan" value={`${earnings.totalEarned} so'm`} highlight />
        <StatCard label="To'langan" value={`${earnings.totalPaid} so'm`} />
        <StatCard label="Qoldiq" value={`${earnings.balance} so'm`} />
        {earnings.piecework && (
          <StatCard label="Bajarilgan operatsiyalar" value={String(earnings.piecework.completedCount)} />
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {earnings.hourly && (
          <div className="rounded-card border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-medium text-slate-900">Soatlik</div>
            <div className="mt-1 text-xs text-slate-500">
              {earnings.hourly.totalHours} soat × {earnings.hourly.hourlyRate} so'm
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-900">{earnings.hourly.hourlyEarnings} so'm</div>
          </div>
        )}
        {earnings.piecework && (
          <div className="rounded-card border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-medium text-slate-900">Sdelka (operatsiya bo'yicha)</div>
            <div className="mt-1 text-xs text-slate-500">{earnings.piecework.completedCount} ta bajarilgan</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">{earnings.piecework.pieceworkEarnings} so'm</div>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-slate-900">To'lovlar tarixi</h2>
        <div className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-sm">
          {payments.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">Hozircha to'lov mavjud emas</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Summa</th>
                  <th className="px-4 py-3">Izoh</th>
                  <th className="px-4 py-3">Sana</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{p.amount} so'm</td>
                    <td className="px-4 py-3 text-slate-600">{p.note ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(p.paidAt).toLocaleString("uz-UZ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-card border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${highlight ? "text-blue-600" : "text-slate-900"}`}>{value}</div>
    </div>
  );
}
