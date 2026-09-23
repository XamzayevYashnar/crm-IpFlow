import { Role, UserStatus } from "../../../generated/prisma/enums";
import { Decimal } from "../../../generated/prisma/internal/prismaNamespace";

export interface IUser {
    id: number,
    fullName: string | null,
    email: string | null,
    password: string | null,
    phone: string | null,
    pinCode: string | null,
    avatar: string | null,
    roleId: number,
    status: UserStatus,
    hourlyPrice: Decimal | null,
    createdAt: Date,
    updatedAt: Date,
}