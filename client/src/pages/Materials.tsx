import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { createMaterial, deleteMaterial, listMaterials, updateMaterial } from "../api/materials";
import type { Material, MaterialFormValues } from "../types/material";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { toast } from "../components/ui/toast-store";
import type { ApiError } from "../lib/http";

const unitLabel: Record<string, string> = { KG: "kg", METR: "metr" };

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Material | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Material | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setMaterials(await listMaterials());
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = materials.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteMaterial(deleting.id);
      toast.success("Material o'chirildi");
      setDeleting(null);
      load();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Materiallar</h1>
          <p className="mt-1 text-sm text-slate-500">Ombordagi materiallar ro'yxati</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus size={16} />
          Qo'shish
        </Button>
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
                <th className="px-4 py-3">Nomi</th>
                <th className="px-4 py-3">Birlik</th>
                <th className="px-4 py-3">Qoldiq</th>
                <th className="px-4 py-3 text-right">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{m.name}</td>
                  <td className="px-4 py-3 text-slate-600">{unitLabel[m.unit] ?? m.unit}</td>
                  <td className="px-4 py-3 text-slate-600">{m.currentBalance}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditing(m)} className="text-slate-400 hover:text-blue-600">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleting(m)} className="text-slate-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(creating || editing) && (
        <MaterialFormModal
          initial={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            load();
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Materialni o'chirish"
          description={`"${deleting.name}" materialini o'chirmoqchimisiz?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

function MaterialFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Material;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { register, handleSubmit, formState } = useForm<MaterialFormValues>({
    defaultValues: initial
      ? { name: initial.name, unit: initial.unit, currentBalance: initial.currentBalance }
      : { unit: "KG" },
  });

  async function onSubmit(values: MaterialFormValues) {
    try {
      if (initial) {
        await updateMaterial(initial.id, values);
        toast.success("Material yangilandi");
      } else {
        await createMaterial(values);
        toast.success("Material qo'shildi");
      }
      onSaved();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  return (
    <Modal title={initial ? "Materialni tahrirlash" : "Yangi material"} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nomi</label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("name", { required: true })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Birlik</label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("unit", { required: true })}
          >
            <option value="KG">kg</option>
            <option value="METR">metr</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Qoldiq</label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("currentBalance")}
          />
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
