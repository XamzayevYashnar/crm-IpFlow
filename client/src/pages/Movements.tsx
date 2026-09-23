import { useEffect, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { createMovement, deleteMovement, listMovements } from "../api/movements";
import { listMaterials } from "../api/materials";
import type { InventoryMovement, MovementFormValues, MovementType } from "../types/movement";
import type { Material } from "../types/material";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { toast } from "../components/ui/toast-store";
import type { ApiError } from "../lib/http";

const unitLabel: Record<string, string> = { KG: "kg", METR: "metr" };

export default function Movements() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formType, setFormType] = useState<MovementType | null>(null);
  const [deleting, setDeleting] = useState<InventoryMovement | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [m, mat] = await Promise.all([listMovements(), listMaterials()]);
      setMovements(m);
      setMaterials(mat);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteMovement(deleting.id);
      toast.success("Harakat o'chirildi");
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
          <h1 className="text-xl font-semibold text-slate-900">Kirim / Chiqim</h1>
          <p className="mt-1 text-sm text-slate-500">Ombor harakatlari tarixi</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setFormType("IN")}>
            <ArrowDownCircle size={16} className="text-emerald-600" />
            Kirim
          </Button>
          <Button variant="secondary" onClick={() => setFormType("OUT")}>
            <ArrowUpCircle size={16} className="text-red-600" />
            Chiqim
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Yuklanmoqda...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : movements.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">Hozircha ma'lumot mavjud emas</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Turi</th>
                <th className="px-4 py-3">Miqdor</th>
                <th className="px-4 py-3">Sabab</th>
                <th className="px-4 py-3">Sana</th>
                <th className="px-4 py-3 text-right">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((mv) => (
                <tr key={mv.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{mv.material?.name}</td>
                  <td className="px-4 py-3">
                    <Badge tone={mv.type === "IN" ? "green" : "red"}>
                      {mv.type === "IN" ? "Kirim" : "Chiqim"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {mv.quantity} {unitLabel[mv.material?.unit] ?? ""}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{mv.reason ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(mv.createdAt).toLocaleString("uz-UZ")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button onClick={() => setDeleting(mv)} className="text-slate-400 hover:text-red-600">
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

      {formType && (
        <MovementFormModal
          type={formType}
          materials={materials}
          onClose={() => setFormType(null)}
          onSaved={() => {
            setFormType(null);
            load();
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Harakatni o'chirish"
          description={`"${deleting.material?.name}" bo'yicha ${deleting.type === "IN" ? "kirim" : "chiqim"} yozuvini o'chirmoqchimisiz?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

function MovementFormModal({
  type,
  materials,
  onClose,
  onSaved,
}: {
  type: MovementType;
  materials: Material[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { register, handleSubmit, formState } = useForm<MovementFormValues>({
    defaultValues: { type, materialId: materials[0]?.id },
  });

  async function onSubmit(values: MovementFormValues) {
    try {
      await createMovement({ ...values, type, materialId: Number(values.materialId), quantity: Number(values.quantity) });
      toast.success(type === "IN" ? "Kirim qo'shildi" : "Chiqim qo'shildi");
      onSaved();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  return (
    <Modal title={type === "IN" ? "Kirim qo'shish" : "Chiqim qo'shish"} onClose={onClose}>
      {materials.length === 0 ? (
        <p className="text-sm text-slate-500">Avval Materiallar bo'limida material qo'shing.</p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Material</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register("materialId", { required: true })}
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({unitLabel[m.unit] ?? m.unit}, qoldiq: {m.currentBalance})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Miqdor</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register("quantity", { required: true, valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Sabab</label>
            <input
              type="text"
              placeholder="Masalan: yetkazib beruvchidan qabul qilindi"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register("reason")}
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
      )}
    </Modal>
  );
}
