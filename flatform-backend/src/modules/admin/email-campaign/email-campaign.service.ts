import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CreateEmailCampaignDto,
  EmailCampaignEntity,
  PaginatedResponse,
  ReplaceEmailCampaignEmailsDto,
  ReplaceEmailCampaignGroupsDto,
  SearchEmailCampaignsDto,
  SetEmailCampaignStatusDto,
  STATUS_ACTIVE,
  STATUS_DISABLED,
  UpdateEmailCampaignDto,
} from './email-campaign.dto';
import {
  CAMPAIGN_INCLUDE,
  EmailCampaignRepository,
} from './email-campaign.repository';

@Injectable()
export class EmailCampaignService {
  constructor(private readonly repo: EmailCampaignRepository) {}

  private toEntity(x: any): EmailCampaignEntity {
    const groupIds = Array.isArray(x?.groups)
      ? x.groups.map((g: any) => g.groupId).filter(Boolean)
      : [];
    const customerIds = Array.isArray(x?.emails)
      ? x.emails.map((e: any) => e.customerId).filter(Boolean)
      : [];

    return {
      id: x.id,
      name: x.name,
      description: x.description ?? null,
      ownerId: x.ownerId,
      templateId: x.templateId,
      isPublic: x.isPublic,
      statusId: x.statusId,
      groupIds,
      customerIds,
      createdAt: x.createdAt?.toISOString?.() ?? String(x.createdAt),
      updatedAt: x.updatedAt?.toISOString?.() ?? String(x.updatedAt),
    };
  }

  async list(
    ownerId: string,
    q: SearchEmailCampaignsDto,
  ): Promise<PaginatedResponse<EmailCampaignEntity>> {
    const safePage = Math.max(1, q.page ?? 1);
    const safeLimit = Math.min(100, Math.max(1, q.limit ?? 10));
    const skip = (safePage - 1) * safeLimit;

    const keyword = q.q?.trim();

    const where: Prisma.EmailCampaignWhereInput = {
      ownerId,
      ...(q.status === 'active' ? { statusId: STATUS_ACTIVE } : {}),
      ...(q.status === 'disabled' ? { statusId: STATUS_DISABLED } : {}),
      ...(q.visibility === 'public' ? { isPublic: true } : {}),
      ...(q.visibility === 'private' ? { isPublic: false } : {}),
      ...(keyword
        ? {
            OR: [
              { name: { contains: keyword } },
              { description: { contains: keyword } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.EmailCampaignOrderByWithRelationInput = {
      [q.sortBy ?? 'createdAt']: q.sortOrder ?? 'desc',
    };

    const [items, total] = await Promise.all([
      this.repo.findMany({
        where,
        orderBy,
        skip,
        take: safeLimit,
        include: CAMPAIGN_INCLUDE,
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

  async getById(ownerId: string, id: string): Promise<EmailCampaignEntity> {
    const found = await this.repo.findFirst({
      where: { id, ownerId },
      include: CAMPAIGN_INCLUDE,
    });
    if (!found) throw new NotFoundException('Email campaign not found');
    return this.toEntity(found);
  }

  async create(
    ownerId: string,
    dto: CreateEmailCampaignDto,
  ): Promise<EmailCampaignEntity> {
    const name = String(dto.name ?? '').trim();
    if (!name) throw new BadRequestException('Name is required');

    try {
      const created = await this.repo.createWithLinks({
        ownerId,
        templateId: dto.templateId,
        data: {
          name,
          description: dto.description,
          isPublic: dto.isPublic ?? false,
        },
        groupIds: dto.groupIds, // ✅ 0..n
        customerIds: dto.customerIds, // ✅ 0..n
      });

      return this.toEntity(created);
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('templateId')) throw new BadRequestException(msg);
      if (msg.includes('groupIds')) throw new BadRequestException(msg);
      if (msg.includes('customerIds')) throw new BadRequestException(msg);
      throw e;
    }
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateEmailCampaignDto,
  ): Promise<EmailCampaignEntity> {
    const data: Omit<Prisma.EmailCampaignUpdateInput, 'template'> = {
      ...(dto.name !== undefined ? { name: String(dto.name).trim() } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description }
        : {}),
      ...(dto.isPublic !== undefined ? { isPublic: dto.isPublic } : {}),
    };

    try {
      const updated = await this.repo.updateOwned({
        ownerId,
        campaignId: id,
        data,
        templateId: dto.templateId, // ✅ optional change
      });

      return this.toEntity(updated);
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('not found'))
        throw new NotFoundException('Email campaign not found');
      if (msg.includes('templateId')) throw new BadRequestException(msg);
      throw new BadRequestException(msg);
    }
  }

  async softDelete(ownerId: string, id: string): Promise<void> {
    const res = await this.repo.updateMany({
      where: { id, ownerId },
      data: { statusId: STATUS_DISABLED },
    });
    if (res.count === 0)
      throw new NotFoundException('Email campaign not found');
  }

  async setStatus(
    ownerId: string,
    id: string,
    dto: SetEmailCampaignStatusDto,
  ): Promise<EmailCampaignEntity> {
    const res = await this.repo.updateMany({
      where: { id, ownerId },
      data: { statusId: dto.statusId },
    });
    if (res.count === 0)
      throw new NotFoundException('Email campaign not found');

    const found = await this.repo.findFirst({
      where: { id, ownerId },
      include: CAMPAIGN_INCLUDE,
    });
    if (!found) throw new NotFoundException('Email campaign not found');

    return this.toEntity(found);
  }

  async replaceGroups(
    ownerId: string,
    id: string,
    dto: ReplaceEmailCampaignGroupsDto,
  ): Promise<EmailCampaignEntity> {
    try {
      const updated = await this.repo.replaceGroups({
        ownerId,
        campaignId: id,
        groupIds: dto.groupIds,
      });
      return this.toEntity(updated);
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('not found'))
        throw new NotFoundException('Email campaign not found');
      throw new BadRequestException(msg);
    }
  }

  async replaceEmails(
    ownerId: string,
    id: string,
    dto: ReplaceEmailCampaignEmailsDto,
  ): Promise<EmailCampaignEntity> {
    try {
      const updated = await this.repo.replaceEmails({
        ownerId,
        campaignId: id,
        customerIds: dto.customerIds,
      });
      return this.toEntity(updated);
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('not found'))
        throw new NotFoundException('Email campaign not found');
      throw new BadRequestException(msg);
    }
  }
}
