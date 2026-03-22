import { Hono } from 'hono';
import type { Services } from '../lib/di';
import { requireAuth } from '../lib/auth';
import { success } from '../lib/middleware/response-envelope';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

type Variables = {
  services: Services;
};

const entrepreneurs = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// GET /api/entrepreneurs - List entrepreneurs
entrepreneurs.get('/', async (c) => {
  const services = c.get('services');
  const department = c.req.query('department');
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!, 10) : undefined;
  const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!, 10) : undefined;

  const results = await services.entrepreneur.findAll({
    department: department || undefined,
    limit,
    offset,
  });
  return c.json(success(results));
});

// GET /api/entrepreneurs/:id - Entrepreneur detail
entrepreneurs.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const services = c.get('services');
  const entrepreneur = await services.entrepreneur.findById(id);
  return c.json(success(entrepreneur));
});

// PUT /api/entrepreneurs/:id - Update own profile
entrepreneurs.put('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const id = parseInt(c.req.param('id'), 10);

  // Verify ownership: profileId must match or user is admin
  if (user!.role !== 'admin' && user!.profileId !== id) {
    return c.json({ error: 'No tienes permiso para editar este perfil' }, 403);
  }

  const body = await c.req.json<{
    store_name?: string;
    bio?: string;
    city?: string;
    department?: string;
    photo_url?: string;
    contact_info?: Record<string, string>;
  }>();

  const services = c.get('services');
  const entrepreneur = await services.entrepreneur.update(id, {
    store_name: body.store_name,
    bio: body.bio,
    city: body.city,
    department: body.department,
    photo_url: body.photo_url,
    contact_info: body.contact_info,
  });

  return c.json(success(entrepreneur));
});

export default entrepreneurs;
