import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { createOperation, deleteOperation, listOperations, updateOperation } from "../api/operations";
import type { Operation, OperationFormValues } from "../types/operation";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { toast } from "../components/ui/toast-store";
import type { ApiError } from "../lib/http";

export default function Operations() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Operation | "new" | null>(null);
  const [deleting, setDeleting] = useState<Operation | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setOperations(await listOperations());
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
      await deleteOperation(deleting.id);
      toast.success("Operatsiya o'chirildi");
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
          <h1 className="text-xl font-semibold text-slate-900">Operatsiyalar</h1>
          <p className="mt-1 text-sm text-slate-500">Modellarda ishlatiladigan ishlab chiqarish bosqichlari</p>
        </div>
        <Button onClick={() => setEditing("new")}>
          <Plus size={16} />
          Qo'shish
        </Button>
      </div>

      <div className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Yuklanmoqda...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : operations.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">Hozircha operatsiya mavjud emas</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nomi</th>
                <th className="px-4 py-3">Tavsif</th>
                <th className="px-4 py-3 text-right">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((op) => (
                <tr key={op.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{op.name}</td>
                  <td className="px-4 py-3 text-slate-600">{op.description ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditing(op)} className="text-slate-400 hover:text-blue-600">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleting(op)} className="text-slate-400 hover:text-red-600">
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

      {editing && (
        <OperationFormModal
          operation={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Operatsiyani o'chirish"
          description={`"${deleting.name}" operatsiyasini o'chirmoqchimisiz?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

function OperationFormModal({
  operation,
  onClose,
  onSaved,
}: {
  operation: Operation | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { register, handleSubmit, formState } = useForm<OperationFormValues>({
    defaultValues: { name: operation?.name ?? "", description: operation?.description ?? "" },
  });

  async function onSubmit(values: OperationFormValues) {
    try {
      if (operation) {
        await updateOperation(operation.id, values);
        toast.success("Operatsiya yangilandi");
      } else {
        await createOperation(values);
        toast.success("Operatsiya qo'shildi");
      }
      onSaved();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  return (
    <Modal title={operation ? "Operatsiyani tahrirlash" : "Yangi operatsiya"} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nomi</label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("name", { required: true })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Tavsif (ixtiyoriy)</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("description")}
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
