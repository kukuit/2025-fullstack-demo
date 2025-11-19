// users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ulid } from 'ulid';
import {
  CreateUserDto,
  PaginatedResponse,
  SearchUsersDto,
  UpdateUserDto,
  UserEntity,
  UserStatus,
} from './users.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  private stripSensitive = (u: any): UserEntity => {
    if (!u) return u;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safe } = u;
    return safe as UserEntity;
  };

  async getUserByIdSafe(id: string): Promise<UserEntity | null> {
    const user = await this.repo.findById(id);
    return user ? this.stripSensitive(user) : null;
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const hash = await bcrypt.hash(dto.password, 10);

    // 1) Sinh ULID cho user (và sẽ dùng lại cho profile)
    const id = ulid();

    // 1) Tạo Users
    const createdUser = await this.repo.create({
      id,
      email: dto.email,
      password: hash,
      roleId: dto.role,
      status: UserStatus.ACTIVE,
    });

    // 2) Nếu có payload profile thì tạo Profile (id = user.id; FK userId = user.id)
    const hasProfilePayload =
      dto.name || dto.phone || dto.avatar || dto.gender || dto.dob;

    if (hasProfilePayload) {
      await this.repo.createProfile({
        id,
        userId: id,
        name: dto.name,
        avatar: dto.avatar,
        phone: dto.phone,
        gender: dto.gender,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        status: UserStatus.ACTIVE,
      });
    }

    // 3) Lấy lại user đầy đủ
    const full = await this.repo.findById(id);
    return this.stripSensitive(full);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    // 1) Build data cập nhật Users
    const data: any = {};
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    if (dto.role !== undefined) data.roleId = dto.role;
    if (dto.status !== undefined) data.status = dto.status;

    if (Object.keys(data).length > 0) {
      await this.repo.update(id, data);
    }

    // 2) Nếu có payload profile thì upsert theo userId
    const hasProfilePayload =
      dto.name !== undefined ||
      dto.phone !== undefined ||
      dto.avatar !== undefined ||
      dto.gender !== undefined ||
      dto.dob !== undefined ||
      dto.status !== undefined;

    if (hasProfilePayload) {
      await this.repo.upsertProfileByUserId(id, {
        create: {
          id,
          userId: id,
          name: dto.name,
          phone: dto.phone,
          avatar: dto.avatar,
          gender: dto.gender,
          dob: dto.dob ? new Date(dto.dob) : undefined,
          status: dto.status ?? UserStatus.ACTIVE,
        },
        update: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
          ...(dto.avatar !== undefined ? { avatar: dto.avatar } : {}),
          ...(dto.gender !== undefined ? { gender: dto.gender } : {}),
          ...(dto.dob !== undefined
            ? { dob: dto.dob ? new Date(dto.dob) : null }
            : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
        },
      });
    }

    const full = await this.repo.findById(id);
    if (!full) throw new NotFoundException('User not found');
    return this.stripSensitive(full);
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException('User not found');

    await this.repo.update(id, { status: UserStatus.DISABLED });
    await this.repo.updateProfileStatusByUserId(id, UserStatus.DISABLED);
  }

  async setStatus(id: string, status: UserStatus): Promise<UserEntity> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException('User not found');

    await this.repo.update(id, { status });
    await this.repo.updateProfileStatusByUserId(id, status);

    const full = await this.repo.findById(id);
    return this.stripSensitive(full);
  }

  async searchAllUsers(
    q: SearchUsersDto,
  ): Promise<PaginatedResponse<UserEntity>> {
    const {
      page,
      limit,
      status,
      email,
      q: text,
      roleId,
      sortBy,
      sortOrder,
    } = q;

    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (email) where.email = email;
    if (roleId) where.roleId = roleId;
    if (text) {
      where.OR = [
        { email: { contains: text, mode: 'insensitive' } },
        { profile: { name: { contains: text, mode: 'insensitive' } } }, // tìm theo profile.name
      ];
    }

    const safeLimit = Math.min(Math.max(limit ?? 10, 1), 100);
    const safePage = Math.max(page ?? 1, 1);
    const orderBy = [
      { [sortBy || 'createdAt']: (sortOrder || 'desc').toLowerCase() },
    ];

    const [data, total] = await Promise.all([
      this.repo.findMany({
        where,
        orderBy,
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        include: { role: true, profile: true },
      }),
      this.repo.count(where),
    ]);

    return {
      data: data.map(this.stripSensitive),
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }
}
