// customers/customers.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CustomersRepository } from './customers.repository';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [CustomersController],
  providers: [
    CustomersService,
    CustomersRepository,
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [CustomersService],
})
export class CustomersModule {}
