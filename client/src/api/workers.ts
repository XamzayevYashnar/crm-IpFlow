import { http } from "../lib/http";
import type { Worker, WorkerCreateValues, WorkerUpdateValues } from "../types/worker";

export async function listWorkers(): Promise<Worker[]> {
  const res = await http.get<{ workers: Worker[] }>("/worker");
  return res.data.workers;
}

export async function createWorker(
  values: WorkerCreateValues,
): Promise<{ worker: { id: number; fullName: string; phone: string }; pin: string }> {
  const res = await http.post<{ worker: { id: number; fullName: string; phone: string }; pin: string }>(
    "/worker",
    values,
  );
  return res.data;
}

export async function updateWorker(id: number, values: WorkerUpdateValues): Promise<Worker> {
  const res = await http.patch<{ worker: Worker }>(`/worker/${id}`, values);
  return res.data.worker;
}

export async function blockWorker(id: number): Promise<void> {
  await http.delete(`/worker/${id}`);
}

export async function resetWorkerPin(id: number): Promise<string> {
  const res = await http.post<{ pin: string }>(`/worker/${id}/reset-pin`);
  return res.data.pin;
}
