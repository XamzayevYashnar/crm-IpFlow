import { http } from "../lib/http";
import type { CatalogFormValues, Color } from "../types/catalog";

export async function listColors(): Promise<Color[]> {
  const res = await http.get<Color[]>("/colors");
  return res.data;
}

export async function createColor(values: CatalogFormValues): Promise<Color> {
  const res = await http.post<Color>("/colors", values);
  return res.data;
}

export async function updateColor(id: number, values: CatalogFormValues): Promise<Color> {
  const res = await http.patch<Color>(`/colors/${id}`, values);
  return res.data;
}

export async function deleteColor(id: number): Promise<void> {
  await http.delete(`/colors/${id}`);
}
