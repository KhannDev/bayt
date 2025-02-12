import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === 'http://localhost:3000' ||
        origin === 'http://localhost:3004'
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  };

  console.log('Corss', corsOptions);

  app.enableCors(corsOptions);

  // app.enableCors();

  // Configure Swagger options
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description for your application')
    .setVersion('1.0')
    .addTag('API')
    .addBearerAuth()
    .build();

  // Create the Swagger document
  const document = SwaggerModule.createDocument(app, config);

  // Serve Swagger at /api-docs
  SwaggerModule.setup('api-docs', app, document);

  const server = await app.listen(process.env.PORT || 3004);
  server.keepAliveTimeout = 65000;
}
bootstrap();
