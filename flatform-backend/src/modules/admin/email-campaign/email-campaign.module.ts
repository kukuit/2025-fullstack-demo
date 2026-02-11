import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';

import { EmailCampaignController } from './email-campaign.controller';
import { EmailCampaignRepository } from './email-campaign.repository';
import { EmailCampaignService } from './email-campaign.service';

@Module({
  imports: [PrismaModule],
  controllers: [EmailCampaignController],
  providers: [EmailCampaignService, EmailCampaignRepository],
  exports: [EmailCampaignService],
})
export class EmailCampaignModule {}
