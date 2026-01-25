import { Hono } from 'hono';

type Bindings = {
    DB: D1Database;
};

const leaders = new Hono<{ Bindings: Bindings }>();

leaders.get('/', async (c) => {
    try {
        const minContribution = c.req.query('min') || 0; // Example query param usage (unused for now)

        // Select leaders securely from D1
        const { results } = await c.env.DB.prepare(
            `SELECT l.*, c.title as active_cause_title 
       FROM leaders l 
       LEFT JOIN causes c ON l.id = c.leader_id 
       WHERE c.status = 'active' OR c.status IS NULL
       LIMIT 50`
        ).all();

        return c.json(results);
    } catch (e) {
        return c.json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
    }
});

leaders.get('/:id', async (c) => {
    const id = c.req.param('id');
    const leader = await c.env.DB.prepare('SELECT * FROM leaders WHERE id = ?').bind(id).first();

    if (!leader) return c.json({ error: 'Leader not found' }, 404);

    const causes = await c.env.DB.prepare('SELECT * FROM causes WHERE leader_id = ?').bind(id).all();

    return c.json({ ...leader, causes: causes.results });
});

export default leaders;
