import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CreateEmailGroupDto,
  EmailGroupEntity,
  PaginatedResponse,
  SearchEmailGroupsDto,
  SetEmailGroupStatusDto,
  STATUS_ACTIVE,
  STATUS_DISABLED,
  UpdateEmailGroupDto,
} from './email-group.dto';
import { EmailGroupRepository } from './email-group.repository';

@Injectable()
export class EmailGroupService {
  constructor(private readonly repo: EmailGroupRepository) {}

  private toEntity(x: any): EmailGroupEntity {
    return {
      id: x.id,
      name: x.name,
      ownerId: x.ownerId,
      isPublic: x.isPublic,
      statusId: x.statusId,
      createdAt: x.createdAt?.toISOString?.() ?? String(x.createdAt),
      updatedAt: x.updatedAt?.toISOString?.() ?? String(x.updatedAt),
    };
  }

  async list(ownerId: string, q: SearchEmailGroupsDto): Promise<PaginatedResponse<EmailGroupEntity>> {
    const safePage = Math.max(1, q.page ?? 1);
    const safeLimit = Math.min(100, Math.max(1, q.limit ?? 10));
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.EmailGroupWhereInput = {
      ownerId,
      ...(q.status === 'active' ? { statusId: STATUS_ACTIVE } : {}),
      ...(q.status === 'disabled' ? { statusId: STATUS_DISABLED } : {}),
      ...(q.visibility === 'public' ? { isPublic: true } : {}),
      ...(q.visibility === 'private' ? { isPublic: false } : {}),
      ...(q.q
        ? {
            name: { contains: q.q },
          }
        : {}),
    };

    const orderBy: Prisma.EmailGroupOrderByWithRelationInput = {
      [q.sortBy ?? 'createdAt']: q.sortOrder ?? 'desc',
    };

    const [items, total] = await Promise.all([
      this.repo.findMany({ where, orderBy, skip, take: safeLimit }),
      this.repo.count({ where }),
    ]);

    return {
      data: items.map((x) => this.toEntity(x)),
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    };
  }

  async getById(ownerId: string, id: string): Promise<EmailGroupEntity> {
    const found = await this.repo.findFirst({ where: { id, ownerId } });
    if (!found) throw new NotFoundException('Email group not found');
    return this.toEntity(found);
  }

  async create(ownerId: string, dto: CreateEmailGroupDto): Promise<EmailGroupEntity> {
    try {
      const created = await this.repo.create({
        data: {
          name: dto.name,
          ownerId,
          isPublic: dto.isPublic ?? false,
          statusId: STATUS_ACTIVE,
        },
      });
      return this.toEntity(created);
    } catch (e: any) {
      // unique(name, ownerId)
      if (e?.code === 'P2002') {
        throw new BadRequestException('Group name already exists for this owner');
      }
      throw e;
    }
  }

  async update(ownerId: string, id: string, dto: UpdateEmailGroupDto): Promise<EmailGroupEntity> {
    // ownership check
    await this.getById(ownerId, id);

    try {
      const updated = await this.repo.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.isPublic !== undefined ? { isPublic: dto.isPublic } : {}),
        },
      });
      // đảm bảo không update nhầm owner: do data không có ownerId
      return this.toEntity(updated);
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new BadRequestException('Group name already exists for this owner');
      }
      throw e;
    }
  }

  async softDelete(ownerId: string, id: string): Promise<void> {
    await this.getById(ownerId, id);
    await this.repo.update({ where: { id }, data: { statusId: STATUS_DISABLED } });
  }

  async setStatus(ownerId: string, id: string, dto: SetEmailGroupStatusDto): Promise<EmailGroupEntity> {
    await this.getById(ownerId, id);
    const updated = await this.repo.update({ where: { id }, data: { statusId: dto.statusId } });
    return this.toEntity(updated);
  }
}
