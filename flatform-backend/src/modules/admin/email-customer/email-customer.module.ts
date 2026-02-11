import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';

import { EmailCustomerController } from './email-customer.controller';
import { EmailCustomerRepository } from './email-customer.repository';
import { EmailCustomerService } from './email-customer.service';

@Module({
  imports: [PrismaModule],
  controllers: [EmailCustomerController],
  providers: [EmailCustomerService, EmailCustomerRepository],
  exports: [EmailCustomerService],
})
export class EmailCustomerModule {}
