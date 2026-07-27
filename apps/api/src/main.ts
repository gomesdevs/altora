import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    allowedHeaders: ["Content-Type", "x-tenant-id"],
  });
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
  console.log(`api listening on :${process.env.PORT ?? 3001}`);
}

bootstrap();
