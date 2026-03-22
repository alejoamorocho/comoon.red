import { Hono } from 'hono';
import type { Services } from '../lib/di';
import { requireAuth, requireRole } from '../lib/auth';
import { success } from '../lib/middleware/response-envelope';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

type Variables = {
  services: Services;
};

const causes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// GET /api/causes - List causes (optionally filtered)
causes.get('/', async (c) => {
  const services = c.get('services');
  const status = c.req.query('status');
  const leaderId = c.req.query('leader_id');
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!, 10) : undefined;
  const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!, 10) : undefined;

  const results = await services.cause.findAll({
    status: status || undefined,
    leaderId: leaderId ? parseInt(leaderId, 10) : undefined,
    limit,
    offset,
  });
  return c.json(success(results));
});

// GET /api/causes/:id - Cause detail
causes.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const services = c.get('services');
  const cause = await services.cause.findById(id);
  return c.json(success(cause));
});

// POST /api/causes - Create cause (leader only)
causes.post('/', requireAuth, requireRole('leader', 'admin'), async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{
    title: string;
    description?: string;
    target_goal?: number;
    photo_url?: string;
  }>();

  if (!body.title) {
    return c.json({ error: 'El titulo es requerido' }, 400);
  }

  const services = c.get('services');
  const cause = await services.cause.create(user!.id, {
    title: body.title,
    description: body.description || null,
    target_goal: body.target_goal || null,
    photo_url: body.photo_url || null,
  });

  return c.json(success(cause), 201);
});

// PUT /api/causes/:id - Update own cause
causes.put('/:id', requireAuth, requireRole('leader', 'admin'), async (c) => {
  const user = c.get('user');
  const causeId = parseInt(c.req.param('id'), 10);
  const body = await c.req.json<{
    title?: string;
    description?: string;
    target_goal?: number;
    photo_url?: string;
  }>();

  const services = c.get('services');
  const cause = await services.cause.update(user!.id, causeId, body);
  return c.json(success(cause));
});

export default causes;
