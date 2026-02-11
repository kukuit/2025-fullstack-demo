// customers/customers.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateCustomerDto,
  CustomerStatus,
  CustomerEntity,
  PaginatedResponse,
  SearchCustomersDto,
  UpdateCustomerDto,
} from './customers.dto';
import { CustomersRepository } from './customers.repository';

@Injectable()
export class CustomersService {
  constructor(private readonly repo: CustomersRepository) {}

  private toEntity(record: any): CustomerEntity {
    if (!record) return null as any;
    // Ở đây shape Prisma ~ giống Entity nên cast là được
    return record as CustomerEntity;
  }

  async getByIdSafe(id: string): Promise<CustomerEntity | null> {
    const customer = await this.repo.findById(id);
    if (!customer) return null;
    return this.toEntity(customer);
  }

  /**
   * Tạo customer mới
   */
  async create(
    dto: CreateCustomerDto,
    currentUserId: string,
  ): Promise<CustomerEntity> {
    const isPublic = dto.isPublic ?? false;

    const created = await this.repo.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      company: dto.company,
      notes: dto.notes,
      isPublic,
      userId: currentUserId,
      status: CustomerStatus.ACTIVE,
    });

    return this.toEntity(created);
  }

  /**
   * Update customer
   * - Không cho client đổi owner trực tiếp
   * - Thay đổi isPublic sẽ tự xử lý lại userId:
   *   + public  -> userId = null
   *   + private -> userId = existing.userId || currentUserId
   */
  async update(id: string, dto: UpdateCustomerDto, currentUserId: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Customer not found');

    const updated = await this.repo.update(id, {
      name: dto.name ?? existing.name,
      email: dto.email ?? existing.email,
      phone: dto.phone ?? existing.phone,
      company: dto.company ?? existing.company,
      notes: dto.notes ?? existing.notes,
      isPublic: dto.isPublic ?? existing.isPublic,

      // ❗ KHÔNG BAO GIỜ thay đổi owner
      userId: existing.userId ?? currentUserId,

      status: dto.status ?? existing.status,
    });

    return this.toEntity(updated);
  }

  /**
   * Soft delete: set status = disabled
   * (hiện tại chưa check owner; sau này nếu cần có thể so sánh existing.userId với currentUserId)
   */
  async softDelete(id: string, _currentUserId: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Customer not found');

    await this.repo.setStatusById(id, CustomerStatus.DISABLED);
  }

  async setStatus(
    id: string,
    status: CustomerStatus,
    _currentUserId: string,
  ): Promise<CustomerEntity> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Customer not found');

    const updated = await this.repo.setStatusById(id, status);
    return this.toEntity(updated);
  }

  /**
   * Search customers
   * - hiện tại: admin dùng, nên không filter theo owner
   * - nếu sau này cần cho client: có thể thêm where.userId = currentUserId OR isPublic = true
   */
  async searchAll(
    q: SearchCustomersDto,
    _currentUserId?: string,
  ): Promise<PaginatedResponse<CustomerEntity>> {
    const { page, limit, status, visibility, q: text, sortBy, sortOrder } = q;

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    if (visibility === 'public') {
      where.isPublic = true;
    } else if (visibility === 'private') {
      where.isPublic = false;
    }

    if (text) {
      where.OR = [
        { name: { contains: text, mode: 'insensitive' } },
        { email: { contains: text, mode: 'insensitive' } },
        { phone: { contains: text, mode: 'insensitive' } },
        { company: { contains: text, mode: 'insensitive' } },
      ];
    }

    const safeLimit = Math.min(Math.max(limit ?? 10, 1), 100);
    const safePage = Math.max(page ?? 1, 1);

    const orderBy = [
      { [sortBy || 'createdAt']: (sortOrder || 'desc').toLowerCase() },
    ];

    const [data, total] = await Promise.all([
      this.repo.findMany({
        where,
        orderBy,
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      this.repo.count(where),
    ]);

    return {
      data: data.map((item) => this.toEntity(item)),
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }
}
