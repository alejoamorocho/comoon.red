import { EntrepreneurRepository } from '../repositories/entrepreneur.repository';
import type { EntrepreneurRow } from '../repositories/entrepreneur.repository';
import { NotFoundError } from '../lib/errors';

export interface EntrepreneurListParams {
  limit?: number;
  offset?: number;
  department?: string;
}

export class EntrepreneurService {
  constructor(private entrepreneurRepo: EntrepreneurRepository) {}

  async findAll(params?: EntrepreneurListParams): Promise<EntrepreneurRow[]> {
    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;
    const { results } = await this.entrepreneurRepo.findAllFiltered({
      limit,
      offset,
      department: params?.department,
    });
    return results;
  }

  async findById(id: number): Promise<EntrepreneurRow> {
    const entrepreneur = await this.entrepreneurRepo.findById(id);
    if (!entrepreneur) {
      throw new NotFoundError('Entrepreneur');
    }
    return entrepreneur;
  }

  async findByUserId(userId: number): Promise<EntrepreneurRow> {
    const entrepreneur = await this.entrepreneurRepo.findByUserId(userId);
    if (!entrepreneur) {
      throw new NotFoundError('Entrepreneur');
    }
    return entrepreneur;
  }

  async update(
    id: number,
    data: Parameters<EntrepreneurRepository['update']>[1],
  ): Promise<EntrepreneurRow> {
    const entrepreneur = await this.entrepreneurRepo.update(id, data);
    if (!entrepreneur) {
      throw new NotFoundError('Entrepreneur');
    }
    return entrepreneur;
  }
}
