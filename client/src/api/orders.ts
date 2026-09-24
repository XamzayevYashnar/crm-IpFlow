import { http } from "../lib/http";
import type { Order, OrderFormValues } from "../types/order";

export async function listOrders(): Promise<Order[]> {
  const res = await http.get<Order[]>("/order");
  return res.data;
}

export async function createOrder(values: OrderFormValues): Promise<Order> {
  const res = await http.post<Order>("/order", values);
  return res.data;
}

export async function deleteOrder(id: number): Promise<void> {
  await http.delete(`/order/${id}`);
}
