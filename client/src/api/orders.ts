import { http } from "../lib/http";
import type { Order, OrderBatch, OrderBatchInput, OrderFormValues } from "../types/order";

export async function listOrders(): Promise<Order[]> {
  const res = await http.get<Order[]>("/order");
  return res.data;
}

export async function createOrder(values: OrderFormValues): Promise<Order> {
  const res = await http.post<Order>("/order", values);
  return res.data;
}

export async function addOrderBatch(orderId: number, values: OrderBatchInput): Promise<OrderBatch> {
  const res = await http.post<OrderBatch>(`/order/${orderId}/batches`, values);
  return res.data;
}

export async function assignOrderCustomer(orderId: number, customerId: number): Promise<Order> {
  const res = await http.patch<Order>(`/order/${orderId}/customer`, { customerId });
  return res.data;
}

export async function deleteOrder(id: number): Promise<void> {
  await http.delete(`/order/${id}`);
}
