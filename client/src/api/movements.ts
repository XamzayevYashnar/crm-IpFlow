import { http } from "../lib/http";
import type { InventoryMovement, MovementFormValues } from "../types/movement";
import type { Material } from "../types/material";

export async function listMovements(): Promise<InventoryMovement[]> {
  const res = await http.get<InventoryMovement[]>("/movement");
  return res.data;
}

export async function createMovement(
  values: MovementFormValues,
): Promise<{ material: Material; movement: InventoryMovement }> {
  const res = await http.post<{ material: Material; movement: InventoryMovement }>("/movement", values);
  return res.data;
}

export async function updateMovementReason(id: number, reason: string): Promise<InventoryMovement> {
  const res = await http.patch<{ updatedMovement: InventoryMovement }>(`/movement/${id}`, { reason });
  return res.data.updatedMovement;
}

export async function deleteMovement(id: number): Promise<void> {
  await http.delete(`/movement/${id}`);
}
