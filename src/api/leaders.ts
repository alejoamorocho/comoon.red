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

const leaders = new Hono<{ Bindings: Bindings; Variables: Variables }>();

leaders.get('/', async (c) => {
  const services = c.get('services');
  const department = c.req.query('department');
  const tag = c.req.query('tag');
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!, 10) : undefined;
  const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!, 10) : undefined;

  const results = await services.leader.findAll({ department, tag, limit, offset });
  return c.json(success(results));
});

leaders.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const services = c.get('services');

  const leader = await services.leader.findById(id);
  return c.json(success(leader));
});

// PUT /api/leaders/:id - Update own profile
leaders.put('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const id = parseInt(c.req.param('id'), 10);

  // Verify ownership: profileId must match or user is admin
  if (user!.role !== 'admin' && user!.profileId !== id) {
    return c.json({ error: 'No tienes permiso para editar este perfil' }, 403);
  }

  const body = await c.req.json<{
    name?: string;
    bio?: string;
    city?: string;
    department?: string;
    photo_url?: string;
    contact_info?: Record<string, string>;
    social_links?: Record<string, string>;
    tags?: string[];
    cover_url?: string;
    organization_name?: string;
    who_we_are?: string;
    our_why?: string;
    how_to_help?: string;
    years_active?: number;
    impact_scope?: string;
    community?: string;
    areas_of_influence?: string[];
    people_impacted?: number;
    achievements?: unknown;
    testimonials?: unknown;
    media_gallery?: unknown;
    awards?: unknown;
    email?: string;
    preferred_contact?: string;
  }>();

  const services = c.get('services');
  const leader = await services.leader.update(id, {
    name: body.name,
    bio: body.bio,
    city: body.city,
    department: body.department,
    photo_url: body.photo_url,
    contact_info: body.contact_info,
    social_links: body.social_links,
    tags: body.tags,
    cover_url: body.cover_url,
    organization_name: body.organization_name,
    who_we_are: body.who_we_are,
    our_why: body.our_why,
    how_to_help: body.how_to_help,
    years_active: body.years_active,
    impact_scope: body.impact_scope,
    community: body.community,
    areas_of_influence: body.areas_of_influence,
    people_impacted: body.people_impacted,
    achievements: body.achievements,
    testimonials: body.testimonials,
    media_gallery: body.media_gallery,
    awards: body.awards,
    email: body.email,
    preferred_contact: body.preferred_contact,
  });

  return c.json(success(leader));
});

export default leaders;
