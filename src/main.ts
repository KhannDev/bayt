import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  // Configure Swagger options
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description for your application')
    .setVersion('1.0')
    .addTag('API')
    .addBearerAuth()
    .build();

  app.enableCors();

  // Create the Swagger document
  const document = SwaggerModule.createDocument(app, config);

  // Serve Swagger at /api-docs
  SwaggerModule.setup('api-docs', app, document);

  const server = await app.listen(process.env.PORT || 3004);
  server.keepAliveTimeout = 65000;
}
bootstrap();
