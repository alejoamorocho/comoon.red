import { Hono } from 'hono';
import type { Services } from '../lib/di';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

type Variables = {
  services: Services;
};

const feed = new Hono<{ Bindings: Bindings; Variables: Variables }>();

feed.get('/', async (c) => {
  try {
    const services = c.get('services');
    const result = await services.feed.getFeed({
      cursor: c.req.query('cursor'),
      limit: c.req.query('limit'),
      types: c.req.query('types'),
      department: c.req.query('department'),
      city: c.req.query('city'),
      categories: c.req.query('categories'),
    });

    return c.json(result);
  } catch (e) {
    console.error('Feed error:', e);
    return c.json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});

// Get available departments for filter dropdown
feed.get('/departments', async (c) => {
  try {
    const services = c.get('services');
    const departments = await services.feed.getDepartments();
    return c.json(departments);
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});

export default feed;
