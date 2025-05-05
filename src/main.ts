import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(process.env.API_PREFIX);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
     // forbidNonWhitelisted: true,
    })
  );

  app.enableCors({
    origin: true,
    allowedHeaders: 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe, access-control-allow-origin, authorization',
    methods: "GET,PUT,POST,DELETE,UPDATE,OPTIONS",
    credentials: true,
    
  });

  await app.listen(process.env.PORT);
}
bootstrap();
