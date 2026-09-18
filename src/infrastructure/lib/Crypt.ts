import * as bcrypt from "bcrypt";

export class Crypt {
    static async hash(data: string){
        return await bcrypt.hash(data, 10);
    }
}