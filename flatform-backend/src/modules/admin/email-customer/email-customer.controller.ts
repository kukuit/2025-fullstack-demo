import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  CreateEmailCustomerDto,
  EmailCustomerEntity,
  PaginatedResponse,
  SearchEmailCustomersDto,
  SetEmailCustomerStatusDto,
  UpdateEmailCustomerDto,
} from './email-customer.dto';
import { EmailCustomerService } from './email-customer.service';

@ApiTags('Admin - Email Customer')
@ApiBearerAuth()
@Controller('admin/email-customer')
export class EmailCustomerController {
  constructor(private readonly service: EmailCustomerService) {}

  @Get()
  @Roles('admin')
  @ApiOkResponse({ type: PaginatedResponse<EmailCustomerEntity> as any })
  list(@CurrentUser() user: any, @Query() q: SearchEmailCustomersDto) {
    return this.service.list(user.id, q);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOkResponse({ type: EmailCustomerEntity })
  get(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.getById(user.id, id);
  }

  @Post()
  @Roles('admin')
  @ApiOkResponse({ type: EmailCustomerEntity })
  create(@CurrentUser() user: any, @Body() dto: CreateEmailCustomerDto) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOkResponse({ type: EmailCustomerEntity })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateEmailCustomerDto) {
    return this.service.update(user.id, id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(204)
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    await this.service.softDelete(user.id, id);
  }

  @Patch(':id/status')
  @Roles('admin')
  @ApiOkResponse({ type: EmailCustomerEntity })
  setStatus(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: SetEmailCustomerStatusDto) {
    return this.service.setStatus(user.id, id, dto);
  }
}
