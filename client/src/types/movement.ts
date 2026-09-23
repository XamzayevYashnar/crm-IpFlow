import type { Material } from "./material";

export type MovementType = "IN" | "OUT";

export interface InventoryMovement {
  id: number;
  materialId: number;
  type: MovementType;
  quantity: string;
  reason: string | null;
  createdAt: string;
  material: Material;
}

export interface MovementFormValues {
  materialId: number;
  type: MovementType;
  quantity: number;
  reason?: string;
}
