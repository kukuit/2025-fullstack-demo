// customers/customers.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum CustomerStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

/** Entity cho Swagger (response) */
export class EmailCustomerEntity {
  @ApiProperty({ example: 'ckv9y3q0c0001s1x8d9z0k3n1' })
  id: string;

  @ApiProperty({ example: 'Công ty ABC' })
  name: string;

  @ApiPropertyOptional({ example: 'abc@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: '0909000999' })
  phone?: string;

  @ApiPropertyOptional({ example: 'ABC Corp' })
  company?: string;

  @ApiPropertyOptional({ example: 'Khách hàng lâu năm' })
  notes?: string;

  @ApiPropertyOptional({
    example: '01JGZ8A6H6H0A4F7N0P0M8F2VE',
    nullable: true,
  })
  userId?: string | null;

  @ApiPropertyOptional({ example: true })
  isPublic?: boolean;

  @ApiProperty({ enum: [CustomerStatus.ACTIVE, CustomerStatus.DISABLED] })
  status: CustomerStatus;

  @ApiProperty({ example: '2025-11-01T12:34:56.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-11-01T12:34:56.000Z' })
  updatedAt: string;
}

/** Generic paginate giống users */
export class PaginatedResponse<T> {
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

/** Query search/list customers */
export class SearchCustomersDto {
  @ApiPropertyOptional({
    enum: ['all', CustomerStatus.ACTIVE, CustomerStatus.DISABLED],
    default: 'all',
  })
  @IsOptional()
  @IsString()
  status: 'all' | CustomerStatus = 'all';

  @ApiPropertyOptional({
    enum: ['all', 'public', 'private'],
    default: 'all',
    description: 'Lọc theo isPublic',
  })
  @IsOptional()
  @IsString()
  visibility: 'all' | 'public' | 'private' = 'all';

  @ApiPropertyOptional({ description: 'Free text: name/email/phone/company' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({
    enum: ['createdAt', 'name', 'email', 'company'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy: 'createdAt' | 'name' | 'email' | 'company' = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder: 'asc' | 'desc' = 'desc';
}

/** DTO tạo mới */
export class CreateCustomerDto {
  @ApiProperty({ example: 'Công ty ABC' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'abc@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '0909000999' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'ABC Corp' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ example: 'Khách hàng tiềm năng' })
  @IsOptional()
  @IsString()
  notes?: string;

  // (tuỳ chọn) gán owner là user hiện tại – tuỳ logic controller/service
  @ApiPropertyOptional({ example: '01JGZ8A6H6H0A4F7N0P0M8F2VE' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublic?: boolean = false;
}

/** DTO update */
export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: 'Công ty ABC (mới)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'abc@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '0909000999' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'ABC Corp' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ example: 'Ghi chú mới' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: '01JGZ8A6H6H0A4F7N0P0M8F2VE' })
  @IsOptional()
  @IsString()
  userId?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    enum: [CustomerStatus.ACTIVE, CustomerStatus.DISABLED],
  })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;
}
