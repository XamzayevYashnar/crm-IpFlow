import { http } from "../lib/http";
import type { TerminalUser, AvailableWork, WorkAssignment, Payment, Earnings } from "../types/terminal";

export function pinLogin(pinCode: string) {
  return http.post<{ user: TerminalUser }>("/terminal/login", { pinCode }).then((r) => r.data.user);
}

export function terminalLogout() {
  return http.post("/terminal/logout").then(() => undefined);
}

export function listAvailableWork() {
  return http.get<{ items: AvailableWork[] }>("/work-assignments/available").then((r) => r.data.items);
}

export function takeWork(orderBatchId: number, modelOperationId: number, quantity: number) {
  return http
    .post<{ assignment: WorkAssignment }>("/work-assignments/take", { orderBatchId, modelOperationId, quantity })
    .then((r) => r.data.assignment);
}

export function listMyWork() {
  return http.get<{ assignments: WorkAssignment[] }>("/work-assignments/my").then((r) => r.data.assignments);
}

export function completeWork(id: number) {
  return http.patch<{ assignment: WorkAssignment }>(`/work-assignments/${id}/complete`).then((r) => r.data.assignment);
}

export function returnWork(id: number) {
  return http.patch<{ assignment: WorkAssignment }>(`/work-assignments/${id}/return`).then((r) => r.data.assignment);
}

export function myPayments() {
  return http.get<{ payments: Payment[] }>("/payments/me").then((r) => r.data.payments);
}

export function myEarnings() {
  return http.get<Earnings>("/payments/me/earnings").then((r) => r.data);
}
