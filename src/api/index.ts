import { Hono } from 'hono';
import { cors } from 'hono/cors';
import leaders from './leaders';
import products from './products';

type Bindings = {
    DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

app.use('/*', cors());

app.get('/', (c) => {
    return c.json({ message: 'Welcome to comoon API 🌕' });
});

app.route('/leaders', leaders);
app.route('/products', products);

export { app };
