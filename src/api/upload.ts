import { Hono } from 'hono';
import { requireAuth } from '../lib/auth';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  IMAGES: R2Bucket;
};

type Variables = {
  services: unknown;
};

const upload = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// POST /api/upload - Upload image to R2
upload.post('/', requireAuth, async (c) => {
  const bucket = c.env.IMAGES;
  if (!bucket) {
    return c.json({ error: 'Storage not configured' }, 500);
  }

  const contentType = c.req.header('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return c.json({ error: 'No se envio ningun archivo' }, 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return c.json({ error: 'Tipo de archivo no permitido. Usa JPG, PNG, WebP o GIF' }, 400);
    }

    if (file.size > MAX_SIZE) {
      return c.json({ error: 'El archivo es muy grande. Maximo 5MB' }, 400);
    }

    const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    await bucket.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    const url = `/api/upload/${key}`;
    return c.json({ success: true, url, key });
  }

  return c.json({ error: 'Content-Type debe ser multipart/form-data' }, 400);
});

// GET /api/upload/:key - Serve image from R2
upload.get('/:key', async (c) => {
  const bucket = c.env.IMAGES;
  if (!bucket) {
    return c.notFound();
  }

  const key = c.req.param('key');
  const object = await bucket.get(key);

  if (!object) {
    return c.notFound();
  }

  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('ETag', object.httpEtag);

  return new Response(object.body, { headers });
});

export default upload;
