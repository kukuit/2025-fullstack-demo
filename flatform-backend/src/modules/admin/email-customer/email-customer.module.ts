import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '@/common/guards/roles.guard';
import { EmailCustomerController } from './email-customer.controller';
import { EmailCustomerService } from './email-customer.service';
import { EmailCustomerRepository } from './email-customer.repository';

@Module({
  imports: [PrismaModule],
  controllers: [EmailCustomerController],
  providers: [
    EmailCustomerService,
    EmailCustomerRepository,
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [EmailCustomerService],
})
export class EmailCustomerModule {}
