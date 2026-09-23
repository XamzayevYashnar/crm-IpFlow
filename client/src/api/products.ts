import { http } from "../lib/http";
import type { ProductModel, ProductFormValues } from "../types/product";

export async function listProducts(): Promise<ProductModel[]> {
  const res = await http.get<ProductModel[]>("/product");
  return res.data;
}

export async function createProduct(values: ProductFormValues): Promise<ProductModel> {
  const res = await http.post<ProductModel>("/product", values);
  return res.data;
}

export async function updateProduct(id: number, values: ProductFormValues): Promise<ProductModel> {
  const res = await http.patch<ProductModel>(`/product/${id}`, values);
  return res.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await http.delete(`/product/${id}`);
}
