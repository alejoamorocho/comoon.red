import { LeaderRepository } from '../repositories/leader.repository';
import type {
  LeaderRow,
  LeaderWithCause,
  LeaderWithCauses,
} from '../repositories/leader.repository';
import { NotFoundError } from '../lib/errors';

export interface LeaderListParams {
  limit?: number;
  offset?: number;
  department?: string;
  tag?: string;
}

export class LeaderService {
  constructor(private leaderRepo: LeaderRepository) {}

  async findAll(params?: LeaderListParams): Promise<LeaderWithCause[]> {
    return this.leaderRepo.findAllWithActiveCause({
      limit: params?.limit,
      offset: params?.offset,
      department: params?.department,
      tag: params?.tag,
    });
  }

  async findById(id: number): Promise<LeaderWithCauses> {
    const leader = await this.leaderRepo.findByIdWithCauses(id);
    if (!leader) {
      throw new NotFoundError('Leader');
    }
    return leader;
  }

  async findByUserId(userId: number): Promise<LeaderRow> {
    const leader = await this.leaderRepo.findByUserId(userId);
    if (!leader) {
      throw new NotFoundError('Leader');
    }
    return leader;
  }

  async create(data: Parameters<LeaderRepository['create']>[0]): Promise<LeaderRow> {
    return this.leaderRepo.create(data);
  }

  async update(id: number, data: Parameters<LeaderRepository['update']>[1]): Promise<LeaderRow> {
    const leader = await this.leaderRepo.update(id, data);
    if (!leader) {
      throw new NotFoundError('Leader');
    }
    return leader;
  }
}
