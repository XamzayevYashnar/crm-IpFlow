import { http } from "../lib/http";
import type { Operation, OperationFormValues } from "../types/operation";

export async function listOperations(): Promise<Operation[]> {
  const res = await http.get<Operation[]>("/operations");
  return res.data;
}

export async function createOperation(values: OperationFormValues): Promise<Operation> {
  const res = await http.post<Operation>("/operations", values);
  return res.data;
}

export async function updateOperation(id: number, values: OperationFormValues): Promise<Operation> {
  const res = await http.patch<Operation>(`/operations/${id}`, values);
  return res.data;
}

export async function deleteOperation(id: number): Promise<void> {
  await http.delete(`/operations/${id}`);
}
