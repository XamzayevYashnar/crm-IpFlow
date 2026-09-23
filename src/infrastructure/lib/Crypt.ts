import * as bcrypt from "bcrypt";

export class Crypt {
    static async hash(data: string): Promise<string> {
        return await bcrypt.hash(data, 10);
    }

    static async compare(data: string, hashData: string): Promise<boolean> {
        return await bcrypt.compare(data, hashData);
    }
}
