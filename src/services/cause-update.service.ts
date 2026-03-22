import { CauseUpdateRepository } from '../repositories/cause-update.repository';
import { CauseRepository } from '../repositories/cause.repository';
import { LeaderRepository } from '../repositories/leader.repository';
import type {
  CauseUpdateWithDetails,
  CauseUpdateWithFullDetails,
} from '../repositories/cause-update.repository';
import { safeJsonParse } from '../lib/utils';
import { NotFoundError, ForbiddenError, ValidationError } from '../lib/errors';

export interface CauseUpdateListParams {
  leaderId?: string;
  causeId?: string;
  limit?: number;
  offset?: number;
}

export interface CauseUpdateCreateData {
  cause_id: number;
  title: string;
  content: string;
  photo_url?: string | null;
  photos?: unknown;
  update_type?: string;
  is_closing?: boolean;
}

export interface CauseUpdateUpdateData {
  title?: string;
  content?: string;
  photo_url?: string | null;
  photos?: unknown;
  update_type?: string;
}

interface FormattedCauseUpdate {
  id: number;
  leader_id: number;
  cause_id: number;
  title: string;
  content: string;
  photo_url: string | null;
  photos: unknown;
  update_type: string;
  is_closing: boolean;
  created_at: string;
  leader: {
    id: number;
    name: string;
    photo_url: string | null;
    city?: string | null;
    department?: string | null;
    bio?: string | null;
  };
  cause: {
    id: number;
    title: string;
    status: string;
    description?: string | null;
    target_goal?: number | null;
    current_amount?: number;
  };
}

export class CauseUpdateService {
  constructor(
    private causeUpdateRepo: CauseUpdateRepository,
    private causeRepo: CauseRepository,
    private leaderRepo: LeaderRepository,
  ) {}

  async findAll(params?: CauseUpdateListParams): Promise<FormattedCauseUpdate[]> {
    const results = await this.causeUpdateRepo.findAllWithDetails({
      leaderId: params?.leaderId,
      causeId: params?.causeId,
      limit: params?.limit,
      offset: params?.offset,
    });

    return results.map((cu) => ({
      id: cu.id,
      leader_id: cu.leader_id,
      cause_id: cu.cause_id,
      title: cu.title,
      content: cu.content,
      photo_url: cu.photo_url,
      photos: safeJsonParse(cu.photos, null),
      update_type: cu.update_type,
      is_closing: Boolean(cu.is_closing),
      created_at: cu.created_at,
      leader: {
        id: cu.leader_id,
        name: cu.leader_name,
        photo_url: cu.leader_photo,
        city: cu.leader_city,
        department: cu.leader_department,
      },
      cause: {
        id: cu.cause_id,
        title: cu.cause_title,
        status: cu.cause_status,
      },
    }));
  }

  async findById(id: number): Promise<FormattedCauseUpdate> {
    const update = await this.causeUpdateRepo.findByIdWithDetails(id);
    if (!update) {
      throw new NotFoundError('Cause update');
    }

    return {
      id: update.id,
      leader_id: update.leader_id,
      cause_id: update.cause_id,
      title: update.title,
      content: update.content,
      photo_url: update.photo_url,
      photos: safeJsonParse(update.photos, null),
      update_type: update.update_type,
      is_closing: Boolean(update.is_closing),
      created_at: update.created_at,
      leader: {
        id: update.leader_id,
        name: update.leader_name,
        photo_url: update.leader_photo,
        bio: update.leader_bio,
        city: update.leader_city,
        department: update.leader_department,
      },
      cause: {
        id: update.cause_id,
        title: update.cause_title,
        description: update.cause_description,
        target_goal: update.target_goal,
        current_amount: update.current_amount,
        status: update.cause_status,
      },
    };
  }

  async create(userId: number, data: CauseUpdateCreateData): Promise<unknown> {
    if (!data.cause_id || !data.title || !data.content) {
      throw new ValidationError('cause_id, title, and content are required');
    }

    const validTypes = ['progress', 'milestone', 'gratitude', 'closing'];
    if (data.update_type && !validTypes.includes(data.update_type)) {
      throw new ValidationError(
        'Invalid update_type. Must be one of: progress, milestone, gratitude, closing',
      );
    }

    const leaderId = await this.leaderRepo.findLeaderIdByUserId(userId);
    if (!leaderId) {
      throw new NotFoundError('Leader profile');
    }

    const cause = await this.causeRepo.findByLeaderIdAndId(data.cause_id, leaderId);
    if (!cause) {
      throw new NotFoundError('Cause not found or does not belong to this leader');
    }

    if (cause.status === 'completed') {
      throw new ValidationError('Cannot update a completed cause');
    }

    const finalUpdateType = data.is_closing ? 'closing' : data.update_type || 'progress';
    const finalIsClosing = data.is_closing || finalUpdateType === 'closing';

    const created = await this.causeUpdateRepo.create({
      leader_id: leaderId,
      cause_id: data.cause_id,
      title: data.title,
      content: data.content,
      photo_url: data.photo_url,
      photos: data.photos,
      update_type: finalUpdateType,
      is_closing: finalIsClosing,
    });

    if (finalIsClosing) {
      await this.causeRepo.updateStatus(data.cause_id, 'completed');
    }

    const result = await this.causeUpdateRepo.findCreatedWithCauseTitle(created.id);
    return {
      ...result,
      photos: safeJsonParse(result?.photos as string, null),
      is_closing: Boolean(result?.is_closing),
    };
  }

  async update(
    userId: number,
    updateId: number,
    userRole: string,
    data: CauseUpdateUpdateData,
  ): Promise<unknown> {
    const leaderId = await this.leaderRepo.findLeaderIdByUserId(userId);
    if (!leaderId) {
      throw new NotFoundError('Leader profile');
    }

    const existing = await this.causeUpdateRepo.findById(updateId);
    if (!existing) {
      throw new NotFoundError('Cause update');
    }

    if (existing.leader_id !== leaderId && userRole !== 'admin') {
      throw new ForbiddenError('Unauthorized to edit this update');
    }

    const validTypes = ['progress', 'milestone', 'gratitude', 'closing'];
    if (data.update_type && !validTypes.includes(data.update_type)) {
      throw new ValidationError('Invalid update_type');
    }

    const updated = await this.causeUpdateRepo.update(updateId, {
      title: data.title,
      content: data.content,
      photo_url: data.photo_url,
      photos: data.photos,
      update_type: data.update_type,
    });

    return {
      ...updated,
      photos: safeJsonParse(updated?.photos as string, null),
      is_closing: Boolean(updated?.is_closing),
    };
  }

  async delete(userId: number, updateId: number, userRole: string): Promise<void> {
    const leaderId = await this.leaderRepo.findLeaderIdByUserId(userId);
    if (!leaderId) {
      throw new NotFoundError('Leader profile');
    }

    const existing = await this.causeUpdateRepo.findById(updateId);
    if (!existing) {
      throw new NotFoundError('Cause update');
    }

    if (existing.leader_id !== leaderId && userRole !== 'admin') {
      throw new ForbiddenError('Unauthorized to delete this update');
    }

    if (existing.is_closing) {
      await this.causeRepo.updateStatus(existing.cause_id, 'active');
    }

    await this.causeUpdateRepo.delete(updateId);
  }
}
