import type { Operation } from "./operation";
import type { Material } from "./material";

export interface ModelOperation {
  id: number;
  modelId: number;
  operationId: number;
  stepOrder: number;
  pricePerUnit: string | null;
  operation: Operation;
}

export interface ModelMaterial {
  id: number;
  materialId: number;
  productId: number;
  quantityNeeded: string;
  material: Material;
}

export interface ProductModel {
  id: number;
  name: string;
  sku: string;
  createdAt: string;
  updatedAt: string;
  modelOperations: ModelOperation[];
  modelMaterials: ModelMaterial[];
}

export interface ProductOperationInput {
  operationId: number;
  stepOrder: number;
}

export interface ProductMaterialInput {
  materialId: number;
  quantityNeeded: number;
}

export interface ProductFormValues {
  name: string;
  sku: string;
  operations?: ProductOperationInput[];
  materials?: ProductMaterialInput[];
}
