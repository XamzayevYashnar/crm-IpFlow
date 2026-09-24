import { useEffect, useState } from "react";
import { Plus, Trash2, UserPlus, PackagePlus } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { addOrderBatch, assignOrderCustomer, createOrder, deleteOrder, listOrders } from "../api/orders";
import { deleteOrderBatch, updateOrderBatchStatus } from "../api/orderBatches";
import { listCustomers } from "../api/customers";
import { listProducts } from "../api/products";
import { listColors } from "../api/colors";
import { listSizes } from "../api/sizes";
import type { BatchStatus, Order, OrderBatch, OrderBatchInput, OrderFormValues } from "../types/order";
import type { Customer } from "../types/customer";
import type { ProductModel } from "../types/product";
import type { Color, Size } from "../types/catalog";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { toast } from "../components/ui/toast-store";
import type { ApiError } from "../lib/http";

const statusTone: Record<BatchStatus, "green" | "gray" | "blue" | "red"> = {
  NEW: "gray",
  IN_PRODUCTION: "blue",
  AWAITING_ACCEPTANCE: "blue",
  ACCEPTED: "green",
  SHIPPED: "green",
};
const statusLabel: Record<BatchStatus, string> = {
  NEW: "Yangi",
  IN_PRODUCTION: "Ishlab chiqarilmoqda",
  AWAITING_ACCEPTANCE: "Qabulni kutmoqda",
  ACCEPTED: "Qabul qilindi",
  SHIPPED: "Jo'natildi",
};
const statusOptions: BatchStatus[] = ["NEW", "IN_PRODUCTION", "AWAITING_ACCEPTANCE", "ACCEPTED", "SHIPPED"];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [addingBatchTo, setAddingBatchTo] = useState<Order | null>(null);
  const [assigningTo, setAssigningTo] = useState<Order | null>(null);
  const [deletingBatch, setDeletingBatch] = useState<OrderBatch | null>(null);
  const [updatingBatchId, setUpdatingBatchId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [o, c, p, col, sz] = await Promise.all([
        listOrders(),
        listCustomers(),
        listProducts(),
        listColors(),
        listSizes(),
      ]);
      setOrders(o);
      setCustomers(c);
      setProducts(p);
      setColors(col);
      setSizes(sz);
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
      await deleteOrder(deleting.id);
      toast.success("Buyurtma o'chirildi");
      setDeleting(null);
      load();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  async function handleDeleteBatch() {
    if (!deletingBatch) return;
    try {
      await deleteOrderBatch(deletingBatch.id);
      toast.success("Partiya o'chirildi");
      setDeletingBatch(null);
      load();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  async function handleBatchStatusChange(batch: OrderBatch, status: BatchStatus) {
    setUpdatingBatchId(batch.id);
    try {
      await updateOrderBatchStatus(batch.id, status);
      toast.success("Holat yangilandi");
      load();
    } catch (e) {
      toast.error((e as ApiError).message);
    } finally {
      setUpdatingBatchId(null);
    }
  }

  const catalogReady = colors.length > 0 && sizes.length > 0;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Buyurtmalar</h1>
          <p className="mt-1 text-sm text-slate-500">Model, rang/o'lcham partiyalari va ishlab chiqarish holati</p>
        </div>
        <Button onClick={() => setCreating(true)} disabled={loading || products.length === 0 || !catalogReady}>
          <Plus size={16} />
          Qo'shish
        </Button>
      </div>

      {!loading && products.length === 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Buyurtma yaratish uchun avval kamida bitta model kerak.
        </div>
      )}
      {!loading && products.length > 0 && !catalogReady && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Buyurtma yaratish uchun avval Sozlamalar bo'limida rang va o'lcham spravochnigini to'ldiring.
        </div>
      )}

      <div className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Yuklanmoqda...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">Hozircha buyurtma mavjud emas</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Partiyalar (rang / o'lcham / miqdor)</th>
                <th className="px-4 py-3">Mijoz</th>
                <th className="px-4 py-3">Sana</th>
                <th className="px-4 py-3 text-right">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-slate-100 last:border-0 align-top hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {o.productModel.name}
                    <div className="text-xs font-normal text-slate-400">{o.productModel.sku}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1.5">
                      {o.orderBatches.map((b) => (
                        <div key={b.id} className="flex items-center gap-2">
                          <span className="text-slate-700">
                            {b.color.name} / {b.size.name} — {b.totalQuantity} dona
                          </span>
                          <select
                            value={b.status}
                            disabled={updatingBatchId === b.id}
                            onChange={(e) => handleBatchStatusChange(b, e.target.value as BatchStatus)}
                            className="rounded-full border-0 bg-transparent text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>
                                {statusLabel[s]}
                              </option>
                            ))}
                          </select>
                          <Badge tone={statusTone[b.status]}>{statusLabel[b.status]}</Badge>
                          <button onClick={() => setDeletingBatch(b)} className="text-slate-300 hover:text-red-600">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setAddingBatchTo(o)}
                        disabled={!catalogReady}
                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-300"
                      >
                        <PackagePlus size={13} />
                        Partiya qo'shish
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {o.customer ? (
                      o.customer.name
                    ) : (
                      <button
                        onClick={() => setAssigningTo(o)}
                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                      >
                        <UserPlus size={13} />
                        Mijoz biriktirish
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setDeleting(o)} className="text-slate-400 hover:text-red-600">
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

      {creating && (
        <OrderCreateModal
          products={products}
          colors={colors}
          sizes={sizes}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            load();
          }}
        />
      )}

      {addingBatchTo && (
        <AddBatchModal
          order={addingBatchTo}
          colors={colors}
          sizes={sizes}
          onClose={() => setAddingBatchTo(null)}
          onSaved={() => {
            setAddingBatchTo(null);
            load();
          }}
        />
      )}

      {assigningTo && (
        <AssignCustomerModal
          order={assigningTo}
          customers={customers}
          onClose={() => setAssigningTo(null)}
          onSaved={() => {
            setAssigningTo(null);
            load();
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Buyurtmani o'chirish"
          description={`"${deleting.productModel.name}" buyurtmasini barcha partiyalari bilan o'chirmoqchimisiz?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      {deletingBatch && (
        <ConfirmDialog
          title="Partiyani o'chirish"
          description={`#${deletingBatch.batchNumber} partiyasini o'chirmoqchimisiz?`}
          onConfirm={handleDeleteBatch}
          onCancel={() => setDeletingBatch(null)}
        />
      )}
    </div>
  );
}

function OrderCreateModal({
  products,
  colors,
  sizes,
  onClose,
  onSaved,
}: {
  products: ProductModel[];
  colors: Color[];
  sizes: Size[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { register, control, handleSubmit, formState } = useForm<OrderFormValues>({
    defaultValues: {
      modelId: products[0]?.id,
      batches: [{ colorId: colors[0]?.id, sizeId: sizes[0]?.id, totalQuantity: 1 }],
    },
  });
  const batchFields = useFieldArray({ control, name: "batches" });

  async function onSubmit(values: OrderFormValues) {
    try {
      await createOrder({
        modelId: Number(values.modelId),
        batches: values.batches.map((b) => ({
          colorId: Number(b.colorId),
          sizeId: Number(b.sizeId),
          totalQuantity: Number(b.totalQuantity),
        })),
      });
      toast.success("Buyurtma yaratildi");
      onSaved();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  return (
    <Modal title="Yangi buyurtma" onClose={onClose}>
      <form className="max-h-[70vh] space-y-4 overflow-y-auto pr-1" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Model</label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("modelId", { valueAsNumber: true, required: true })}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Rang / O'lcham / Miqdor</label>
            <button
              type="button"
              onClick={() => batchFields.append({ colorId: colors[0]?.id, sizeId: sizes[0]?.id, totalQuantity: 1 })}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              + qo'shish
            </button>
          </div>
          <div className="space-y-2">
            {batchFields.fields.map((field, idx) => (
              <div key={field.id} className="flex items-center gap-2">
                <select
                  className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  {...register(`batches.${idx}.colorId`, { valueAsNumber: true, required: true })}
                >
                  {colors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  {...register(`batches.${idx}.sizeId`, { valueAsNumber: true, required: true })}
                >
                  {sizes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  placeholder="Miqdor"
                  className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  {...register(`batches.${idx}.totalQuantity`, { valueAsNumber: true, required: true })}
                />
                {batchFields.fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => batchFields.remove(idx)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
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

function AddBatchModal({
  order,
  colors,
  sizes,
  onClose,
  onSaved,
}: {
  order: Order;
  colors: Color[];
  sizes: Size[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { register, handleSubmit, formState } = useForm<OrderBatchInput>({
    defaultValues: { colorId: colors[0]?.id, sizeId: sizes[0]?.id, totalQuantity: 1 },
  });

  async function onSubmit(values: OrderBatchInput) {
    try {
      await addOrderBatch(order.id, {
        colorId: Number(values.colorId),
        sizeId: Number(values.sizeId),
        totalQuantity: Number(values.totalQuantity),
      });
      toast.success("Partiya qo'shildi");
      onSaved();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  return (
    <Modal title={`${order.productModel.name} — yangi partiya`} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Rang</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register("colorId", { valueAsNumber: true, required: true })}
            >
              {colors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">O'lcham</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register("sizeId", { valueAsNumber: true, required: true })}
            >
              {sizes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Miqdor</label>
          <input
            type="number"
            min={1}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("totalQuantity", { required: true, valueAsNumber: true })}
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

function AssignCustomerModal({
  order,
  customers,
  onClose,
  onSaved,
}: {
  order: Order;
  customers: Customer[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { register, handleSubmit, formState } = useForm<{ customerId: number }>({
    defaultValues: { customerId: customers[0]?.id },
  });

  async function onSubmit(values: { customerId: number }) {
    try {
      await assignOrderCustomer(order.id, Number(values.customerId));
      toast.success("Mijoz biriktirildi");
      onSaved();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  if (customers.length === 0) {
    return (
      <Modal title="Mijoz biriktirish" onClose={onClose}>
        <p className="text-sm text-slate-600">
          Hozircha mijozlar ro'yxati bo'sh. Avval "Mijozlar" bo'limidan mijoz qo'shing.
        </p>
        <div className="flex justify-end pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Yopish
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={`${order.productModel.name} — mijoz biriktirish`} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mijoz</label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("customerId", { valueAsNumber: true, required: true })}
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
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
