import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '@/common/guards/roles.guard';
import { EmailGroupController } from './email-group.controller';
import { EmailGroupService } from './email-group.service';
import { EmailGroupRepository } from './email-group.repository';

@Module({
  imports: [PrismaModule],
  controllers: [EmailGroupController],
  providers: [
    EmailGroupService,
    EmailGroupRepository,
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [EmailGroupService],
})
export class EmailGroupModule {}
