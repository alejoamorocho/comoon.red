import { Hono } from 'hono';
import { cors } from 'hono/cors';
import leaders from './leaders';
import products from './products';
import conautas from './conautas';

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
app.route('/conautas', conautas);

export { app };
