import { Module, Global } from "@nestjs/common";
import Redis from "ioredis";
import { conf } from "..";

export const REDIS_CLIENT = "REDIS_CLIENT";

@Global()
@Module({
    providers: [
        {
            provide: REDIS_CLIENT,
            useFactory: () => {
                const client = new Redis({
                    host: String(conf.REDIS.host),
                    port: Number(conf.REDIS.port),
                });

                client.on('error', (err)=>{
                    console.log("Redis error", err)
                });

                return client;
            },
        }
    ],
    exports: [REDIS_CLIENT],
})
export class RedisModule {}