import { Prisma } from "@prisma-generated/client";

export interface MaterialData {
  id: number;
  name: string;
  currentBalance: string | number | Prisma.Decimal; 
}