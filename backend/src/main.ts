import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module.js';

process.on('unhandledRejection', (reason) => {
  console.warn('[Process] Unhandled Rejection diferido:', reason);
});

process.on('uncaughtException', (err) => {
  console.warn('[Process] Uncaught Exception tolerado:', err?.message);
});

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`ErgoCheck AI Backend corriendo en http://localhost:${port}/api`);
}

await bootstrap();
