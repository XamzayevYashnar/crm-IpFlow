import type { Customer } from "./customer";

export type BatchStatus = "NEW" | "IN_PRODUCTION" | "AWAITING_ACCEPTANCE" | "ACCEPTED" | "SHIPPED";

export interface OrderBatchSummary {
  id: number;
  orderId: number;
  batchNumber: number;
  color: string;
  size: string;
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
  customerId: number;
  modelId: number;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  productModel: OrderProductModel;
  orderBatches: OrderBatchSummary[];
}

export interface OrderFormValues {
  customerId: number;
  modelId: number;
}

export interface OrderBatch extends OrderBatchSummary {
  order: {
    id: number;
    customerId: number;
    modelId: number;
    customer: Customer;
    productModel: OrderProductModel;
  };
}

export interface OrderBatchFormValues {
  orderId: number;
  color: string;
  size: string;
  totalQuantity: number;
}
