export type WorkerStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface Worker {
  id: number;
  fullName: string | null;
  phone: string | null;
  status: WorkerStatus;
  hourlyPrice: string | null;
  createdAt: string;
}

export interface WorkerCreateValues {
  firstName: string;
  lastName: string;
  phone: string;
  hourlyPrice?: number;
}

export interface WorkerUpdateValues {
  firstName?: string;
  lastName?: string;
  phone?: string;
  hourlyPrice?: number;
  status?: WorkerStatus;
}
