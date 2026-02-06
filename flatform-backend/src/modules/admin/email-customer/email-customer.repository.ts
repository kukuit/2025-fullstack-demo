import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';

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

  create(args: Prisma.EmailCustomerCreateArgs) {
    return this.prisma.emailCustomer.create(args);
  }

  update(args: Prisma.EmailCustomerUpdateArgs) {
    return this.prisma.emailCustomer.update(args);
  }
}
