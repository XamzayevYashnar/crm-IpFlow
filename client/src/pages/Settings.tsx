import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { createColor, deleteColor, listColors } from "../api/colors";
import { createSize, deleteSize, listSizes } from "../api/sizes";
import type { CatalogFormValues, Color, Size } from "../types/catalog";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { toast } from "../components/ui/toast-store";
import type { ApiError } from "../lib/http";

export default function Settings() {
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [c, s] = await Promise.all([listColors(), listSizes()]);
      setColors(c);
      setSizes(s);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900">Sozlamalar</h1>
        <p className="mt-1 text-sm text-slate-500">
          Buyurtma partiyalarida ishlatiladigan rang va o'lcham spravochnigi
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-slate-400">Yuklanmoqda...</div>
      ) : error ? (
        <div className="p-8 text-center text-sm text-red-500">{error}</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <CatalogPanel
            title="Ranglar"
            items={colors}
            onCreate={async (values) => {
              await createColor(values);
              load();
            }}
            onDelete={async (id) => {
              await deleteColor(id);
              load();
            }}
          />
          <CatalogPanel
            title="O'lchamlar"
            items={sizes}
            onCreate={async (values) => {
              await createSize(values);
              load();
            }}
            onDelete={async (id) => {
              await deleteSize(id);
              load();
            }}
          />
        </div>
      )}
    </div>
  );
}

function CatalogPanel({
  title,
  items,
  onCreate,
  onDelete,
}: {
  title: string;
  items: Color[] | Size[];
  onCreate: (values: CatalogFormValues) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const { register, handleSubmit, reset, formState } = useForm<CatalogFormValues>();
  const [deleting, setDeleting] = useState<{ id: number; name: string } | null>(null);

  async function onSubmit(values: CatalogFormValues) {
    try {
      await onCreate(values);
      reset({ name: "" });
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await onDelete(deleting.id);
      toast.success("O'chirildi");
      setDeleting(null);
    } catch (e) {
      toast.error((e as ApiError).message);
      setDeleting(null);
    }
  }

  return (
    <div className="rounded-card border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>

      <form className="mb-4 flex gap-2" onSubmit={handleSubmit(onSubmit)}>
        <input
          placeholder="Nomi"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          {...register("name", { required: true })}
        />
        <Button type="submit" disabled={formState.isSubmitting}>
          <Plus size={16} />
        </Button>
      </form>

      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">Hozircha bo'sh</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 py-1 pl-3 pr-1.5 text-sm text-slate-700"
            >
              {item.name}
              <button
                onClick={() => setDeleting({ id: item.id, name: item.name })}
                className="text-slate-400 hover:text-red-600"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {deleting && (
        <ConfirmDialog
          title="O'chirish"
          description={`"${deleting.name}" ni o'chirmoqchimisiz?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
