import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { conf } from "./config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { INestApplication } from "@nestjs/common";

export class App {

    static api = "api/v1";

    static async main(){
        const app = await NestFactory.create(AppModule);

        app.setGlobalPrefix(`${this.api}`);

        const document = this.swagger(app);

        SwaggerModule.setup(`${this.api}/docs`, app, document);

        app.listen(conf.PORT ?? 3050, ()=>{
            console.log(`Server: http://localhost:${conf.PORT}/${this.api}/`);
            console.log(`Swagger: http://localhost:${conf.PORT}/${this.api}/docs`);
        });
    }

    static swagger(app: INestApplication){
        const config = new DocumentBuilder()
            .setTitle("IpFlow API Title")
            .setDescription("The API description for IpFlow project")
            .setVersion("1.0")
            .addCookieAuth()
            .addBasicAuth()
            .build();

        return SwaggerModule.createDocument(app, config);
    }
}