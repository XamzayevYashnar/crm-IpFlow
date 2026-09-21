export type MaterialUnit = "KG" | "METR";

export interface Material {
  id: number;
  name: string;
  unit: MaterialUnit;
  currentBalance: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialFormValues {
  name: string;
  unit: MaterialUnit;
  currentBalance?: string;
}
