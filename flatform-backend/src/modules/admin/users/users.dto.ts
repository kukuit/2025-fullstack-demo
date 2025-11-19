// users/users.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/** Status chuẩn hoá */
export enum UserStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

/** Entity cho Swagger (response) */
export class UserEntity {
  @ApiProperty({ example: '01JGZ8A6H6H0A4F7N0P0M8F2VE' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiPropertyOptional({ example: 'Nguyễn Văn A' })
  name?: string; // legacy hiển thị; thực tế nằm trong profile

  @ApiProperty({ enum: [UserStatus.ACTIVE, UserStatus.DISABLED] })
  status: UserStatus;

  @ApiPropertyOptional({ example: 2, description: 'Role ID' })
  roleId?: number;

  @ApiPropertyOptional({ example: { id: '01JG...', name: 'Editor' } })
  role?: any;

  @ApiPropertyOptional({
    example: { phone: '0909...', gender: 'male', name: 'Nguyễn Văn A' },
  })
  profile?: any;

  @ApiProperty({ example: '2025-11-01T12:34:56.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-11-06T08:00:00.000Z' })
  updatedAt: string;
}

/** Generic paginated response cho Swagger */
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

/** Query tìm kiếm + phân trang */
export class SearchUsersDto {
  @ApiPropertyOptional({
    enum: ['all', UserStatus.ACTIVE, UserStatus.DISABLED],
    default: 'all',
  })
  @IsOptional()
  @IsString()
  status: 'all' | UserStatus = 'all';

  @ApiPropertyOptional({ example: 'abc@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Free text: name/email' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  roleId?: number;

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
    enum: ['createdAt', 'email', 'name'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy: 'createdAt' | 'email' | 'name' = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder: 'asc' | 'desc' = 'desc';
}

/** Tạo user */
export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'P@ssw0rd!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 2, description: 'Role ID' })
  @IsNumber()
  role: number;

  // ---- Profile payload (optional) ----
  @ApiPropertyOptional({ example: 'Nguyễn Văn B' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '0909000999' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://...' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: 'male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: '1995-10-10' })
  @IsOptional()
  @IsDateString()
  dob?: string;
}

/** Update user */
export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'NewP@ssw0rd!' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  role?: number;

  // ---- Profile payload (optional) ----
  @ApiPropertyOptional({ example: 'Nguyễn Văn B' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '0909000999' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://...' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: 'male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: '1995-10-10' })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({ enum: [UserStatus.ACTIVE, UserStatus.DISABLED] })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
