import { http } from "../lib/http";
import type { CatalogFormValues, Size } from "../types/catalog";

export async function listSizes(): Promise<Size[]> {
  const res = await http.get<Size[]>("/sizes");
  return res.data;
}

export async function createSize(values: CatalogFormValues): Promise<Size> {
  const res = await http.post<Size>("/sizes", values);
  return res.data;
}

export async function updateSize(id: number, values: CatalogFormValues): Promise<Size> {
  const res = await http.patch<Size>(`/sizes/${id}`, values);
  return res.data;
}

export async function deleteSize(id: number): Promise<void> {
  await http.delete(`/sizes/${id}`);
}
