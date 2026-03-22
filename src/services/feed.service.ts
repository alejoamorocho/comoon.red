import { FeedRepository } from '../repositories/feed.repository';
import type {
  FeedQueryOptions,
  FeedProductRow,
  FeedCauseRow,
  FeedCauseUpdateRow,
  FeedPostRow,
} from '../repositories/feed.repository';
import { safeJsonParse } from '../lib/utils';

export interface FeedParams {
  cursor?: string;
  limit?: string;
  types?: string;
  department?: string;
  city?: string;
  categories?: string;
}

export interface FeedItem {
  id: number;
  type: string;
  created_at: string;
  [key: string]: unknown;
}

export interface FeedResult {
  items: FeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

function parseCursor(cursor: string | undefined): { timestamp: string; id: number } | null {
  if (!cursor) return null;
  const parts = cursor.split('_');
  if (parts.length !== 2) return null;
  return {
    timestamp: parts[0],
    id: parseInt(parts[1], 10),
  };
}

function createCursor(timestamp: string, id: number): string {
  return `${timestamp}_${id}`;
}

function mapProduct(p: FeedProductRow): FeedItem {
  return {
    id: p.id,
    type: 'product',
    created_at: p.created_at,
    name: p.name,
    description: p.description,
    price: p.price,
    photo_url: p.photo_url,
    contribution_text: p.contribution_text,
    contribution_amount: p.contribution_amount,
    contribution_type: p.contribution_type,
    entrepreneur: p.entrepreneur_id
      ? {
          id: p.entrepreneur_id,
          store_name: p.store_name || '',
          photo_url: p.entrepreneur_photo,
          city: p.entrepreneur_city,
          department: p.entrepreneur_department,
        }
      : null,
    seller: {
      name: p.seller_name,
      photo_url: p.seller_photo,
      city: p.seller_city,
      department: p.seller_department,
      type: p.seller_type as 'leader' | 'entrepreneur',
    },
    cause: { id: p.cause_id, title: p.cause_title },
    leader: { id: p.leader_id, name: p.leader_name },
  };
}

function mapPost(p: FeedPostRow): FeedItem {
  return {
    id: p.id,
    type: 'post',
    created_at: p.created_at,
    content: p.content,
    photo_url: p.photo_url,
    author: {
      user_id: p.user_id,
      name: p.author_name,
      photo_url: p.author_photo,
      role: p.author_role,
      city: p.author_city,
      department: p.author_department,
    },
  };
}

function mapCause(c: FeedCauseRow): FeedItem {
  return {
    id: c.id,
    type: 'cause',
    created_at: c.created_at,
    title: c.title,
    description: c.description,
    photo_url: c.photo_url,
    target_goal: c.target_goal,
    current_amount: c.current_amount,
    status: c.status,
    leader: {
      id: c.leader_id,
      name: c.leader_name,
      photo_url: c.leader_photo,
      city: c.leader_city,
      department: c.leader_department,
      tags: safeJsonParse(c.leader_tags, null),
    },
  };
}

function mapCauseUpdate(cu: FeedCauseUpdateRow): FeedItem {
  return {
    id: cu.id,
    type: 'cause_update',
    created_at: cu.created_at,
    title: cu.title,
    content: cu.content,
    photo_url: cu.photo_url,
    photos: safeJsonParse(cu.photos, null),
    update_type: cu.update_type,
    is_closing: Boolean(cu.is_closing),
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
  };
}

export class FeedService {
  constructor(private feedRepo: FeedRepository) {}

  async getFeed(params: FeedParams): Promise<FeedResult> {
    const limit = Math.min(parseInt(params.limit || '20', 10), 50);
    const types = params.types?.split(',').filter(Boolean) || [
      'product',
      'cause',
      'cause_update',
      'post',
    ];
    const categories = params.categories?.split(',').filter(Boolean);
    const parsedCursor = parseCursor(params.cursor);

    const queryOptions: FeedQueryOptions = {
      cursor: parsedCursor,
      limit,
      types,
      department: params.department,
      city: params.city,
      categories,
    };

    const items: FeedItem[] = [];

    if (types.includes('product')) {
      const products = await this.feedRepo.fetchProducts(queryOptions);
      items.push(...products.map(mapProduct));
    }

    if (types.includes('cause')) {
      const causes = await this.feedRepo.fetchCauses(queryOptions);
      items.push(...causes.map(mapCause));
    }

    if (types.includes('cause_update')) {
      const updates = await this.feedRepo.fetchCauseUpdates(queryOptions);
      items.push(...updates.map(mapCauseUpdate));
    }

    if (types.includes('post')) {
      const posts = await this.feedRepo.fetchPosts(queryOptions);
      items.push(...posts.map(mapPost));
    }

    // Sort all items by created_at DESC, then by id DESC
    items.sort((a, b) => {
      const dateCompare = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (dateCompare !== 0) return dateCompare;
      return b.id - a.id;
    });

    const limitedItems = items.slice(0, limit);
    const hasMore = items.length > limit;

    let nextCursor: string | null = null;
    if (hasMore && limitedItems.length > 0) {
      const lastItem = limitedItems[limitedItems.length - 1];
      nextCursor = createCursor(lastItem.created_at, lastItem.id);
    }

    return { items: limitedItems, nextCursor, hasMore };
  }

  async getDepartments(): Promise<string[]> {
    return this.feedRepo.getDistinctDepartments();
  }
}
