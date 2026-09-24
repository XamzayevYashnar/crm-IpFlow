export type WorkerStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";
export type PayType = "HOURLY" | "PIECE_RATE";

export interface Worker {
  id: number;
  fullName: string | null;
  phone: string | null;
  status: WorkerStatus;
  payType: PayType;
  hourlyPrice: string | null;
  createdAt: string;
}

export interface WorkerCreateValues {
  firstName: string;
  lastName: string;
  phone: string;
  payType: PayType;
  hourlyPrice?: number;
}

export interface WorkerUpdateValues {
  firstName?: string;
  lastName?: string;
  phone?: string;
  payType?: PayType;
  hourlyPrice?: number;
  status?: WorkerStatus;
}
