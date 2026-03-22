import type { D1Database } from '@cloudflare/workers-types';
import { BaseRepository } from './base.repository';

export interface TransactionRow {
  id: number;
  product_id: number;
  cause_id: number;
  amount: number;
  customer_name: string | null;
  customer_contact: string | null;
  status: string;
  created_at: string;
}

export class TransactionRepository extends BaseRepository<TransactionRow> {
  constructor(db: D1Database) {
    super(db, 'transactions');
  }

  async findByProductId(
    productId: number,
    options?: { limit?: number; offset?: number },
  ): Promise<TransactionRow[]> {
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;
    const { results } = await this.db
      .prepare(
        'SELECT * FROM transactions WHERE product_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      )
      .bind(productId, limit, offset)
      .all<TransactionRow>();
    return results || [];
  }

  async findByCauseId(
    causeId: number,
    options?: { limit?: number; offset?: number },
  ): Promise<TransactionRow[]> {
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;
    const { results } = await this.db
      .prepare(
        'SELECT * FROM transactions WHERE cause_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      )
      .bind(causeId, limit, offset)
      .all<TransactionRow>();
    return results || [];
  }

  async create(data: {
    product_id: number;
    cause_id: number;
    amount: number;
    customer_name?: string | null;
    customer_contact?: string | null;
  }): Promise<TransactionRow> {
    const result = await this.db
      .prepare(
        `INSERT INTO transactions (product_id, cause_id, amount, customer_name, customer_contact)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(
        data.product_id,
        data.cause_id,
        data.amount,
        data.customer_name || null,
        data.customer_contact || null,
      )
      .run();

    const id = result.meta.last_row_id as number;
    return (await this.findById(id))!;
  }

  async update(id: number, data: Partial<{ status: string }>): Promise<TransactionRow | null> {
    if (data.status) {
      await this.db
        .prepare('UPDATE transactions SET status = ? WHERE id = ?')
        .bind(data.status, id)
        .run();
    }
    return this.findById(id);
  }

  async updateStatus(id: number, status: string): Promise<void> {
    await this.db.prepare('UPDATE transactions SET status = ? WHERE id = ?').bind(status, id).run();
  }
}
