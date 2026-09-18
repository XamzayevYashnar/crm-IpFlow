import { Role, UserStatus } from "../../../generated/prisma/enums";
import { IPayload } from "../../common/interface/interface-payload";

export function generatePayload(sub: number, role: Role, status: UserStatus): IPayload {
    return {
        sub,
        role,
        status,
    }
}