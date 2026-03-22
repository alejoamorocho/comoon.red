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

const products = new Hono<{ Bindings: Bindings; Variables: Variables }>();

products.get('/', async (c) => {
  const services = c.get('services');
  const causeId = c.req.query('cause_id');
  const entrepreneurId = c.req.query('entrepreneur_id');

  const results = await services.product.findAll({
    causeId: causeId || undefined,
    entrepreneurId: entrepreneurId || undefined,
  });
  return c.json(success(results));
});

// POST /api/products - Create product (entrepreneur or leader)
products.post('/', requireAuth, requireRole('entrepreneur', 'leader', 'admin'), async (c) => {
  const user = c.get('user');

  const body = await c.req.json<{
    cause_id: number;
    name: string;
    description?: string;
    price: number;
    contribution_text?: string;
    contribution_amount?: number;
    contribution_type?: string;
    photo_url?: string;
    gallery_photos?: string[];
    category?: string;
    availability?: string;
  }>();

  if (!body.name || !body.cause_id || !body.price) {
    return c.json({ error: 'Nombre, causa y precio son requeridos' }, 400);
  }

  if (!user!.profileId) {
    return c.json({ error: 'Perfil no encontrado' }, 400);
  }

  const services = c.get('services');
  const isLeader = user!.role === 'leader';

  const product = await services.product.create({
    entrepreneur_id: isLeader ? null : user!.profileId,
    leader_id: isLeader ? user!.profileId : null,
    cause_id: body.cause_id,
    name: body.name,
    description: body.description || null,
    price: body.price,
    contribution_text: body.contribution_text || null,
    contribution_amount: body.contribution_amount || null,
    contribution_type: body.contribution_type || 'percentage',
    photo_url: body.photo_url || null,
    gallery_photos: body.gallery_photos,
    category: body.category || null,
    availability: body.availability || 'available',
  });

  return c.json(success(product), 201);
});

// PUT /api/products/:id - Update own product
products.put('/:id', requireAuth, requireRole('entrepreneur', 'leader', 'admin'), async (c) => {
  const user = c.get('user');
  const productId = parseInt(c.req.param('id'), 10);

  const services = c.get('services');

  // Verify ownership
  const existing = await services.product.findById(productId);
  const isOwner =
    user!.role === 'leader'
      ? existing.leader_id === user!.profileId
      : existing.entrepreneur_id === user!.profileId;
  if (user!.role !== 'admin' && !isOwner) {
    return c.json({ error: 'No tienes permiso para editar este producto' }, 403);
  }

  const body = await c.req.json<{
    name?: string;
    description?: string;
    price?: number;
    contribution_text?: string;
    contribution_amount?: number;
    contribution_type?: string;
    photo_url?: string;
    is_active?: boolean;
    gallery_photos?: string[];
    category?: string;
    availability?: string;
  }>();

  const product = await services.product.update(productId, body);
  return c.json(success(product));
});

// DELETE /api/products/:id - Deactivate own product
products.delete('/:id', requireAuth, requireRole('entrepreneur', 'leader', 'admin'), async (c) => {
  const user = c.get('user');
  const productId = parseInt(c.req.param('id'), 10);
  const services = c.get('services');

  // Verify ownership
  const existing = await services.product.findById(productId);
  const isOwner =
    user!.role === 'leader'
      ? existing.leader_id === user!.profileId
      : existing.entrepreneur_id === user!.profileId;
  if (user!.role !== 'admin' && !isOwner) {
    return c.json({ error: 'No tienes permiso para eliminar este producto' }, 403);
  }

  const product = await services.product.update(productId, { is_active: false });
  return c.json(success(product));
});

export default products;
