import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {});
  app.use(
    graphqlUploadExpress({
      maxFileSize: 500000,
      maxFiles: 1,
    }),
  );

  app.enableCors();

  const PORT = process.env.PORT || 5000;
  await app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is  running on the ${PORT}`);
  });
}

bootstrap();
