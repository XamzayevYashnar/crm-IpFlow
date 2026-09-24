import { http } from "../lib/http";
import type { Customer, CustomerFormValues } from "../types/customer";

export async function listCustomers(): Promise<Customer[]> {
  const res = await http.get<Customer[]>("/customer");
  return res.data;
}

export async function createCustomer(values: CustomerFormValues): Promise<Customer> {
  const res = await http.post<Customer>("/customer", values);
  return res.data;
}

export async function updateCustomer(id: number, values: CustomerFormValues): Promise<Customer> {
  const res = await http.patch<Customer>(`/customer/${id}`, values);
  return res.data;
}

export async function deleteCustomer(id: number): Promise<void> {
  await http.delete(`/customer/${id}`);
}
