import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const PORT = process.env.PORT || 3000;

  app.use(graphqlUploadExpress({ maxFileSize: 1000000, maxFiles: 1 }));
  app.enableCors();
  await app.listen(PORT, () => {
    console.log('Server is running on the ' + PORT);
  });
}
bootstrap();
