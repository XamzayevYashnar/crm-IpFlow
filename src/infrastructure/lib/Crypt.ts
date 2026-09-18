import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

export class Crypt {
    static async hash(data: string): Promise<string> {
        return await bcrypt.hash(data, 10);
    }

    static async compare(data: string, hashData: string): Promise<boolean> {
        const isMatch = await bcrypt.compare(data, hashData);

        if (!isMatch){
            throw new UnauthorizedException("email or password is incorrect!")
        };

        return true;
    }
}