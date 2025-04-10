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

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}

bootstrap();
