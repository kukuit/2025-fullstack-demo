import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import { EmailCustomerRepository } from './email-customer.repository';

@Injectable()
export class EmailCustomerService {
  constructor(private readonly repo: EmailCustomerRepository) {}

  private toEntity(x: any): EmailCustomerEntity {
    return {
      id: x.id,
      email: x.email,
      name: x.name ?? null,
      phone: x.phone ?? null,
      company: x.company ?? null,
      notes: x.notes ?? null,
      userId: x.userId,
      isPublic: x.isPublic,
      statusId: x.statusId,
      createdAt: x.createdAt?.toISOString?.() ?? String(x.createdAt),
      updatedAt: x.updatedAt?.toISOString?.() ?? String(x.updatedAt),
    };
  }

  async list(userId: string, q: SearchEmailCustomersDto): Promise<PaginatedResponse<EmailCustomerEntity>> {
    const safePage = Math.max(1, q.page ?? 1);
    const safeLimit = Math.min(100, Math.max(1, q.limit ?? 10));
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.EmailCustomerWhereInput = {
      userId,
      ...(q.status === 'active' ? { statusId: STATUS_ACTIVE } : {}),
      ...(q.status === 'disabled' ? { statusId: STATUS_DISABLED } : {}),
      ...(q.visibility === 'public' ? { isPublic: true } : {}),
      ...(q.visibility === 'private' ? { isPublic: false } : {}),
      ...(q.q
        ? {
            OR: [
              { email: { contains: q.q } },
              { name: { contains: q.q } },
              { phone: { contains: q.q } },
              { company: { contains: q.q } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.EmailCustomerOrderByWithRelationInput = {
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

  async getById(userId: string, id: string): Promise<EmailCustomerEntity> {
    const found = await this.repo.findFirst({ where: { id, userId } });
    if (!found) throw new NotFoundException('Email customer not found');
    return this.toEntity(found);
  }

  async create(userId: string, dto: CreateEmailCustomerDto): Promise<EmailCustomerEntity> {
    try {
      const created = await this.repo.create({
        data: {
          email: dto.email,
          name: dto.name,
          phone: dto.phone,
          company: dto.company,
          notes: dto.notes,
          isPublic: dto.isPublic ?? false,
          userId,
          statusId: STATUS_ACTIVE,
        },
      });
      return this.toEntity(created);
    } catch (e: any) {
      // Nếu bạn bật @@unique([userId,email]) thì sẽ dính P2002
      if (e?.code === 'P2002') {
        throw new BadRequestException('Email already exists for this owner');
      }
      throw e;
    }
  }

  async update(userId: string, id: string, dto: UpdateEmailCustomerDto): Promise<EmailCustomerEntity> {
    await this.getById(userId, id);

    try {
      const updated = await this.repo.update({
        where: { id },
        data: {
          ...(dto.email !== undefined ? { email: dto.email } : {}),
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
          ...(dto.company !== undefined ? { company: dto.company } : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
          ...(dto.isPublic !== undefined ? { isPublic: dto.isPublic } : {}),
        },
      });
      return this.toEntity(updated);
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new BadRequestException('Email already exists for this owner');
      }
      throw e;
    }
  }

  async softDelete(userId: string, id: string): Promise<void> {
    await this.getById(userId, id);
    await this.repo.update({ where: { id }, data: { statusId: STATUS_DISABLED } });
  }

  async setStatus(userId: string, id: string, dto: SetEmailCustomerStatusDto): Promise<EmailCustomerEntity> {
    await this.getById(userId, id);
    const updated = await this.repo.update({ where: { id }, data: { statusId: dto.statusId } });
    return this.toEntity(updated);
  }
}
