import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CreateEmailCustomerDto,
  EmailCustomerEntity,
  PaginatedResponse,
  SearchEmailCustomersDto,
  SetEmailCustomerStatusDto,
  STATUS_ACTIVE,
  STATUS_DISABLED,
  UpdateEmailCustomerDto,
} from './email-customer.dto';
import {
  EmailCustomerRepository,
  GROUPS_SELECT,
} from './email-customer.repository';

@Injectable()
export class EmailCustomerService {
  constructor(private readonly repo: EmailCustomerRepository) {}

  private normalizeEmail(email: string) {
    return String(email ?? '')
      .trim()
      .toLowerCase();
  }

  private toEntity(x: any): EmailCustomerEntity {
    const groupIds = Array.isArray(x?.groups)
      ? x.groups.map((g: any) => g.groupId).filter(Boolean)
      : [];

    return {
      id: x.id,
      email: x.email,
      name: x.name ?? null,
      phone: x.phone ?? null,
      company: x.company ?? null,
      notes: x.notes ?? null,

      groupIds,

      userId: x.userId,
      isPublic: x.isPublic,
      statusId: x.statusId,
      createdAt: x.createdAt?.toISOString?.() ?? String(x.createdAt),
      updatedAt: x.updatedAt?.toISOString?.() ?? String(x.updatedAt),
    };
  }

  async list(
    userId: string,
    q: SearchEmailCustomersDto,
  ): Promise<PaginatedResponse<EmailCustomerEntity>> {
    const safePage = Math.max(1, q.page ?? 1);
    const safeLimit = Math.min(100, Math.max(1, q.limit ?? 10));
    const skip = (safePage - 1) * safeLimit;

    const keyword = q.q?.trim();

    const where: Prisma.EmailCustomerWhereInput = {
      userId,
      ...(q.status === 'active' ? { statusId: STATUS_ACTIVE } : {}),
      ...(q.status === 'disabled' ? { statusId: STATUS_DISABLED } : {}),
      ...(q.visibility === 'public' ? { isPublic: true } : {}),
      ...(q.visibility === 'private' ? { isPublic: false } : {}),
      ...(keyword
        ? {
            OR: [
              { email: { contains: keyword } },
              { name: { contains: keyword } },
              { phone: { contains: keyword } },
              { company: { contains: keyword } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.EmailCustomerOrderByWithRelationInput = {
      [q.sortBy ?? 'createdAt']: q.sortOrder ?? 'desc',
    };

    const [items, total] = await Promise.all([
      this.repo.findMany({
        where,
        orderBy,
        skip,
        take: safeLimit,
        include: GROUPS_SELECT, // ✅
      }),
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

  async getById(userId: string, id: string): Promise<EmailCustomerEntity> {
    const found = await this.repo.findFirst({
      where: { id, userId },
      include: GROUPS_SELECT, // ✅
    });
    if (!found) throw new NotFoundException('Email customer not found');
    return this.toEntity(found);
  }

  async create(
    userId: string,
    dto: CreateEmailCustomerDto,
  ): Promise<EmailCustomerEntity> {
    const email = this.normalizeEmail(dto.email);
    if (!email) throw new BadRequestException('Email is required');

    try {
      const created = await this.repo.createWithGroups({
        userId,
        groupIds: dto.groupIds,
        data: {
          email,
          name: dto.name,
          phone: dto.phone,
          company: dto.company,
          notes: dto.notes,
          isPublic: dto.isPublic ?? false,
        },
      });

      return this.toEntity(created);
    } catch (e: any) {
      if (e?.code === 'P2002')
        throw new BadRequestException('Email already exists for this owner');
      if (String(e?.message || '').includes('groupIds'))
        throw new BadRequestException(e.message);
      throw e;
    }
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateEmailCustomerDto,
  ): Promise<EmailCustomerEntity> {
    const data: Prisma.EmailCustomerUpdateManyMutationInput = {
      ...(dto.email !== undefined
        ? { email: this.normalizeEmail(dto.email) }
        : {}),
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      ...(dto.company !== undefined ? { company: dto.company } : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      ...(dto.isPublic !== undefined ? { isPublic: dto.isPublic } : {}),
    };

    try {
      const res = await this.repo.updateMany({ where: { id, userId }, data });
      if (res.count === 0)
        throw new NotFoundException('Email customer not found');

      const found = await this.repo.findFirst({
        where: { id, userId },
        include: GROUPS_SELECT, // ✅
      });
      if (!found) throw new NotFoundException('Email customer not found');

      return this.toEntity(found);
    } catch (e: any) {
      if (e?.code === 'P2002')
        throw new BadRequestException('Email already exists for this owner');
      throw e;
    }
  }

  async replaceGroups(
    userId: string,
    id: string,
    groupIds: string[],
  ): Promise<EmailCustomerEntity> {
    try {
      const updated = await this.repo.replaceGroups({
        userId,
        customerId: id,
        groupIds,
      });
      return this.toEntity(updated);
    } catch (e: any) {
      if (String(e?.message || '').includes('not found'))
        throw new NotFoundException('Email customer not found');
      if (String(e?.message || '').includes('groupIds'))
        throw new BadRequestException(e.message);
      throw e;
    }
  }

  async softDelete(userId: string, id: string): Promise<void> {
    const res = await this.repo.updateMany({
      where: { id, userId },
      data: { statusId: STATUS_DISABLED },
    });
    if (res.count === 0)
      throw new NotFoundException('Email customer not found');
  }

  async setStatus(
    userId: string,
    id: string,
    dto: SetEmailCustomerStatusDto,
  ): Promise<EmailCustomerEntity> {
    const res = await this.repo.updateMany({
      where: { id, userId },
      data: { statusId: dto.statusId },
    });
    if (res.count === 0)
      throw new NotFoundException('Email customer not found');

    const found = await this.repo.findFirst({
      where: { id, userId },
      include: GROUPS_SELECT, // ✅
    });
    if (!found) throw new NotFoundException('Email customer not found');

    return this.toEntity(found);
  }
}
