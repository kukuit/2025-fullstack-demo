import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmailGroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(args: Prisma.EmailGroupFindManyArgs) {
    return this.prisma.emailGroup.findMany(args);
  }

  count(args: Prisma.EmailGroupCountArgs) {
    return this.prisma.emailGroup.count(args);
  }

  findFirst(args: Prisma.EmailGroupFindFirstArgs) {
    return this.prisma.emailGroup.findFirst(args);
  }

  create(args: Prisma.EmailGroupCreateArgs) {
    return this.prisma.emailGroup.create(args);
  }

  update(args: Prisma.EmailGroupUpdateArgs) {
    return this.prisma.emailGroup.update(args);
  }
}
