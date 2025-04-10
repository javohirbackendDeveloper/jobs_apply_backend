import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { CompanyModule } from './company/company.module';
import { ChatModule } from './chat/chat.module';
import GraphQLUpload from 'graphql-upload';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      isGlobal: true,
      cache: true,
      expandVariables: true,
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      buildSchemaOptions: {
        numberScalarMode: 'integer',
        dateScalarMode: 'timestamp',
      },
      uploads: false,
      playground: process.env.NODE_ENV === 'development',
      introspection: process.env.NODE_ENV === 'development',
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || true,
        credentials: true,
      },
      context: ({ req, res }) => ({ req, res }),
      formatError: (error) => ({
        message: error.message,
        code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
        path: error.path,
      }),
    }),

    UsersModule,
    EmailModule,
    CompanyModule,
    ChatModule,
  ],
  providers: [
    {
      provide: 'Upload',
      useValue: GraphQLUpload,
    },
  ],
})
export class AppModule {}
