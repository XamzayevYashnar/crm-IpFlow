import { useEffect, useState } from "react";
import { Plus, Pencil, Ban } from "lucide-react";
import { useForm } from "react-hook-form";
import { blockEmployee, createEmployee, listEmployees, updateEmployee } from "../api/employees";
import type { Employee, EmployeeCreateValues, EmployeeUpdateValues, EmployeeStatus } from "../types/employee";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { toast } from "../components/ui/toast-store";
import type { ApiError } from "../lib/http";

const statusTone: Record<EmployeeStatus, "green" | "gray" | "red"> = {
  ACTIVE: "green",
  INACTIVE: "gray",
  BLOCKED: "red",
};

const statusLabel: Record<EmployeeStatus, string> = {
  ACTIVE: "Faol",
  INACTIVE: "Faol emas",
  BLOCKED: "Bloklangan",
};

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [blocking, setBlocking] = useState<Employee | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    setForbidden(false);
    try {
      setEmployees(await listEmployees());
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 403) setForbidden(true);
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = employees.filter(
    (e) =>
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      (e.fullName ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  async function handleBlock() {
    if (!blocking) return;
    try {
      await blockEmployee(blocking.id);
      toast.success("Xodim bloklandi");
      setBlocking(null);
      load();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Xodimlar</h1>
          <p className="mt-1 text-sm text-slate-500">Tizim foydalanuvchilari</p>
        </div>
        {!forbidden && (
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} />
            Qo'shish
          </Button>
        )}
      </div>

      {!forbidden && (
        <div className="mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish..."
            className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      <div className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Yuklanmoqda...</div>
        ) : forbidden ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Sizda ushbu amalni bajarish uchun ruxsat yo'q.
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">Hozircha ma'lumot mavjud emas</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Ism</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Holat</th>
                <th className="px-4 py-3 text-right">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{emp.fullName ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.email}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.role?.name}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[emp.status]}>{statusLabel[emp.status]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditing(emp)} className="text-slate-400 hover:text-blue-600">
                        <Pencil size={16} />
                      </button>
                      {emp.status !== "BLOCKED" && (
                        <button onClick={() => setBlocking(emp)} className="text-slate-400 hover:text-red-600">
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

      {(creating || editing) && (
        <EmployeeFormModal
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

      {blocking && (
        <ConfirmDialog
          title="Xodimni bloklash"
          description={`"${blocking.fullName ?? blocking.email}" xodimini bloklamoqchimisiz? U tizimga kira olmaydi.`}
          confirmLabel="Bloklash"
          onConfirm={handleBlock}
          onCancel={() => setBlocking(null)}
        />
      )}
    </div>
  );
}

function EmployeeFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Employee;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { register, handleSubmit, formState } = useForm<EmployeeCreateValues & EmployeeUpdateValues>({
    defaultValues: initial
      ? { email: initial.email, fullName: initial.fullName ?? "", roleId: initial.roleId, status: initial.status }
      : { roleId: 1 },
  });

  async function onSubmit(values: EmployeeCreateValues & EmployeeUpdateValues) {
    try {
      if (initial) {
        const payload: EmployeeUpdateValues = {
          email: values.email,
          fullName: values.fullName,
          roleId: Number(values.roleId),
          status: values.status,
        };
        if (values.password) payload.password = values.password;
        await updateEmployee(initial.id, payload);
        toast.success("Xodim yangilandi");
      } else {
        await createEmployee({ ...values, roleId: Number(values.roleId) });
        toast.success("Xodim qo'shildi");
      }
      onSaved();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  return (
    <Modal title={initial ? "Xodimni tahrirlash" : "Yangi xodim"} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">To'liq ism</label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("fullName")}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("email", { required: true })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {initial ? "Yangi parol (ixtiyoriy)" : "Parol"}
          </label>
          <input
            type="password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("password", { required: !initial, minLength: 6 })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Role ID</label>
          <input
            type="number"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register("roleId", { required: true, valueAsNumber: true })}
          />
          <p className="mt-1 text-xs text-slate-400">
            Hozircha rollar ro'yxati backendda yo'q — mavjud role ID raqamini kiriting.
          </p>
        </div>
        {initial && (
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
        )}
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
