export interface TerminalUser {
  id: number;
  fullName: string | null;
}

export interface AvailableWork {
  orderBatchId: number;
  batchNumber: number;
  modelOperationId: number;
  operationName: string;
  modelName: string;
  color: string;
  size: string;
  available: number;
}

export type AssignmentStatus = "IN_PROGRESS" | "COMPLETED" | "RETURNED";

export interface WorkAssignment {
  id: number;
  userId: number;
  orderBatchId: number;
  modelOperationId: number;
  quantityAssigned: number;
  status: AssignmentStatus;
  startedAt: string;
  completedAt: string | null;
  orderBatch: { id: number; batchNumber: number; color: string; size: string };
  modelOperation: { id: number; operation: { name: string } };
}

export interface Payment {
  id: number;
  userId: number;
  amount: string;
  note: string | null;
  paidAt: string;
}

export interface Earnings {
  payType: "HOURLY" | "PIECE_RATE";
  hourly: { totalHours: string; hourlyRate: string; hourlyEarnings: string } | null;
  piecework: { completedCount: number; pieceworkEarnings: string } | null;
  totalEarned: string;
  totalPaid: string;
  balance: string;
}
