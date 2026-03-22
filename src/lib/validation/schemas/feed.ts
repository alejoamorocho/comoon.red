import { z } from 'zod';

const feedTypeSchema = z.enum(['product', 'cause', 'cause_update']);

export const feedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  types: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return ['product', 'cause', 'cause_update'];
      return val.split(',').filter(Boolean);
    })
    .pipe(z.array(feedTypeSchema)),
  department: z.string().optional(),
  city: z.string().optional(),
  categories: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      return val.split(',').filter(Boolean);
    }),
});
