import { useEffect, useState } from "react";
import { ExternalLink, Plus, Pencil, Ban, KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { blockWorker, createWorker, listWorkers, resetWorkerPin, updateWorker } from "../api/workers";
import type { Worker, WorkerCreateValues, WorkerStatus, WorkerUpdateValues } from "../types/worker";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { toast } from "../components/ui/toast-store";
import type { ApiError } from "../lib/http";

const statusTone: Record<WorkerStatus, "green" | "gray" | "red"> = {
  ACTIVE: "green",
  INACTIVE: "gray",
  BLOCKED: "red",
};
const statusLabel: Record<WorkerStatus, string> = {
  ACTIVE: "Faol",
  INACTIVE: "Faol emas",
  BLOCKED: "Bloklangan",
};

export default function Workers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Worker | null>(null);
  const [blocking, setBlocking] = useState<Worker | null>(null);
  const [resettingId, setResettingId] = useState<number | null>(null);
  const [pinToShow, setPinToShow] = useState<{ name: string; pin: string } | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setWorkers(await listWorkers());
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = workers.filter(
    (w) =>
      (w.fullName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (w.phone ?? "").includes(search),
  );

  async function handleBlock() {
    if (!blocking) return;
    try {
      await blockWorker(blocking.id);
      toast.success("Ishchi bloklandi");
      setBlocking(null);
      load();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  async function handleResetPin(w: Worker) {
    setResettingId(w.id);
    try {
      const pin = await resetWorkerPin(w.id);
      setPinToShow({ name: w.fullName ?? w.phone ?? "", pin });
    } catch (e) {
      toast.error((e as ApiError).message);
    } finally {
      setResettingId(null);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Ishchilar</h1>
          <p className="mt-1 text-sm text-slate-500">Terminal orqali PIN bilan kiruvchi ishchilar</p>
        </div>
        <div className="flex gap-2">
          <a href="/terminal" target="_blank" rel="noreferrer">
            <Button variant="secondary">
              <ExternalLink size={16} />
              Terminalni ochish
            </Button>
          </a>
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} />
            Qo'shish
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Qidirish..."
          className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Yuklanmoqda...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">Hozircha ma'lumot mavjud emas</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Ism</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">Soatlik stavka</th>
                <th className="px-4 py-3">Holat</th>
                <th className="px-4 py-3 text-right">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr key={w.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{w.fullName ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{w.phone}</td>
                  <td className="px-4 py-3 text-slate-600">{w.hourlyPrice ? `${w.hourlyPrice} so'm` : "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[w.status]}>{statusLabel[w.status]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleResetPin(w)}
                        disabled={resettingId === w.id}
                        title="PIN kodni yangilash"
                        className="text-slate-400 hover:text-blue-600 disabled:opacity-50"
                      >
                        <KeyRound size={16} />
                      </button>
                      <button onClick={() => setEditing(w)} className="text-slate-400 hover:text-blue-600">
                        <Pencil size={16} />
                      </button>
                      {w.status !== "BLOCKED" && (
                        <button onClick={() => setBlocking(w)} className="text-slate-400 hover:text-red-600">
                          <Ban size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {creating && (
        <WorkerCreateModal
          onClose={() => setCreating(false)}
          onCreated={(name, pin) => {
            setCreating(false);
            setPinToShow({ name, pin });
            load();
          }}
        />
      )}

      {editing && (
        <WorkerEditModal
          worker={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {blocking && (
        <ConfirmDialog
          title="Ishchini bloklash"
          description={`"${blocking.fullName ?? blocking.phone}" ishchisini bloklamoqchimisiz? U terminalga kira olmaydi.`}
          confirmLabel="Bloklash"
          onConfirm={handleBlock}
          onCancel={() => setBlocking(null)}
        />
      )}

      {pinToShow && (
        <Modal title="PIN kod" onClose={() => setPinToShow(null)}>
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-900">{pinToShow.name}</span> uchun PIN kod:
          </p>
          <div className="my-4 rounded-lg border-2 border-blue-200 bg-blue-50 py-4 text-center text-3xl font-bold tracking-[0.5em] text-blue-700">
            {pinToShow.pin}
          </div>
          <p className="text-xs text-red-500">
            Bu kod faqat hozir ko'rsatiladi va qayta ko'rsatilmaydi — ishchiga hoziroq yozib bering.
          </p>
          <Button className="mt-4 w-full justify-center" onClick={() => setPinToShow(null)}>
            Tushunarli
          </Button>
        </Modal>
      )}
    </div>
  );
}

function WorkerCreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (name: string, pin: string) => void;
}) {
  const { register, handleSubmit, formState } = useForm<WorkerCreateValues>();

  async function onSubmit(values: WorkerCreateValues) {
    try {
      const res = await createWorker({
        ...values,
        hourlyPrice: values.hourlyPrice ? Number(values.hourlyPrice) : undefined,
      });
      onCreated(res.worker.fullName, res.pin);
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  return (
    <Modal title="Yangi ishchi" onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Ism</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register("firstName", { required: true })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Familiya</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register("lastName", { required: true })}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Telefon</label>
          <input
            placeholder="+998901234567"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("phone", { required: true })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Soatlik stavka (ixtiyoriy)</label>
          <input
            type="number"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("hourlyPrice", { valueAsNumber: true })}
          />
        </div>
        <p className="text-xs text-slate-400">4 xonali PIN kod avtomatik yaratiladi va saqlangandan keyin ko'rsatiladi.</p>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            Saqlash
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function WorkerEditModal({
  worker,
  onClose,
  onSaved,
}: {
  worker: Worker;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { register, handleSubmit, formState } = useForm<WorkerUpdateValues & { fullName?: string }>({
    defaultValues: {
      fullName: worker.fullName ?? "",
      phone: worker.phone ?? "",
      hourlyPrice: worker.hourlyPrice ? Number(worker.hourlyPrice) : undefined,
      status: worker.status,
    },
  });

  async function onSubmit(values: WorkerUpdateValues & { fullName?: string }) {
    try {
      await updateWorker(worker.id, {
        firstName: values.fullName,
        phone: values.phone,
        hourlyPrice: values.hourlyPrice ? Number(values.hourlyPrice) : undefined,
        status: values.status,
      });
      toast.success("Ishchi yangilandi");
      onSaved();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  return (
    <Modal title="Ishchini tahrirlash" onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">To'liq ism</label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("fullName")}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Telefon</label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("phone")}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Soatlik stavka</label>
          <input
            type="number"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("hourlyPrice", { valueAsNumber: true })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Holat</label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("status")}
          >
            <option value="ACTIVE">Faol</option>
            <option value="INACTIVE">Faol emas</option>
            <option value="BLOCKED">Bloklangan</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            Saqlash
          </Button>
        </div>
      </form>
    </Modal>
  );
}
