/**
 * Cause Objectives API
 *
 * CRUD endpoints for cause objectives (progress tracking).
 * Leaders can create objectives for their causes and update progress.
 */

import { Hono } from 'hono';
import { requireAuth, requireRole } from '../lib/auth';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const causeObjectives = new Hono<{ Bindings: Bindings }>();

/**
 * Helper: get leader profile from authenticated user
 */
async function getLeaderFromUser(db: D1Database, userId: number) {
  return db
    .prepare('SELECT l.id FROM leaders l JOIN users u ON l.user_id = u.id WHERE u.id = ?')
    .bind(userId)
    .first<{ id: number }>();
}

/**
 * Helper: verify cause exists and belongs to leader
 */
async function verifyCauseOwnership(db: D1Database, causeId: number, leaderId: number) {
  return db
    .prepare('SELECT id FROM causes WHERE id = ? AND leader_id = ?')
    .bind(causeId, leaderId)
    .first<{ id: number }>();
}

// GET /api/causes/:causeId/objectives - List objectives for a cause
causeObjectives.get('/:causeId/objectives', async (c) => {
  try {
    const causeId = parseInt(c.req.param('causeId'), 10);

    // Verify cause exists
    const cause = await c.env.DB.prepare('SELECT id FROM causes WHERE id = ?')
      .bind(causeId)
      .first();

    if (!cause) {
      return c.json({ error: 'Cause not found' }, 404);
    }

    const { results } = await c.env.DB.prepare(
      'SELECT * FROM cause_objectives WHERE cause_id = ? ORDER BY sort_order ASC, created_at ASC',
    )
      .bind(causeId)
      .all();

    return c.json(
      (results || []).map((obj: any) => ({
        ...obj,
        is_completed: Boolean(obj.is_completed),
      })),
    );
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});

// POST /api/causes/:causeId/objectives - Create objective (auth required, cause owner)
causeObjectives.post(
  '/:causeId/objectives',
  requireAuth,
  requireRole('leader', 'admin'),
  async (c) => {
    try {
      const user = c.get('user');
      const causeId = parseInt(c.req.param('causeId'), 10);
      const body = await c.req.json<{
        title: string;
        description?: string;
        target_value?: number;
        unit?: string;
        sort_order?: number;
      }>();

      if (!body.title) {
        return c.json({ error: 'El titulo es requerido' }, 400);
      }

      const leader = await getLeaderFromUser(c.env.DB, user!.id);
      if (!leader) {
        return c.json({ error: 'Leader profile not found' }, 404);
      }

      const cause = await verifyCauseOwnership(c.env.DB, causeId, leader.id);
      if (!cause) {
        return c.json({ error: 'Cause not found or does not belong to this leader' }, 404);
      }

      const result = await c.env.DB.prepare(
        `INSERT INTO cause_objectives (cause_id, title, description, target_value, unit, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          causeId,
          body.title,
          body.description || null,
          body.target_value ?? null,
          body.unit || '',
          body.sort_order ?? 0,
        )
        .run();

      const newObjective = await c.env.DB.prepare('SELECT * FROM cause_objectives WHERE id = ?')
        .bind(result.meta.last_row_id)
        .first();

      return c.json(
        {
          ...newObjective,
          is_completed: Boolean(newObjective?.is_completed),
        },
        201,
      );
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
    }
  },
);

// PUT /api/causes/:causeId/objectives/:id - Update objective progress
causeObjectives.put(
  '/:causeId/objectives/:id',
  requireAuth,
  requireRole('leader', 'admin'),
  async (c) => {
    try {
      const user = c.get('user');
      const causeId = parseInt(c.req.param('causeId'), 10);
      const objectiveId = parseInt(c.req.param('id'), 10);
      const body = await c.req.json<{
        title?: string;
        description?: string;
        target_value?: number;
        current_value?: number;
        unit?: string;
        is_completed?: boolean;
        sort_order?: number;
      }>();

      const leader = await getLeaderFromUser(c.env.DB, user!.id);
      if (!leader) {
        return c.json({ error: 'Leader profile not found' }, 404);
      }

      // Admins bypass ownership check
      if (user!.role !== 'admin') {
        const cause = await verifyCauseOwnership(c.env.DB, causeId, leader.id);
        if (!cause) {
          return c.json({ error: 'Cause not found or does not belong to this leader' }, 404);
        }
      }

      // Check objective exists and belongs to this cause
      const existing = await c.env.DB.prepare(
        'SELECT * FROM cause_objectives WHERE id = ? AND cause_id = ?',
      )
        .bind(objectiveId, causeId)
        .first();

      if (!existing) {
        return c.json({ error: 'Objective not found' }, 404);
      }

      await c.env.DB.prepare(
        `UPDATE cause_objectives SET
            title = COALESCE(?, title),
            description = COALESCE(?, description),
            target_value = COALESCE(?, target_value),
            current_value = COALESCE(?, current_value),
            unit = COALESCE(?, unit),
            is_completed = COALESCE(?, is_completed),
            sort_order = COALESCE(?, sort_order)
         WHERE id = ?`,
      )
        .bind(
          body.title || null,
          body.description !== undefined ? body.description : null,
          body.target_value ?? null,
          body.current_value ?? null,
          body.unit !== undefined ? body.unit : null,
          body.is_completed !== undefined ? (body.is_completed ? 1 : 0) : null,
          body.sort_order ?? null,
          objectiveId,
        )
        .run();

      const updated = await c.env.DB.prepare('SELECT * FROM cause_objectives WHERE id = ?')
        .bind(objectiveId)
        .first();

      return c.json({
        ...updated,
        is_completed: Boolean(updated?.is_completed),
      });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
    }
  },
);

// DELETE /api/causes/:causeId/objectives/:id - Delete objective
causeObjectives.delete(
  '/:causeId/objectives/:id',
  requireAuth,
  requireRole('leader', 'admin'),
  async (c) => {
    try {
      const user = c.get('user');
      const causeId = parseInt(c.req.param('causeId'), 10);
      const objectiveId = parseInt(c.req.param('id'), 10);

      const leader = await getLeaderFromUser(c.env.DB, user!.id);
      if (!leader) {
        return c.json({ error: 'Leader profile not found' }, 404);
      }

      // Admins bypass ownership check
      if (user!.role !== 'admin') {
        const cause = await verifyCauseOwnership(c.env.DB, causeId, leader.id);
        if (!cause) {
          return c.json({ error: 'Cause not found or does not belong to this leader' }, 404);
        }
      }

      const existing = await c.env.DB.prepare(
        'SELECT id FROM cause_objectives WHERE id = ? AND cause_id = ?',
      )
        .bind(objectiveId, causeId)
        .first();

      if (!existing) {
        return c.json({ error: 'Objective not found' }, 404);
      }

      await c.env.DB.prepare('DELETE FROM cause_objectives WHERE id = ?').bind(objectiveId).run();

      return c.json({ success: true, message: 'Objective deleted' });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
    }
  },
);

export default causeObjectives;
