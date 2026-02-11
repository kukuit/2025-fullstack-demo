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
  CreateEmailCustomerDto,
  EmailCustomerEntity,
  PaginatedResponse,
  SearchEmailCustomersDto,
  SetEmailCustomerStatusDto,
  UpdateEmailCustomerDto,
  ReplaceEmailCustomerGroupsDto,
} from './email-customer.dto';
import { EmailCustomerService } from './email-customer.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Admin - Email Customer')
@ApiBearerAuth()
@Controller('admin/email-customer')
export class EmailCustomerController {
  constructor(private readonly service: EmailCustomerService) {}

  @Get()
  @Roles('admin')
  list(
    @CurrentUser() user: any,
    @Query() query: SearchEmailCustomersDto,
  ): Promise<PaginatedResponse<EmailCustomerEntity>> {
    return this.service.list(user.id, query);
  }

  @Get(':id')
  @Roles('admin')
  getById(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ): Promise<EmailCustomerEntity> {
    return this.service.getById(user.id, id);
  }

  @Post()
  @Roles('admin')
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateEmailCustomerDto,
  ): Promise<EmailCustomerEntity> {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  @Roles('admin')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateEmailCustomerDto,
  ): Promise<EmailCustomerEntity> {
    return this.service.update(user.id, id, dto);
  }

  @Patch(':id/groups')
  @Roles('admin')
  replaceGroups(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ReplaceEmailCustomerGroupsDto,
  ): Promise<EmailCustomerEntity> {
    return this.service.replaceGroups(user.id, id, dto.groupIds);
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
    @Body() dto: SetEmailCustomerStatusDto,
  ): Promise<EmailCustomerEntity> {
    return this.service.setStatus(user.id, id, dto);
  }
}
