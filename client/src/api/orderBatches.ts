import { http } from "../lib/http";
import type { BatchStatus, OrderBatch, OrderBatchFormValues } from "../types/order";

export async function listOrderBatches(): Promise<OrderBatch[]> {
  const res = await http.get<OrderBatch[]>("/order-batch");
  return res.data;
}

export async function createOrderBatch(values: OrderBatchFormValues): Promise<OrderBatch> {
  const res = await http.post<OrderBatch>("/order-batch", values);
  return res.data;
}

export async function updateOrderBatchStatus(id: number, status: BatchStatus): Promise<OrderBatch> {
  const res = await http.patch<OrderBatch>(`/order-batch/${id}/status`, { status });
  return res.data;
}

export async function deleteOrderBatch(id: number): Promise<void> {
  await http.delete(`/order-batch/${id}`);
}
