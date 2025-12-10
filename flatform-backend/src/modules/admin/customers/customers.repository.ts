// customers/customers.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CustomerStatus } from './customers.dto';

@Injectable()
export class CustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  // -------- EmailCustomer --------
  async findMany(params: {
    where?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
    include?: any;
  }) {
    const { where, orderBy, skip, take, include } = params;
    return this.prisma.emailCustomer.findMany({
      where,
      orderBy,
      skip,
      take,
      include,
    });
  }

  async count(where?: any) {
    return this.prisma.emailCustomer.count({ where });
  }

  async findById(id: string) {
    return this.prisma.emailCustomer.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return this.prisma.emailCustomer.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.emailCustomer.update({
      where: { id },
      data,
    });
  }

  async setStatusById(id: string, status: CustomerStatus) {
    return this.prisma.emailCustomer.update({
      where: { id },
      data: { status },
    });
  }
}
