import { ProductRepository } from '../repositories/product.repository';
import type { ProductRow, ProductWithDetails } from '../repositories/product.repository';
import { NotFoundError } from '../lib/errors';

export interface ProductListParams {
  causeId?: string;
  entrepreneurId?: string;
  leaderId?: string;
  limit?: number;
  offset?: number;
}

export class ProductService {
  constructor(private productRepo: ProductRepository) {}

  async findAll(params?: ProductListParams): Promise<ProductWithDetails[]> {
    return this.productRepo.findAllWithDetails({
      causeId: params?.causeId,
      entrepreneurId: params?.entrepreneurId,
      limit: params?.limit,
      offset: params?.offset,
    });
  }

  async findByLeader(leaderId: number): Promise<ProductWithDetails[]> {
    return this.productRepo.findByLeaderId(leaderId);
  }

  async findById(id: number): Promise<ProductRow> {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new NotFoundError('Product');
    }
    return product;
  }

  async create(data: Parameters<ProductRepository['create']>[0]): Promise<ProductRow> {
    return this.productRepo.create(data);
  }

  async update(id: number, data: Parameters<ProductRepository['update']>[1]): Promise<ProductRow> {
    const product = await this.productRepo.update(id, data);
    if (!product) {
      throw new NotFoundError('Product');
    }
    return product;
  }
}
