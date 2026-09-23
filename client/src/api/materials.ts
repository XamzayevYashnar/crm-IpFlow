import { http } from "../lib/http";
import type { Material, MaterialFormValues } from "../types/material";

export async function listMaterials(): Promise<Material[]> {
  const res = await http.get<Material[]>("/material");
  return res.data;
}

export async function getMaterial(id: number): Promise<Material> {
  const res = await http.get<{ material: Material }>(`/material/${id}`);
  return res.data.material;
}

export async function createMaterial(values: MaterialFormValues): Promise<Material> {
  const res = await http.post<{ newMaterial: Material }>("/material", values);
  return res.data.newMaterial;
}

export async function updateMaterial(id: number, values: Partial<MaterialFormValues>): Promise<Material> {
  const res = await http.patch<{ updatedMaterial: Material }>(`/material/${id}`, values);
  return res.data.updatedMaterial;
}

export async function deleteMaterial(id: number): Promise<void> {
  await http.delete(`/material/${id}`);
}
