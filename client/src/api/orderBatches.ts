import { http } from "../lib/http";
import type { BatchStatus, OrderBatch } from "../types/order";

export async function updateOrderBatchStatus(id: number, status: BatchStatus): Promise<OrderBatch> {
  const res = await http.patch<OrderBatch>(`/order-batch/${id}/status`, { status });
  return res.data;
}

export async function deleteOrderBatch(id: number): Promise<void> {
  await http.delete(`/order-batch/${id}`);
}
