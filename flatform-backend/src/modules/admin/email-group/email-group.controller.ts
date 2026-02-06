import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  CreateEmailGroupDto,
  EmailGroupEntity,
  PaginatedResponse,
  SearchEmailGroupsDto,
  SetEmailGroupStatusDto,
  UpdateEmailGroupDto,
} from './email-group.dto';
import { EmailGroupService } from './email-group.service';

@ApiTags('Admin - Email Group')
@ApiBearerAuth()
@Controller('admin/email-group')
export class EmailGroupController {
  constructor(private readonly service: EmailGroupService) {}

  @Get()
  @Roles('admin')
  @ApiOkResponse({ type: PaginatedResponse<EmailGroupEntity> as any })
  list(@CurrentUser() user: any, @Query() q: SearchEmailGroupsDto) {
    return this.service.list(user.id, q);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOkResponse({ type: EmailGroupEntity })
  get(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.getById(user.id, id);
  }

  @Post()
  @Roles('admin')
  @ApiOkResponse({ type: EmailGroupEntity })
  create(@CurrentUser() user: any, @Body() dto: CreateEmailGroupDto) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOkResponse({ type: EmailGroupEntity })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateEmailGroupDto) {
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
  @ApiOkResponse({ type: EmailGroupEntity })
  setStatus(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: SetEmailGroupStatusDto) {
    return this.service.setStatus(user.id, id, dto);
  }
}
