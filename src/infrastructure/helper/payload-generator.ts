import { UserStatus } from "../../../generated/prisma/enums";
import { IPayload } from "../../common/interface/interface-payload";

export function generatePayload(sub: number, role: string, status: UserStatus): IPayload {
    return {
        sub,
        role,
        status,
    }
}