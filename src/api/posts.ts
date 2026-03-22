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

const posts = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// GET /api/posts - Public, list with pagination
posts.get('/', async (c) => {
  const services = c.get('services');
  const cursor = c.req.query('cursor');
  const limit = c.req.query('limit');

  const result = await services.post.findAll({
    cursor: cursor || undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  return c.json(success(result));
});

// GET /api/posts/:id - Public
posts.get('/:id', async (c) => {
  const services = c.get('services');
  const id = parseInt(c.req.param('id'), 10);

  const post = await services.post.findById(id);
  return c.json(success(post));
});

// POST /api/posts - Requires auth (leader or entrepreneur)
posts.post('/', requireAuth, requireRole('leader', 'entrepreneur', 'admin'), async (c) => {
  const user = c.get('user');
  const services = c.get('services');

  const body = await c.req.json<{
    content: string;
    photo_url?: string;
  }>();

  const post = await services.post.create(user!.id, {
    content: body.content,
    photo_url: body.photo_url || null,
  });

  return c.json(success(post), 201);
});

// PUT /api/posts/:id - Requires auth + ownership
posts.put('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const services = c.get('services');
  const id = parseInt(c.req.param('id'), 10);

  const body = await c.req.json<{
    content?: string;
    photo_url?: string | null;
  }>();

  const post = await services.post.update(user!.id, id, body);
  return c.json(success(post));
});

// DELETE /api/posts/:id - Requires auth + ownership
posts.delete('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const services = c.get('services');
  const id = parseInt(c.req.param('id'), 10);

  await services.post.delete(user!.id, id);
  return c.json(success({ deleted: true }));
});

export default posts;
