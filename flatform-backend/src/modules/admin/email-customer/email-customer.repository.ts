import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

const GROUPS_SELECT = {
  groups: {
    where: { statusId: 1 },
    select: { groupId: true },
  },
} satisfies Prisma.EmailCustomerInclude;

@Injectable()
export class EmailCustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(args: Prisma.EmailCustomerFindManyArgs) {
    return this.prisma.emailCustomer.findMany(args);
  }

  count(args: Prisma.EmailCustomerCountArgs) {
    return this.prisma.emailCustomer.count(args);
  }

  findFirst(args: Prisma.EmailCustomerFindFirstArgs) {
    return this.prisma.emailCustomer.findFirst(args);
  }

  updateMany(args: Prisma.EmailCustomerUpdateManyArgs) {
    return this.prisma.emailCustomer.updateMany(args);
  }

  async createWithGroups(params: {
    userId: string;
    data: Omit<Prisma.EmailCustomerCreateInput, 'owner' | 'status'>;
    groupIds?: string[];
  }) {
    const { userId, data, groupIds } = params;
    const uniqGroupIds = Array.from(
      new Set((groupIds ?? []).filter(Boolean)),
    ).slice(0, 50);

    return this.prisma.$transaction(async (tx) => {
      if (uniqGroupIds.length > 0) {
        const ownedGroups = await tx.emailGroup.findMany({
          where: { id: { in: uniqGroupIds }, ownerId: userId, statusId: 1 },
          select: { id: true },
        });

        if (ownedGroups.length !== uniqGroupIds.length) {
          throw new Error(
            'Some groupIds are invalid, disabled, or not owned by current user',
          );
        }
      }

      const created = await tx.emailCustomer.create({
        data: {
          ...data,
          owner: { connect: { id: userId } },
          status: { connect: { id: 1 } }, // active
        },
        // include groups doesn't help yet because groups created after createMany
      });

      if (uniqGroupIds.length > 0) {
        await tx.emailCustomerGroup.createMany({
          data: uniqGroupIds.map((groupId) => ({
            customerId: created.id,
            groupId,
          })),
          skipDuplicates: true,
        });
      }

      // ✅ fetch again to include groups
      const full = await tx.emailCustomer.findFirst({
        where: { id: created.id, userId },
        include: GROUPS_SELECT,
      });

      return full ?? created;
    });
  }
  async replaceGroups(params: {
    userId: string;
    customerId: string;
    groupIds: string[];
  }) {
    const { userId, customerId } = params;
    const uniqGroupIds = Array.from(
      new Set((params.groupIds ?? []).filter(Boolean)),
    ).slice(0, 50);

    return this.prisma.$transaction(async (tx) => {
      // ensure customer owned by user
      const customer = await tx.emailCustomer.findFirst({
        where: { id: customerId, userId },
        select: { id: true },
      });
      if (!customer) throw new Error('Email customer not found');

      // validate groups ownership (active + ownerId)
      if (uniqGroupIds.length > 0) {
        const ownedGroups = await tx.emailGroup.findMany({
          where: { id: { in: uniqGroupIds }, ownerId: userId, statusId: 1 },
          select: { id: true },
        });
        if (ownedGroups.length !== uniqGroupIds.length) {
          throw new Error(
            'Some groupIds are invalid, disabled, or not owned by current user',
          );
        }
      }

      // delete old active joins (you can delete all, it's ok)
      await tx.emailCustomerGroup.deleteMany({
        where: { customerId },
      });

      // insert new
      if (uniqGroupIds.length > 0) {
        await tx.emailCustomerGroup.createMany({
          data: uniqGroupIds.map((groupId) => ({
            customerId,
            groupId,
          })),
          skipDuplicates: true,
        });
      }

      // return customer with groups
      const full = await tx.emailCustomer.findFirst({
        where: { id: customerId, userId },
        include: GROUPS_SELECT,
      });

      return full!;
    });
  }
}

export { GROUPS_SELECT };
