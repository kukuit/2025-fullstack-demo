import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import {
  CreateEmailCampaignDto,
  EmailCampaignEntity,
  PaginatedResponse,
  ReplaceEmailCampaignEmailsDto,
  ReplaceEmailCampaignGroupsDto,
  SearchEmailCampaignsDto,
  SetEmailCampaignStatusDto,
  UpdateEmailCampaignDto,
} from './email-campaign.dto';
import { EmailCampaignService } from './email-campaign.service';

import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Admin - Email Campaign')
@ApiBearerAuth()
@Controller('admin/email-campaign')
export class EmailCampaignController {
  constructor(private readonly service: EmailCampaignService) {}

  @Get()
  @Roles('admin')
  list(
    @CurrentUser() user: any,
    @Query() query: SearchEmailCampaignsDto,
  ): Promise<PaginatedResponse<EmailCampaignEntity>> {
    return this.service.list(user.id, query);
  }

  @Get(':id')
  @Roles('admin')
  getById(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ): Promise<EmailCampaignEntity> {
    return this.service.getById(user.id, id);
  }

  @Post()
  @Roles('admin')
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateEmailCampaignDto,
  ): Promise<EmailCampaignEntity> {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  @Roles('admin')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateEmailCampaignDto,
  ): Promise<EmailCampaignEntity> {
    return this.service.update(user.id, id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(204)
  softDelete(@CurrentUser() user: any, @Param('id') id: string): Promise<void> {
    return this.service.softDelete(user.id, id);
  }

  @Patch(':id/status')
  @Roles('admin')
  setStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: SetEmailCampaignStatusDto,
  ): Promise<EmailCampaignEntity> {
    return this.service.setStatus(user.id, id, dto);
  }

  // ✅ 0..n groups replace
  @Patch(':id/groups')
  @Roles('admin')
  replaceGroups(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ReplaceEmailCampaignGroupsDto,
  ): Promise<EmailCampaignEntity> {
    return this.service.replaceGroups(user.id, id, dto);
  }

  // ✅ 0..n emails(customerIds) replace
  @Patch(':id/emails')
  @Roles('admin')
  replaceEmails(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ReplaceEmailCampaignEmailsDto,
  ): Promise<EmailCampaignEntity> {
    return this.service.replaceEmails(user.id, id, dto);
  }
}
