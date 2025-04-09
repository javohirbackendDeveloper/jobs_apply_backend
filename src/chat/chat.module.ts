import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CompanyService } from 'src/company/company.service';
import { ChatGateway } from './chat.provider';
import { CompanyModule } from 'src/company/company.module';

@Module({
  imports: [forwardRef(() => CompanyModule)],
  providers: [ChatGateway, PrismaService],
  exports: [ChatGateway],
})
export class ChatModule {}
