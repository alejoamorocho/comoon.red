import { CauseRepository } from '../repositories/cause.repository';
import { LeaderRepository } from '../repositories/leader.repository';
import type { CauseRow, CauseWithLeader } from '../repositories/cause.repository';
import { NotFoundError, ForbiddenError } from '../lib/errors';

export interface CauseListParams {
  status?: string;
  leaderId?: number;
  limit?: number;
  offset?: number;
}

export class CauseService {
  constructor(
    private causeRepo: CauseRepository,
    private leaderRepo: LeaderRepository,
  ) {}

  async findAll(params?: CauseListParams): Promise<CauseWithLeader[]> {
    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;
    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (params?.status) {
      conditions.push('c.status = ?');
      values.push(params.status);
    }
    if (params?.leaderId) {
      conditions.push('c.leader_id = ?');
      values.push(params.leaderId);
    }

    // We use the repo's db directly for this filtered query
    return this.causeRepo.findAllFiltered({ conditions, values, limit, offset });
  }

  async findById(id: number): Promise<CauseWithLeader> {
    const cause = await this.causeRepo.findByIdWithLeader(id);
    if (!cause) {
      throw new NotFoundError('Cause');
    }
    return cause;
  }

  async create(
    userId: number,
    data: {
      title: string;
      description?: string | null;
      target_goal?: number | null;
      photo_url?: string | null;
      evidence_photos?: unknown;
      location?: string | null;
      beneficiary_count?: number | null;
      start_date?: string | null;
      end_date?: string | null;
      category?: string | null;
      needs?: unknown;
      fund_usage?: string | null;
      impact_metrics?: unknown;
    },
  ): Promise<CauseRow> {
    const leaderId = await this.leaderRepo.findLeaderIdByUserId(userId);
    if (!leaderId) {
      throw new NotFoundError('Leader profile');
    }

    return this.causeRepo.create({
      leader_id: leaderId,
      title: data.title,
      description: data.description,
      target_goal: data.target_goal,
      photo_url: data.photo_url,
      evidence_photos: data.evidence_photos,
      status: 'active',
      location: data.location,
      beneficiary_count: data.beneficiary_count,
      start_date: data.start_date,
      end_date: data.end_date,
      category: data.category,
      needs: data.needs,
      fund_usage: data.fund_usage,
      impact_metrics: data.impact_metrics,
    });
  }

  async archive(userId: number, causeId: number): Promise<CauseRow> {
    const leaderId = await this.leaderRepo.findLeaderIdByUserId(userId);
    if (!leaderId) throw new NotFoundError('Leader profile');
    const cause = await this.causeRepo.findByLeaderIdAndId(causeId, leaderId);
    if (!cause) throw new ForbiddenError('No tienes permiso para archivar esta causa');
    await this.causeRepo.updateStatus(causeId, 'archived');
    const updated = await this.causeRepo.findById(causeId);
    if (!updated) throw new NotFoundError('Cause');
    return updated;
  }

  async update(
    userId: number,
    causeId: number,
    data: Partial<{
      title: string;
      description: string | null;
      target_goal: number | null;
      photo_url: string | null;
      evidence_photos: unknown;
      location: string | null;
      beneficiary_count: number | null;
      start_date: string | null;
      end_date: string | null;
      category: string | null;
      needs: unknown;
      fund_usage: string | null;
      impact_metrics: unknown;
    }>,
  ): Promise<CauseRow> {
    const leaderId = await this.leaderRepo.findLeaderIdByUserId(userId);
    if (!leaderId) {
      throw new NotFoundError('Leader profile');
    }

    const cause = await this.causeRepo.findByLeaderIdAndId(causeId, leaderId);
    if (!cause) {
      throw new ForbiddenError('No tienes permiso para editar esta causa');
    }

    const updated = await this.causeRepo.update(causeId, data);
    if (!updated) {
      throw new NotFoundError('Cause');
    }
    return updated;
  }
}
