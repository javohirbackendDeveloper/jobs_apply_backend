import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  console.log(
    `Starting with ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB heap used`,
  );

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    snapshot: false,
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['log', 'debug', 'error', 'verbose', 'warn'],
  });
  app.use(
    graphqlUploadExpress({
      maxFileSize: 500000,
      maxFiles: 1,
    }),
  );

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `Server running on ${PORT} (${process.env.NODE_ENV || 'development'})`,
    );
    console.log(
      `Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
    );
  });
}

bootstrap();
