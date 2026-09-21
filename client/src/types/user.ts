export type Role = "SUPER_ADMIN" | "ADMIN" | "STAFF";
export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface AuthUser {
  id: number;
  fullName: string | null;
  email: string;
  role: Role;
  status: UserStatus;
  hourlyPrice: string | null;
}
