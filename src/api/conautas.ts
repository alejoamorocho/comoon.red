import { Hono } from 'hono';

type Bindings = {
    DB: D1Database;
};

const conautas = new Hono<{ Bindings: Bindings }>();

conautas.get('/', async (c) => {
    try {
        const { results } = await c.env.DB.prepare(
            `SELECT * FROM conautas LIMIT 50`
        ).all();

        return c.json(results);
    } catch (e) {
        return c.json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
    }
});

conautas.get('/:id', async (c) => {
    const id = c.req.param('id');
    const conauta = await c.env.DB.prepare('SELECT * FROM conautas WHERE id = ?').bind(id).first();

    if (!conauta) return c.json({ error: 'Conauta not found' }, 404);

    return c.json(conauta);
});

conautas.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const { user_id, name, bio, photo_url, location, interests } = body;

        if (!name) {
            return c.json({ error: 'Name is required' }, 400);
        }

        const result = await c.env.DB.prepare(
            `INSERT INTO conautas (user_id, name, bio, photo_url, location, interests)
             VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
            user_id || null,
            name,
            bio || null,
            photo_url || null,
            location || null,
            JSON.stringify(interests || [])
        ).run();

        return c.json({ success: true, id: result.meta.last_row_id }, 201);
    } catch (e) {
        return c.json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
    }
});

conautas.put('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const body = await c.req.json();
        const { name, bio, photo_url, location, interests } = body;

        const existing = await c.env.DB.prepare('SELECT * FROM conautas WHERE id = ?').bind(id).first();
        if (!existing) return c.json({ error: 'Conauta not found' }, 404);

        await c.env.DB.prepare(
            `UPDATE conautas
             SET name = ?, bio = ?, photo_url = ?, location = ?, interests = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`
        ).bind(
            name || existing.name,
            bio || existing.bio,
            photo_url || existing.photo_url,
            location || existing.location,
            interests ? JSON.stringify(interests) : existing.interests,
            id
        ).run();

        return c.json({ success: true });
    } catch (e) {
        return c.json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
    }
});

export default conautas;
