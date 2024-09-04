import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GLOBAL_PREFIX, SWAGGERCONFIG } from './utils/constants';
import { INestApplication, ValidationPipe } from '@nestjs/common';

async function setupSwagger(app: INestApplication) {
  const { title, description, version, route } = SWAGGERCONFIG;
  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(route, app, document);
}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors(); // TODO: Settings

  await setupSwagger(app);
  await app.listen(process.env.PORT || 9901, '0.0.0.0');
}

bootstrap();
