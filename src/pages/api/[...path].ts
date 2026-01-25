import type { APIRoute } from 'astro';
import { app } from '../../api';

export const ALL: APIRoute = (context) => {
    return app.fetch(context.request, context.locals.runtime.env, context.locals.runtime.ctx);
};
