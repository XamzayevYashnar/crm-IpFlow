export type EmployeeStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface Employee {
  id: number;
  email: string;
  fullName: string | null;
  avatar: string | null;
  roleId: number;
  role: { id: number; name: string };
  status: EmployeeStatus;
  hourlyPrice: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeCreateValues {
  email: string;
  password: string;
  fullName?: string;
  roleId: number;
}

export interface EmployeeUpdateValues {
  email?: string;
  password?: string;
  fullName?: string;
  roleId?: number;
  status?: EmployeeStatus;
}
