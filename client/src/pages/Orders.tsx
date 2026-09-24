import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { createOrder, deleteOrder, listOrders } from "../api/orders";
import { listCustomers } from "../api/customers";
import { listProducts } from "../api/products";
import type { Order, OrderFormValues } from "../types/order";
import type { Customer } from "../types/customer";
import type { ProductModel } from "../types/product";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { toast } from "../components/ui/toast-store";
import type { ApiError } from "../lib/http";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Order | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [o, c, p] = await Promise.all([listOrders(), listCustomers(), listProducts()]);
      setOrders(o);
      setCustomers(c);
      setProducts(p);
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

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Buyurtmalar</h1>
          <p className="mt-1 text-sm text-slate-500">Mijoz va mahsulot modeli bo'yicha buyurtmalar</p>
        </div>
        <Button onClick={() => setCreating(true)} disabled={loading || customers.length === 0 || products.length === 0}>
          <Plus size={16} />
          Qo'shish
        </Button>
      </div>

      {!loading && (customers.length === 0 || products.length === 0) && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Buyurtma yaratish uchun avval kamida bitta mijoz va bitta model kerak.
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
                <th className="px-4 py-3">Mijoz</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Partiyalar</th>
                <th className="px-4 py-3">Sana</th>
                <th className="px-4 py-3 text-right">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{o.customer.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {o.productModel.name} ({o.productModel.sku})
                  </td>
                  <td className="px-4 py-3 text-slate-600">{o.orderBatches.length}</td>
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
          customers={customers}
          products={products}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            load();
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Buyurtmani o'chirish"
          description={`"${deleting.customer.name}" buyurtmasini o'chirmoqchimisiz?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

function OrderCreateModal({
  customers,
  products,
  onClose,
  onSaved,
}: {
  customers: Customer[];
  products: ProductModel[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { register, handleSubmit, formState } = useForm<OrderFormValues>({
    defaultValues: { customerId: customers[0]?.id, modelId: products[0]?.id },
  });

  async function onSubmit(values: OrderFormValues) {
    try {
      await createOrder({ customerId: Number(values.customerId), modelId: Number(values.modelId) });
      toast.success("Buyurtma yaratildi");
      onSaved();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  return (
    <Modal title="Yangi buyurtma" onClose={onClose}>
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
