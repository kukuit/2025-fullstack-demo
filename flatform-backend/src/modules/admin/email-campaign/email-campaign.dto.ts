import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
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
export type SortBy = 'createdAt' | 'updatedAt' | 'name';
export type SortOrder = 'asc' | 'desc';

export class EmailCampaignEntity {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional() description?: string | null;

  @ApiProperty() ownerId: string;
  @ApiProperty() templateId: string;

  @ApiProperty() isPublic: boolean;
  @ApiProperty() statusId: number;

  @ApiProperty({ type: [String] })
  groupIds: string[];

  @ApiProperty({ type: [String] })
  customerIds: string[];

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

export class SearchEmailCampaignsDto {
  @ApiPropertyOptional({ default: 'all', enum: ['all', 'active', 'disabled'] })
  @IsOptional()
  @IsIn(['all', 'active', 'disabled'])
  status?: StatusFilter = 'all';

  @ApiPropertyOptional({ default: 'all', enum: ['all', 'public', 'private'] })
  @IsOptional()
  @IsIn(['all', 'public', 'private'])
  visibility?: VisibilityFilter = 'all';

  @ApiPropertyOptional({ description: 'Search name/description' })
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

  @ApiPropertyOptional({
    default: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'name'],
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'name'])
  sortBy?: SortBy = 'createdAt';

  @ApiPropertyOptional({ default: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: SortOrder = 'desc';
}

export class CreateEmailCampaignDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  // ✅ required
  @ApiProperty()
  @IsString()
  templateId: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;

  // ✅ optional: 0..n
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  groupIds?: string[];

  // ✅ optional: 0..n
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(500)
  @IsString({ each: true })
  customerIds?: string[];
}

export class UpdateEmailCampaignDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class ReplaceEmailCampaignGroupsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  groupIds: string[];
}

export class ReplaceEmailCampaignEmailsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(500)
  @IsString({ each: true })
  customerIds: string[];
}

export class SetEmailCampaignStatusDto {
  @ApiProperty({ enum: [0, 1] })
  @Type(() => Number)
  @IsInt()
  @IsIn([STATUS_DISABLED, STATUS_ACTIVE])
  statusId: number;
}
