import { PostRepository } from '../repositories/post.repository';
import type { PostRow, PostWithAuthor } from '../repositories/post.repository';
import { NotFoundError, ForbiddenError, ValidationError } from '../lib/errors';

export class PostService {
  constructor(private postRepo: PostRepository) {}

  async findAll(params?: {
    limit?: number;
    cursor?: string;
  }): Promise<{ posts: PostWithAuthor[]; nextCursor: string | null }> {
    const limit = Math.min(params?.limit || 20, 50);
    let parsedCursor: { timestamp: string; id: number } | null = null;

    if (params?.cursor) {
      const parts = params.cursor.split('_');
      if (parts.length === 2) {
        parsedCursor = { timestamp: parts[0], id: parseInt(parts[1], 10) };
      }
    }

    const posts = await this.postRepo.findAllWithAuthor({
      limit: limit + 1,
      cursor: parsedCursor,
    });

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;

    let nextCursor: string | null = null;
    if (hasMore && items.length > 0) {
      const last = items[items.length - 1];
      nextCursor = `${last.created_at}_${last.id}`;
    }

    return { posts: items, nextCursor };
  }

  async findById(id: number): Promise<PostWithAuthor> {
    const post = await this.postRepo.findByIdWithAuthor(id);
    if (!post) {
      throw new NotFoundError('Post');
    }
    return post;
  }

  async findByUser(userId: number): Promise<PostRow[]> {
    return this.postRepo.findByUserId(userId);
  }

  async create(
    userId: number,
    data: { content: string; photo_url?: string | null },
  ): Promise<PostRow> {
    if (!data.content || data.content.trim().length === 0) {
      throw new ValidationError('El contenido es requerido');
    }
    return this.postRepo.create({
      user_id: userId,
      content: data.content.trim(),
      photo_url: data.photo_url || null,
    });
  }

  async update(
    userId: number,
    postId: number,
    data: Partial<{ content: string; photo_url: string | null }>,
  ): Promise<PostRow> {
    const post = await this.postRepo.findById(postId);
    if (!post) {
      throw new NotFoundError('Post');
    }
    if (post.user_id !== userId) {
      throw new ForbiddenError('No tienes permiso para editar este post');
    }
    const updated = await this.postRepo.update(postId, data);
    if (!updated) {
      throw new NotFoundError('Post');
    }
    return updated;
  }

  async delete(userId: number, postId: number): Promise<void> {
    const post = await this.postRepo.findById(postId);
    if (!post) {
      throw new NotFoundError('Post');
    }
    if (post.user_id !== userId) {
      throw new ForbiddenError('No tienes permiso para eliminar este post');
    }
    await this.postRepo.delete(postId);
  }
}
