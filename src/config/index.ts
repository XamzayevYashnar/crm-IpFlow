import { config } from "dotenv"

config();

export const conf = {
    PORT: process.env.PORT,
}