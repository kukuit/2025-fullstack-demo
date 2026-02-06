import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export const STATUS_ACTIVE = 1;
export const STATUS_DISABLED = 0;

export type VisibilityFilter = 'all' | 'public' | 'private';
export type StatusFilter = 'all' | 'active' | 'disabled';
export type SortBy = 'createdAt' | 'email' | 'name' | 'company';
export type SortOrder = 'asc' | 'desc';

export class EmailCustomerEntity {
  @ApiProperty() id: string;
  @ApiProperty() email: string;

  @ApiPropertyOptional() name?: string | null;
  @ApiPropertyOptional() phone?: string | null;
  @ApiPropertyOptional() company?: string | null;
  @ApiPropertyOptional() notes?: string | null;

  @ApiProperty() userId: string;
  @ApiProperty() isPublic: boolean;
  @ApiProperty() statusId: number;

  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;
}

export class PaginatedResponse<T> {
  @ApiProperty({ isArray: true }) data: T[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}

export class SearchEmailCustomersDto {
  @ApiPropertyOptional({ default: 'all', enum: ['all', 'active', 'disabled'] })
  @IsOptional()
  @IsIn(['all', 'active', 'disabled'])
  status?: StatusFilter = 'all';

  @ApiPropertyOptional({ default: 'all', enum: ['all', 'public', 'private'] })
  @IsOptional()
  @IsIn(['all', 'public', 'private'])
  visibility?: VisibilityFilter = 'all';

  @ApiPropertyOptional({ description: 'Search email/name/phone/company' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ default: 'createdAt', enum: ['createdAt', 'email', 'name', 'company'] })
  @IsOptional()
  @IsIn(['createdAt', 'email', 'name', 'company'])
  sortBy?: SortBy = 'createdAt';

  @ApiPropertyOptional({ default: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: SortOrder = 'desc';
}

export class CreateEmailCustomerDto {
  @ApiProperty() @IsEmail() email: string;

  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() company?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;
}

export class UpdateEmailCustomerDto {
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() company?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class SetEmailCustomerStatusDto {
  @ApiProperty({ enum: [0, 1] })
  @Type(() => Number)
  @IsInt()
  @IsIn([STATUS_DISABLED, STATUS_ACTIVE])
  statusId: number;
}
