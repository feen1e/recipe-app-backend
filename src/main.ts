import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidUnknownValues: true }),
  );

  const config = new DocumentBuilder()
    .setTitle("Recipe Sharing App")
    .setDescription("API for managing recipe app.")
    .setVersion("0.1")
    .addTag("API")
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
