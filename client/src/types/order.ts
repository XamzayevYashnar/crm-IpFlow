import type { Customer } from "./customer";
import type { Color, Size } from "./catalog";

export type BatchStatus = "NEW" | "IN_PRODUCTION" | "AWAITING_ACCEPTANCE" | "ACCEPTED" | "SHIPPED";

export interface OrderBatch {
  id: number;
  orderId: number;
  batchNumber: number;
  colorId: number;
  sizeId: number;
  color: Color;
  size: Size;
  totalQuantity: number;
  status: BatchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderProductModel {
  id: number;
  name: string;
  sku: string;
}

export interface Order {
  id: number;
  customerId: number | null;
  modelId: number;
  createdAt: string;
  updatedAt: string;
  customer: Customer | null;
  productModel: OrderProductModel;
  orderBatches: OrderBatch[];
}

export interface OrderBatchInput {
  colorId: number;
  sizeId: number;
  totalQuantity: number;
}

export interface OrderFormValues {
  modelId: number;
  batches: OrderBatchInput[];
}
