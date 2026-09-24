import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { createOrderBatch, deleteOrderBatch, listOrderBatches, updateOrderBatchStatus } from "../api/orderBatches";
import { listOrders } from "../api/orders";
import type { BatchStatus, Order, OrderBatch, OrderBatchFormValues } from "../types/order";
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

export default function Batches() {
  const [batches, setBatches] = useState<OrderBatch[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<OrderBatch | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [b, o] = await Promise.all([listOrderBatches(), listOrders()]);
      setBatches(b);
      setOrders(o);
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
      await deleteOrderBatch(deleting.id);
      toast.success("Partiya o'chirildi");
      setDeleting(null);
      load();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  async function handleStatusChange(batch: OrderBatch, status: BatchStatus) {
    setUpdatingId(batch.id);
    try {
      await updateOrderBatchStatus(batch.id, status);
      toast.success("Holat yangilandi");
      load();
    } catch (e) {
      toast.error((e as ApiError).message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Partiyalar</h1>
          <p className="mt-1 text-sm text-slate-500">Buyurtma ichidagi rang/o'lcham bo'yicha ishlab chiqarish partiyalari</p>
        </div>
        <Button onClick={() => setCreating(true)} disabled={loading || orders.length === 0}>
          <Plus size={16} />
          Qo'shish
        </Button>
      </div>

      {!loading && orders.length === 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Partiya yaratish uchun avval kamida bitta buyurtma kerak.
        </div>
      )}

      <div className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Yuklanmoqda...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : batches.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">Hozircha partiya mavjud emas</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Mijoz / Model</th>
                <th className="px-4 py-3">Rang / O'lcham</th>
                <th className="px-4 py-3">Miqdor</th>
                <th className="px-4 py-3">Holat</th>
                <th className="px-4 py-3 text-right">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">#{b.batchNumber}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {b.order.customer.name} — {b.order.productModel.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {b.color} / {b.size}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{b.totalQuantity}</td>
                  <td className="px-4 py-3">
                    <select
                      value={b.status}
                      disabled={updatingId === b.id}
                      onChange={(e) => handleStatusChange(b, e.target.value as BatchStatus)}
                      className="rounded-full border-0 bg-transparent text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel[s]}
                        </option>
                      ))}
                    </select>
                    <div className="mt-1">
                      <Badge tone={statusTone[b.status]}>{statusLabel[b.status]}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setDeleting(b)} className="text-slate-400 hover:text-red-600">
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
        <BatchCreateModal
          orders={orders}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            load();
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Partiyani o'chirish"
          description={`#${deleting.batchNumber} partiyasini o'chirmoqchimisiz?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

function BatchCreateModal({
  orders,
  onClose,
  onSaved,
}: {
  orders: Order[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { register, handleSubmit, formState } = useForm<OrderBatchFormValues>({
    defaultValues: { orderId: orders[0]?.id },
  });

  async function onSubmit(values: OrderBatchFormValues) {
    try {
      await createOrderBatch({
        orderId: Number(values.orderId),
        color: values.color,
        size: values.size,
        totalQuantity: Number(values.totalQuantity),
      });
      toast.success("Partiya yaratildi");
      onSaved();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  return (
    <Modal title="Yangi partiya" onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Buyurtma</label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("orderId", { valueAsNumber: true, required: true })}
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.customer.name} — {o.productModel.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Rang</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register("color", { required: true })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">O'lcham</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register("size", { required: true })}
            />
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
