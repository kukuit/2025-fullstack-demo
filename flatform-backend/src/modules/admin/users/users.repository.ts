// users/users.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service'; // đổi path nếu cần
import { UserStatus } from './users.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  // -------- Users --------
  async findMany(params: {
    where?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
    include?: any;
  }) {
    const { where, orderBy, skip, take, include } = params;
    return this.prisma.users.findMany({
      where,
      orderBy,
      skip,
      take,
      include,
    });
  }

  async count(where?: any) {
    return this.prisma.users.count({ where });
  }

  async findById(id: string) {
    return this.prisma.users.findUnique({
      where: { id },
      include: { role: true, profile: true },
    });
  }

  async create(data: any) {
    return this.prisma.users.create({
      data,
      include: { role: true, profile: true },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.users.update({
      where: { id },
      data,
      include: { role: true, profile: true },
    });
  }

  async softDelete(id: string) {
    return this.prisma.users.update({
      where: { id },
      data: { status: UserStatus.DISABLED },
    });
  }

  async setStatus(id: string, status: UserStatus) {
    return this.prisma.users.update({
      where: { id },
      data: { status },
      include: { role: true, profile: true },
    });
  }

  // -------- Profile helpers --------
  async createProfile(data: {
    id: string;
    userId: string;
    name?: string;
    avatar?: string;
    phone?: string;
    gender?: string;
    dob?: Date;
    status?: UserStatus;
  }) {
    return this.prisma.profile.create({ data });
  }

  async upsertProfileByUserId(
    userId: string,
    payload: {
      create: {
        id: string;
        userId: string;
        name?: string;
        avatar?: string;
        phone?: string;
        gender?: string;
        dob?: Date;
        status?: UserStatus;
      };
      update: {
        name?: string | null;
        avatar?: string | null;
        phone?: string | null;
        gender?: string | null;
        dob?: Date | null;
        status?: UserStatus;
      };
    },
  ) {
    // Profile có unique userId
    return this.prisma.profile.upsert({
      where: { userId },
      create: payload.create,
      update: payload.update,
    });
  }

  async updateProfileStatusByUserId(userId: string, status: UserStatus) {
    return this.prisma.profile.updateMany({
      where: { userId },
      data: { status },
    });
  }
}
