import { forwardRef, Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyResolver } from './company.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
// import { ChatGateway } from 'src/chat/chat.provider';
// import { ChatModule } from 'src/chat/chat.module';

@Module({
  // imports: [forwardRef(() => ChatModule)],
  providers: [
    CompanyResolver,
    CompanyService,
    PrismaService,
    ConfigService,
    JwtService,
    EmailService,
    // ChatGateway,
  ],
  exports: [CompanyService],
})
export class CompanyModule {}
