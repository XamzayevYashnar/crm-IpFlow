import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { createProduct, deleteProduct, listProducts, updateProduct } from "../api/products";
import { listOperations } from "../api/operations";
import { listMaterials } from "../api/materials";
import type { ProductFormValues, ProductModel } from "../types/product";
import type { Operation } from "../types/operation";
import type { Material } from "../types/material";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { toast } from "../components/ui/toast-store";
import type { ApiError } from "../lib/http";

export default function Products() {
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ProductModel | "new" | null>(null);
  const [deleting, setDeleting] = useState<ProductModel | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [p, o, m] = await Promise.all([listProducts(), listOperations(), listMaterials()]);
      setProducts(p);
      setOperations(o);
      setMaterials(m);
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
      await deleteProduct(deleting.id);
      toast.success("Model o'chirildi");
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
          <h1 className="text-xl font-semibold text-slate-900">Modellar</h1>
          <p className="mt-1 text-sm text-slate-500">Mahsulot modellari, ularning operatsiyalari va materiallari</p>
        </div>
        <Button onClick={() => setEditing("new")} disabled={loading}>
          <Plus size={16} />
          Qo'shish
        </Button>
      </div>

      <div className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Yuklanmoqda...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">Hozircha model mavjud emas</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nomi</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Operatsiyalar</th>
                <th className="px-4 py-3">Materiallar</th>
                <th className="px-4 py-3 text-right">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.sku}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.modelOperations.length === 0
                      ? "—"
                      : p.modelOperations
                          .slice()
                          .sort((a, b) => a.stepOrder - b.stepOrder)
                          .map((mo) => `${mo.stepOrder}. ${mo.operation.name}`)
                          .join(", ")}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.modelMaterials.length === 0
                      ? "—"
                      : p.modelMaterials.map((mm) => `${mm.material.name} (${mm.quantityNeeded})`).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditing(p)} className="text-slate-400 hover:text-blue-600">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleting(p)} className="text-slate-400 hover:text-red-600">
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
        <ProductFormModal
          product={editing === "new" ? null : editing}
          operations={operations}
          materials={materials}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Modelni o'chirish"
          description={`"${deleting.name}" modelini o'chirmoqchimisiz?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

function ProductFormModal({
  product,
  operations,
  materials,
  onClose,
  onSaved,
}: {
  product: ProductModel | null;
  operations: Operation[];
  materials: Material[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { register, control, handleSubmit, formState } = useForm<ProductFormValues>({
    defaultValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      operations: product?.modelOperations
        .slice()
        .sort((a, b) => a.stepOrder - b.stepOrder)
        .map((mo) => ({ operationId: mo.operationId, stepOrder: mo.stepOrder })) ?? [],
      materials: product?.modelMaterials.map((mm) => ({
        materialId: mm.materialId,
        quantityNeeded: Number(mm.quantityNeeded),
      })) ?? [],
    },
  });

  const opFields = useFieldArray({ control, name: "operations" });
  const matFields = useFieldArray({ control, name: "materials" });

  async function onSubmit(values: ProductFormValues) {
    const payload: ProductFormValues = {
      name: values.name,
      sku: values.sku,
      operations: values.operations?.length
        ? values.operations.map((o) => ({ operationId: Number(o.operationId), stepOrder: Number(o.stepOrder) }))
        : undefined,
      materials: values.materials?.length
        ? values.materials.map((m) => ({ materialId: Number(m.materialId), quantityNeeded: Number(m.quantityNeeded) }))
        : undefined,
    };

    try {
      if (product) {
        await updateProduct(product.id, payload);
        toast.success("Model yangilandi");
      } else {
        await createProduct(payload);
        toast.success("Model qo'shildi");
      }
      onSaved();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  return (
    <Modal title={product ? "Modelni tahrirlash" : "Yangi model"} onClose={onClose}>
      <form className="max-h-[70vh] space-y-4 overflow-y-auto pr-1" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nomi</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register("name", { required: true })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">SKU</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register("sku", { required: true })}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Operatsiyalar (ketma-ketlik bo'yicha)</label>
            <button
              type="button"
              onClick={() => opFields.append({ operationId: operations[0]?.id ?? 0, stepOrder: opFields.fields.length + 1 })}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              + qo'shish
            </button>
          </div>
          <div className="space-y-2">
            {opFields.fields.map((field, idx) => (
              <div key={field.id} className="flex items-center gap-2">
                <select
                  className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  {...register(`operations.${idx}.operationId`, { valueAsNumber: true, required: true })}
                >
                  {operations.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  placeholder="Tartib"
                  className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  {...register(`operations.${idx}.stepOrder`, { valueAsNumber: true, required: true })}
                />
                <button type="button" onClick={() => opFields.remove(idx)} className="text-slate-400 hover:text-red-600">
                  <X size={16} />
                </button>
              </div>
            ))}
            {opFields.fields.length === 0 && <p className="text-xs text-slate-400">Operatsiya qo'shilmagan</p>}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Materiallar</label>
            <button
              type="button"
              onClick={() => matFields.append({ materialId: materials[0]?.id ?? 0, quantityNeeded: 1 })}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              + qo'shish
            </button>
          </div>
          <div className="space-y-2">
            {matFields.fields.map((field, idx) => (
              <div key={field.id} className="flex items-center gap-2">
                <select
                  className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  {...register(`materials.${idx}.materialId`, { valueAsNumber: true, required: true })}
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.unit})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0.01}
                  step="0.01"
                  placeholder="Miqdor"
                  className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  {...register(`materials.${idx}.quantityNeeded`, { valueAsNumber: true, required: true })}
                />
                <button type="button" onClick={() => matFields.remove(idx)} className="text-slate-400 hover:text-red-600">
                  <X size={16} />
                </button>
              </div>
            ))}
            {matFields.fields.length === 0 && <p className="text-xs text-slate-400">Material qo'shilmagan</p>}
          </div>
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
