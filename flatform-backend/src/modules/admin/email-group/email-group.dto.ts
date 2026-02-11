import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const STATUS_ACTIVE = 1;
export const STATUS_DISABLED = 0;

export type VisibilityFilter = 'all' | 'public' | 'private';
export type StatusFilter = 'all' | 'active' | 'disabled';
export type SortBy = 'createdAt' | 'name';
export type SortOrder = 'asc' | 'desc';

export class EmailGroupEntity {
  @ApiProperty() id: string;
  @ApiProperty() name: string;

  @ApiProperty() ownerId: string;
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

export class SearchEmailGroupsDto {
  @ApiPropertyOptional({ default: 'all', enum: ['all', 'active', 'disabled'] })
  @IsOptional()
  @IsIn(['all', 'active', 'disabled'])
  status?: StatusFilter = 'all';

  @ApiPropertyOptional({ default: 'all', enum: ['all', 'public', 'private'] })
  @IsOptional()
  @IsIn(['all', 'public', 'private'])
  visibility?: VisibilityFilter = 'all';

  @ApiPropertyOptional({ description: 'Search by name' })
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

  @ApiPropertyOptional({ default: 'createdAt', enum: ['createdAt', 'name'] })
  @IsOptional()
  @IsIn(['createdAt', 'name'])
  sortBy?: SortBy = 'createdAt';

  @ApiPropertyOptional({ default: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: SortOrder = 'desc';
}

export class CreateEmailGroupDto {
  @ApiProperty() @IsString() name: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;
}

export class UpdateEmailGroupDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class SetEmailGroupStatusDto {
  @ApiProperty({ enum: [0, 1] })
  @Type(() => Number)
  @IsInt()
  @IsIn([STATUS_DISABLED, STATUS_ACTIVE])
  statusId: number;
}
