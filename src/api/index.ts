import { Hono } from 'hono';
import { cors } from 'hono/cors';
import leaders from './leaders';
import products from './products';
import feed from './feed';
import causeUpdates from './cause-updates';
import auth from './auth';
import causes from './causes';
import entrepreneurs from './entrepreneurs';
import posts from './posts';
import upload from './upload';
import causeObjectives from './cause-objectives';
import { authMiddleware } from '../lib/auth';
import { errorHandler } from '../lib/middleware/error-handler';
import { securityHeaders } from '../lib/middleware/security-headers';
import { requestId } from '../lib/middleware/request-id';
import { createServices, type Services } from '../lib/di';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  IMAGES: R2Bucket;
};

type Variables = {
  services: Services;
  requestId: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>().basePath('/api');

// Centralized error handler
app.onError(errorHandler);

// Request ID (earliest, so all responses get it)
app.use('/*', requestId);

// Security headers
app.use('/*', securityHeaders);

// CORS with restricted origins
app.use(
  '/*',
  cors({
    origin: (origin) => {
      if (origin?.includes('localhost') || origin?.includes('comoon')) return origin;
      return '';
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  }),
);

// Auth middleware for all routes (sets user context, doesn't require auth)
app.use('/*', authMiddleware);

// DI middleware: create services per request and attach to context
app.use('/*', async (c, next) => {
  const services = createServices(c.env as { DB: D1Database; JWT_SECRET: string });
  c.set('services', services);
  await next();
});

// Health check
app.get('/', (c) => {
  return c.json({ message: 'Welcome to comoon API', version: '1.0.0' });
});

// Routes
app.route('/auth', auth);
app.route('/leaders', leaders);
app.route('/products', products);
app.route('/feed', feed);
app.route('/cause-updates', causeUpdates);
app.route('/causes', causes);
app.route('/entrepreneurs', entrepreneurs);
app.route('/posts', posts);
app.route('/upload', upload);
app.route('/causes', causeObjectives);

export { app };
