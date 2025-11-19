// users/users.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  PaginatedResponse,
  SearchUsersDto,
  UpdateUserDto,
  UserEntity,
  UserStatus,
} from './users.dto';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'List users (paginated + filters)' })
  @ApiOkResponse({ type: PaginatedResponse<UserEntity> as any })
  async list(@Query() query: SearchUsersDto) {
    return this.usersService.searchAllUsers(query);
  }

  @Roles('admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiOkResponse({ type: UserEntity })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getById(@Param('id') id: string) {
    const user = await this.usersService.getUserByIdSafe(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiCreatedResponse({ type: UserEntity })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Roles('admin')
  @Put(':id')
  @ApiOperation({ summary: 'Update user (replace)' })
  @ApiOkResponse({ type: UserEntity })
  async replace(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Update user (partial)' })
  @ApiOkResponse({ type: UserEntity })
  async patch(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Soft deleted' })
  async softDelete(@Param('id') id: string) {
    await this.usersService.softDelete(id);
  }

  @Roles('admin')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Change user status' })
  @ApiOkResponse({ type: UserEntity })
  async changeStatus(
    @Param('id') id: string,
    @Body() body: { status: UserStatus },
  ) {
    return this.usersService.setStatus(id, body.status);
  }
}
