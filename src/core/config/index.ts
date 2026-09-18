import { config } from "dotenv"

config();

export const conf = {
    PORT: Number(process.env.PORT) || 3000,
    DATABASE_URL: process.env.DATABASE_URL ? String(process.env.DATABASE_URL) : null,

    ADMIN: {
        email: process.env.ADMIN_EMAIL ? String(process.env.ADMIN_EMAIL) : null,
        password: process.env.ADMIN_PASSWORD ? String(process.env.ADMIN_PASSWORD) : null,
    },

    REDIS: {
        host: process.env.REDIS_HOST ? String(process.env.REDIS_HOST) || "localhost" : null,
        port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) || 6379 : null,
    },

    TRANSPORT: {
        host: process.env.MAIL_HOST,
        PORT: process.env.MAIL_PORT,
        AUTH: {
            user: process.env.MAIL_EMAIL,
            password: process.env.MAIL_PASSWORD,
        },
    },

    TOKEN: {
        ACCESS_KEY: String(process.env.ACCESS_TOKEN_KEY),
        ACCESS_TIME: String(process.env.ACCESS_TOKEN_TIME),
        REFRESH_KEY: String(process.env.REFRESH_TOKEN_KEY),
        REFRESH_TIME: String(process.env.REFRESH_TOKEN_TIME),
    },
}