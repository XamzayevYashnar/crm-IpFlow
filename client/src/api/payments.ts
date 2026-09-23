import { http } from "../lib/http";
import type { Earnings, Payment } from "../types/terminal";

export function workerEarnings(userId: number) {
  return http.get<Earnings>(`/payments/worker/${userId}/earnings`).then((r) => r.data);
}

export function workerPayments(userId: number) {
  return http.get<{ payments: Payment[] }>(`/payments/worker/${userId}`).then((r) => r.data.payments);
}

export function createPayment(userId: number, amount: number, note?: string) {
  return http.post<{ payment: Payment }>("/payments", { userId, amount, note }).then((r) => r.data.payment);
}
