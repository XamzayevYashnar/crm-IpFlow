import { config } from "dotenv"

config();

export const conf = {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
}