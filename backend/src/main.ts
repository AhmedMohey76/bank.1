import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 1. Enable Validation Globally (This activates class-validator in DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away extra properties that aren't in the DTO
      forbidNonWhitelisted: true, // Throws error if extra properties exist
    }),
  );

  await app.listen(3000);
}
bootstrap();
