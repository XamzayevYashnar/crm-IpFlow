import { Role, UserStatus } from "../../../generated/prisma/enums";
import { Decimal } from "../../../generated/prisma/internal/prismaNamespace";

export interface IUser {
    id: number,
    fullName: string | null,
    email: string,
    password: string,
    role: Role,
    status: UserStatus,
    hourlyPrice: Decimal | null,
    createdAt: Date,
    updatedAt: Date,
}