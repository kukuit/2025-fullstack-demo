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
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  CreateCustomerDto,
  CustomerStatus,
  CustomerEntity,
  PaginatedResponse,
  SearchCustomersDto,
  UpdateCustomerDto,
} from './customers.dto';
import { CustomersService } from './customers.service';

@ApiTags('Customers')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
@Controller('admin/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'List customers (paginated + filters)' })
  @ApiOkResponse({ type: PaginatedResponse<CustomerEntity> as any })
  async list(@Query() query: SearchCustomersDto, @CurrentUser() user: any) {
    // Nếu cần filter theo owner thì dùng user.id trong service
    return this.customersService.searchAll(query, user.id);
  }

  @Roles('admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get customer by id (ulid)' })
  @ApiOkResponse({ type: CustomerEntity })
  @ApiNotFoundResponse({ description: 'Customer not found' })
  async getById(@Param('id') id: string) {
    const customer = await this.customersService.getByIdSafe(id);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Create customer (id = ulid từ Prisma)' })
  @ApiCreatedResponse({ type: CustomerEntity })
  async create(@Body() dto: CreateCustomerDto, @CurrentUser() user: any) {
    // userId luôn lấy từ JWT, không cho client truyền
    return this.customersService.create(dto, user.id);
  }

  @Roles('admin')
  @Put(':id')
  @ApiOperation({ summary: 'Update customer (replace)' })
  @ApiOkResponse({ type: CustomerEntity })
  async replace(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser() user: any,
  ) {
    // Nếu sau này cần check owner thì dùng user.id trong service
    return this.customersService.update(id, dto, user.id);
  }

  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Update customer (partial)' })
  @ApiOkResponse({ type: CustomerEntity })
  async patch(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser() user: any,
  ) {
    return this.customersService.update(id, dto, user.id);
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete customer (status = disabled)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Soft deleted' })
  async softDelete(@Param('id') id: string, @CurrentUser() user: any) {
    await this.customersService.softDelete(id, user.id);
  }

  @Roles('admin')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Change customer status' })
  @ApiOkResponse({ type: CustomerEntity })
  async changeStatus(
    @Param('id') id: string,
    @Body() body: { status: CustomerStatus },
    @CurrentUser() user: any,
  ) {
    return this.customersService.setStatus(id, body.status, user.id);
  }
}
