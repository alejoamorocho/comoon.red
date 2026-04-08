/**
 * Cause Shares API
 *
 * Tracks share counts for causes (no auth required).
 */

import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const causeShares = new Hono<{ Bindings: Bindings }>();

// POST /api/causes/:causeId/share - Increment share count
causeShares.post('/:causeId/share', async (c) => {
  try {
    const causeId = parseInt(c.req.param('causeId'), 10);

    const cause = await c.env.DB.prepare('SELECT id FROM causes WHERE id = ?')
      .bind(causeId)
      .first();

    if (!cause) {
      return c.json({ error: 'Cause not found' }, 404);
    }

    await c.env.DB.prepare(
      'UPDATE causes SET share_count = COALESCE(share_count, 0) + 1 WHERE id = ?',
    )
      .bind(causeId)
      .run();

    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});

export default causeShares;
