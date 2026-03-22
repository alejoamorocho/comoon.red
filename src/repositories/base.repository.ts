import type { D1Database } from '@cloudflare/workers-types';

export interface IRepository<T> {
  findById(id: number): Promise<T | null>;
  findAll(options?: { limit?: number; offset?: number }): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T | null>;
  delete(id: number): Promise<boolean>;
}

export abstract class BaseRepository<T> {
  constructor(
    protected db: D1Database,
    protected tableName: string,
  ) {}

  async findById(id: number): Promise<T | null> {
    const result = await this.db
      .prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`)
      .bind(id)
      .first<T>();
    return result;
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<T[]> {
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;
    const { results } = await this.db
      .prepare(`SELECT * FROM ${this.tableName} LIMIT ? OFFSET ?`)
      .bind(limit, offset)
      .all<T>();
    return results || [];
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .prepare(`DELETE FROM ${this.tableName} WHERE id = ?`)
      .bind(id)
      .run();
    return result.meta.changes > 0;
  }
}
