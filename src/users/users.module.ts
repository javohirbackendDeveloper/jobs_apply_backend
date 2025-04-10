import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [
    UsersResolver,
    UsersService,
    EmailService,
    JwtService,
    ConfigService,
    PrismaService,
  ],
})
export class UsersModule {}
