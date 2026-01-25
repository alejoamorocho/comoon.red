import { Hono } from 'hono';

type Bindings = {
    DB: D1Database;
};

const products = new Hono<{ Bindings: Bindings }>();

products.get('/', async (c) => {
    const causeId = c.req.query('cause_id');

    let query = `
    SELECT p.*, e.store_name, c.title as cause_title, l.name as leader_name
    FROM products p
    JOIN entrepreneurs e ON p.entrepreneur_id = e.id
    JOIN causes c ON p.cause_id = c.id
    JOIN leaders l ON c.leader_id = l.id
  `;

    let params: any[] = [];

    if (causeId) {
        query += ` WHERE p.cause_id = ?`;
        params.push(causeId);
    }

    query += ` ORDER BY p.created_at DESC LIMIT 50`;

    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(results);
});

export default products;
