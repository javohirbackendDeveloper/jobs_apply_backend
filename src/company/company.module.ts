import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyResolver } from './company.resolver';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';

@Module({
  providers: [
    CompanyResolver,
    CompanyService,
    PrismaService,
    ConfigService,
    JwtService,
    EmailService,
  ],
})
export class CompanyModule {}
