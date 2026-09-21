import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { conf } from "./core/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";

export class App {

    static api = "api/v1";

    static async main(){
        const app = await NestFactory.create(AppModule);

        app.use(cookieParser());

        app.enableCors({
            origin: ["http://localhost:5173", "http://localhost:5174"],
            credentials: true,
        });

        app.setGlobalPrefix(`${this.api}`);
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));

        const document = this.swagger(app);
        SwaggerModule.setup(`${this.api}/docs`, app, document);

        const port = conf.PORT ?? 3050;
        await app.listen(port, () => {
            console.log(`Server: http://localhost:${port}/${this.api}/`);
            console.log(`Swagger: http://localhost:${port}/${this.api}/docs`);
        });
    }

    static swagger(app: INestApplication){
        const config = new DocumentBuilder()
            .setTitle("IpFlow API Title")
            .setDescription("The API description for IpFlow project")
            .setVersion("1.0")
            .addCookieAuth('accessToken')
            .addBasicAuth()
            .build();

        return SwaggerModule.createDocument(app, config);
    }
}
