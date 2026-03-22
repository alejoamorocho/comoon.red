/**
 * Cause Updates API
 *
 * Leaders can post progress updates to their causes.
 * Updates can be of type: progress, milestone, gratitude, or closing
 * When is_closing is true, the associated cause is marked as completed.
 */

import { Hono } from 'hono';
import { requireAuth, requireRole } from '../lib/auth';
import { safeJsonParse } from '../lib/utils';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const causeUpdates = new Hono<{ Bindings: Bindings }>();

// List all cause updates with pagination
causeUpdates.get('/', async (c) => {
  try {
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 50);
    const offset = parseInt(c.req.query('offset') || '0', 10);
    const leaderId = c.req.query('leader_id');
    const causeId = c.req.query('cause_id');

    let query = `
            SELECT
                cu.*,
                l.name as leader_name, l.photo_url as leader_photo,
                l.city as leader_city, l.department as leader_department,
                ca.title as cause_title, ca.status as cause_status
            FROM cause_updates cu
            JOIN leaders l ON cu.leader_id = l.id
            JOIN causes ca ON cu.cause_id = ca.id
            WHERE 1=1
        `;
    const params: any[] = [];

    if (leaderId) {
      query += ` AND cu.leader_id = ?`;
      params.push(leaderId);
    }
    if (causeId) {
      query += ` AND cu.cause_id = ?`;
      params.push(causeId);
    }

    query += ` ORDER BY cu.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const { results } = await c.env.DB.prepare(query)
      .bind(...params)
      .all();

    const updatesWithDetails = (results || []).map((cu: any) => ({
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

    return c.json(updatesWithDetails);
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});

// Get single cause update by ID
causeUpdates.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const update = await c.env.DB.prepare(
      `
            SELECT
                cu.*,
                l.id as leader_id, l.name as leader_name, l.photo_url as leader_photo,
                l.bio as leader_bio, l.city as leader_city, l.department as leader_department,
                ca.id as cause_id, ca.title as cause_title, ca.description as cause_description,
                ca.target_goal, ca.current_amount, ca.status as cause_status
            FROM cause_updates cu
            JOIN leaders l ON cu.leader_id = l.id
            JOIN causes ca ON cu.cause_id = ca.id
            WHERE cu.id = ?
        `,
    )
      .bind(id)
      .first();

    if (!update) {
      return c.json({ error: 'Cause update not found' }, 404);
    }

    return c.json({
      id: update.id,
      title: update.title,
      content: update.content,
      photo_url: update.photo_url,
      photos: safeJsonParse(update.photos as string, null),
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
    });
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});

// Create new cause update (authenticated leaders only)
causeUpdates.post('/', requireAuth, requireRole('leader', 'admin'), async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const {
      cause_id,
      title,
      content,
      photo_url,
      photos,
      update_type,
      is_closing,
      amount_received,
    } = body;

    // Validate required fields
    if (!cause_id || !title || !content) {
      return c.json({ error: 'cause_id, title, and content are required' }, 400);
    }

    // Validate update_type
    const validTypes = ['progress', 'milestone', 'gratitude', 'closing'];
    if (update_type && !validTypes.includes(update_type)) {
      return c.json(
        { error: 'Invalid update_type. Must be one of: progress, milestone, gratitude, closing' },
        400,
      );
    }

    // Get leader profile for this user
    const leader = await c.env.DB.prepare(
      `
            SELECT l.id FROM leaders l
            JOIN users u ON l.user_id = u.id
            WHERE u.id = ?
        `,
    )
      .bind(user!.id)
      .first<{ id: number }>();

    if (!leader) {
      return c.json({ error: 'Leader profile not found' }, 404);
    }

    // Verify cause exists and belongs to this leader
    const cause = await c.env.DB.prepare(
      `
            SELECT id, status FROM causes WHERE id = ? AND leader_id = ?
        `,
    )
      .bind(cause_id, leader.id)
      .first<{ id: number; status: string }>();

    if (!cause) {
      return c.json({ error: 'Cause not found or does not belong to this leader' }, 404);
    }

    if (cause.status === 'completed') {
      return c.json({ error: 'Cannot update a completed cause' }, 400);
    }

    // Determine final update type and closing status
    const finalUpdateType = is_closing ? 'closing' : update_type || 'progress';
    const finalIsClosing = is_closing || finalUpdateType === 'closing';

    // Insert cause update
    const result = await c.env.DB.prepare(
      `
            INSERT INTO cause_updates (leader_id, cause_id, title, content, photo_url, photos, update_type, is_closing, amount_reported)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
    )
      .bind(
        leader.id,
        cause_id,
        title,
        content,
        photo_url || null,
        photos ? JSON.stringify(photos) : null,
        finalUpdateType,
        finalIsClosing ? 1 : 0,
        amount_received && amount_received > 0 ? amount_received : null,
      )
      .run();

    // If amount_received is provided, update the cause's current_amount
    if (amount_received && amount_received > 0) {
      await c.env.DB.prepare(
        `
                UPDATE causes SET current_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
            `,
      )
        .bind(amount_received, cause_id)
        .run();
    }

    // If closing the cause, update the cause status
    if (finalIsClosing) {
      await c.env.DB.prepare(
        `
                UPDATE causes SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?
            `,
      )
        .bind(cause_id)
        .run();
    }

    // Fetch the created update
    const newUpdate = await c.env.DB.prepare(
      `
            SELECT cu.*, ca.title as cause_title, ca.status as cause_status
            FROM cause_updates cu
            JOIN causes ca ON cu.cause_id = ca.id
            WHERE cu.id = ?
        `,
    )
      .bind(result.meta.last_row_id)
      .first();

    return c.json(
      {
        ...newUpdate,
        photos: safeJsonParse(newUpdate?.photos as string, null),
        is_closing: Boolean(newUpdate?.is_closing),
      },
      201,
    );
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});

// Update a cause update (authenticated leaders only, own updates)
causeUpdates.put('/:id', requireAuth, requireRole('leader', 'admin'), async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user');
    const body = await c.req.json();
    const { title, content, photo_url, photos, update_type } = body;

    // Get leader profile for this user
    const leader = await c.env.DB.prepare(
      `
            SELECT l.id FROM leaders l
            JOIN users u ON l.user_id = u.id
            WHERE u.id = ?
        `,
    )
      .bind(user!.id)
      .first<{ id: number }>();

    if (!leader) {
      return c.json({ error: 'Leader profile not found' }, 404);
    }

    // Check update exists and belongs to this leader (or user is admin)
    const existing = await c.env.DB.prepare(
      `
            SELECT * FROM cause_updates WHERE id = ?
        `,
    )
      .bind(id)
      .first();

    if (!existing) {
      return c.json({ error: 'Cause update not found' }, 404);
    }

    if (existing.leader_id !== leader.id && user!.role !== 'admin') {
      return c.json({ error: 'Unauthorized to edit this update' }, 403);
    }

    // Validate update_type if provided
    const validTypes = ['progress', 'milestone', 'gratitude', 'closing'];
    if (update_type && !validTypes.includes(update_type)) {
      return c.json({ error: 'Invalid update_type' }, 400);
    }

    // Update cause update
    await c.env.DB.prepare(
      `
            UPDATE cause_updates SET
                title = COALESCE(?, title),
                content = COALESCE(?, content),
                photo_url = COALESCE(?, photo_url),
                photos = COALESCE(?, photos),
                update_type = COALESCE(?, update_type)
            WHERE id = ?
        `,
    )
      .bind(
        title || null,
        content || null,
        photo_url || null,
        photos ? JSON.stringify(photos) : null,
        update_type || null,
        id,
      )
      .run();

    const updated = await c.env.DB.prepare('SELECT * FROM cause_updates WHERE id = ?')
      .bind(id)
      .first();

    return c.json({
      ...updated,
      photos: safeJsonParse(updated?.photos as string, null),
      is_closing: Boolean(updated?.is_closing),
    });
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});

// Delete cause update (authenticated leaders only, own updates)
causeUpdates.delete('/:id', requireAuth, requireRole('leader', 'admin'), async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user');

    // Get leader profile for this user
    const leader = await c.env.DB.prepare(
      `
            SELECT l.id FROM leaders l
            JOIN users u ON l.user_id = u.id
            WHERE u.id = ?
        `,
    )
      .bind(user!.id)
      .first<{ id: number }>();

    if (!leader) {
      return c.json({ error: 'Leader profile not found' }, 404);
    }

    const existing = await c.env.DB.prepare('SELECT * FROM cause_updates WHERE id = ?')
      .bind(id)
      .first();

    if (!existing) {
      return c.json({ error: 'Cause update not found' }, 404);
    }

    if (existing.leader_id !== leader.id && user!.role !== 'admin') {
      return c.json({ error: 'Unauthorized to delete this update' }, 403);
    }

    // If this was a closing update, reopen the cause
    if (existing.is_closing) {
      await c.env.DB.prepare(
        `
                UPDATE causes SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?
            `,
      )
        .bind(existing.cause_id)
        .run();
    }

    await c.env.DB.prepare('DELETE FROM cause_updates WHERE id = ?').bind(id).run();

    return c.json({ success: true, message: 'Cause update deleted' });
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});

export default causeUpdates;
