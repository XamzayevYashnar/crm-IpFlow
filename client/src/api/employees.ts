import { http } from "../lib/http";
import type { Employee, EmployeeCreateValues, EmployeeUpdateValues } from "../types/employee";

export async function listEmployees(): Promise<Employee[]> {
  const res = await http.get<{ admins: Employee[] }>("/admin");
  return res.data.admins;
}

export async function createEmployee(values: EmployeeCreateValues): Promise<Employee> {
  const res = await http.post<{ admin: Employee }>("/admin", values);
  return res.data.admin;
}

export async function updateEmployee(id: number, values: EmployeeUpdateValues): Promise<Employee> {
  const res = await http.patch<{ admin: Employee }>(`/admin/${id}`, values);
  return res.data.admin;
}

export async function blockEmployee(id: number): Promise<void> {
  await http.delete(`/admin/${id}`);
}
