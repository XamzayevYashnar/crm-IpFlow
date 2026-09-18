import { config } from "dotenv"

config();

export const conf = {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    ADMIN: {
        email: String(process.env.ADMIN_EMAIL),
        password: String(process.env.ADMIN_PASSWORD),
    },
}