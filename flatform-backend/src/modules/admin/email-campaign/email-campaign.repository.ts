import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

// ✅ template status allowed for campaign usage
export const TEMPLATE_SENDABLE_STATUSES = [
  'active',
  'published',
  'in_store',
] as const;

export const CAMPAIGN_INCLUDE = {
  groups: { where: { statusId: 1 }, select: { groupId: true } },
  emails: { where: { statusId: 1 }, select: { customerId: true } },
} satisfies Prisma.EmailCampaignInclude;

@Injectable()
export class EmailCampaignRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(args: Prisma.EmailCampaignFindManyArgs) {
    return this.prisma.emailCampaign.findMany(args);
  }

  count(args: Prisma.EmailCampaignCountArgs) {
    return this.prisma.emailCampaign.count(args);
  }

  findFirst(args: Prisma.EmailCampaignFindFirstArgs) {
    return this.prisma.emailCampaign.findFirst(args);
  }

  updateMany(args: Prisma.EmailCampaignUpdateManyArgs) {
    return this.prisma.emailCampaign.updateMany(args);
  }

  private async assertTemplateUsable(
    tx: Prisma.TransactionClient,
    ownerId: string,
    templateId: string,
  ) {
    const tpl = await tx.emailTemplate.findFirst({
      where: {
        id: templateId,
        userId: ownerId,
        status: { status: { in: [...TEMPLATE_SENDABLE_STATUSES] } }, // ✅ check by string
      },
      select: { id: true },
    });

    if (!tpl) {
      throw new Error(
        `templateId is invalid/not owned or not in sendable status (${TEMPLATE_SENDABLE_STATUSES.join(', ')})`,
      );
    }
  }

  private async assertGroupsOwned(
    tx: Prisma.TransactionClient,
    ownerId: string,
    groupIds: string[],
  ) {
    if (groupIds.length === 0) return;

    const groups = await tx.emailGroup.findMany({
      where: { id: { in: groupIds }, ownerId, statusId: 1 },
      select: { id: true },
    });

    if (groups.length !== groupIds.length) {
      throw new Error(
        'Some groupIds are invalid, disabled, or not owned by current user',
      );
    }
  }

  private async assertCustomersOwned(
    tx: Prisma.TransactionClient,
    ownerId: string,
    customerIds: string[],
  ) {
    if (customerIds.length === 0) return;

    const cus = await tx.emailCustomer.findMany({
      where: { id: { in: customerIds }, userId: ownerId, statusId: 1 },
      select: { id: true },
    });

    if (cus.length !== customerIds.length) {
      throw new Error(
        'Some customerIds are invalid, disabled, or not owned by current user',
      );
    }
  }

  async createWithLinks(params: {
    ownerId: string;
    templateId: string;
    data: Omit<
      Prisma.EmailCampaignCreateInput,
      'owner' | 'status' | 'template' | 'groups' | 'emails'
    >;
    groupIds?: string[];
    customerIds?: string[];
  }) {
    const { ownerId, templateId, data } = params;

    const uniqGroupIds = Array.from(
      new Set((params.groupIds ?? []).filter(Boolean)),
    ).slice(0, 50);
    const uniqCustomerIds = Array.from(
      new Set((params.customerIds ?? []).filter(Boolean)),
    ).slice(0, 500);

    return this.prisma.$transaction(async (tx) => {
      await this.assertTemplateUsable(tx, ownerId, templateId);
      await this.assertGroupsOwned(tx, ownerId, uniqGroupIds);
      await this.assertCustomersOwned(tx, ownerId, uniqCustomerIds);

      const created = await tx.emailCampaign.create({
        data: {
          ...data,
          owner: { connect: { id: ownerId } },
          status: { connect: { id: 1 } },
          template: { connect: { id: templateId } },
        },
      });

      // 0..n groups
      if (uniqGroupIds.length > 0) {
        await tx.emailCampaignGroup.createMany({
          data: uniqGroupIds.map((groupId) => ({
            campaignId: created.id,
            groupId,
          })),
          skipDuplicates: true,
        });
      }

      // 0..n emails (customers)
      if (uniqCustomerIds.length > 0) {
        await tx.emailCampaignEmail.createMany({
          data: uniqCustomerIds.map((customerId) => ({
            campaignId: created.id,
            customerId,
          })),
          skipDuplicates: true,
        });
      }

      const full = await tx.emailCampaign.findFirst({
        where: { id: created.id, ownerId },
        include: CAMPAIGN_INCLUDE,
      });

      return full ?? created;
    });
  }

  async updateOwned(params: {
    ownerId: string;
    campaignId: string;
    data: Omit<
      Prisma.EmailCampaignUpdateInput,
      'owner' | 'status' | 'groups' | 'emails'
    >;
    templateId?: string; // if changing template
  }) {
    const { ownerId, campaignId, data, templateId } = params;

    return this.prisma.$transaction(async (tx) => {
      const camp = await tx.emailCampaign.findFirst({
        where: { id: campaignId, ownerId },
        select: { id: true },
      });
      if (!camp) throw new Error('Email campaign not found');

      // if change template
      const extra: Prisma.EmailCampaignUpdateInput = templateId
        ? await (async () => {
            await this.assertTemplateUsable(tx, ownerId, templateId);
            return { template: { connect: { id: templateId } } };
          })()
        : {};

      const updated = await tx.emailCampaign.update({
        where: { id: campaignId },
        data: { ...data, ...extra },
        include: CAMPAIGN_INCLUDE,
      });

      return updated;
    });
  }

  async replaceGroups(params: {
    ownerId: string;
    campaignId: string;
    groupIds: string[];
  }) {
    const { ownerId, campaignId } = params;
    const uniqGroupIds = Array.from(
      new Set((params.groupIds ?? []).filter(Boolean)),
    ).slice(0, 50);

    return this.prisma.$transaction(async (tx) => {
      const camp = await tx.emailCampaign.findFirst({
        where: { id: campaignId, ownerId },
        select: { id: true },
      });
      if (!camp) throw new Error('Email campaign not found');

      await this.assertGroupsOwned(tx, ownerId, uniqGroupIds);

      await tx.emailCampaignGroup.deleteMany({ where: { campaignId } });

      if (uniqGroupIds.length > 0) {
        await tx.emailCampaignGroup.createMany({
          data: uniqGroupIds.map((groupId) => ({ campaignId, groupId })),
          skipDuplicates: true,
        });
      }

      const full = await tx.emailCampaign.findFirst({
        where: { id: campaignId, ownerId },
        include: CAMPAIGN_INCLUDE,
      });

      return full!;
    });
  }

  async replaceEmails(params: {
    ownerId: string;
    campaignId: string;
    customerIds: string[];
  }) {
    const { ownerId, campaignId } = params;
    const uniqCustomerIds = Array.from(
      new Set((params.customerIds ?? []).filter(Boolean)),
    ).slice(0, 500);

    return this.prisma.$transaction(async (tx) => {
      const camp = await tx.emailCampaign.findFirst({
        where: { id: campaignId, ownerId },
        select: { id: true },
      });
      if (!camp) throw new Error('Email campaign not found');

      await this.assertCustomersOwned(tx, ownerId, uniqCustomerIds);

      await tx.emailCampaignEmail.deleteMany({ where: { campaignId } });

      if (uniqCustomerIds.length > 0) {
        await tx.emailCampaignEmail.createMany({
          data: uniqCustomerIds.map((customerId) => ({
            campaignId,
            customerId,
          })),
          skipDuplicates: true,
        });
      }

      const full = await tx.emailCampaign.findFirst({
        where: { id: campaignId, ownerId },
        include: CAMPAIGN_INCLUDE,
      });

      return full!;
    });
  }
}
