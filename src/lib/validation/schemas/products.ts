import { z } from 'zod';

const contributionTypeSchema = z.enum(['percentage', 'fixed']);

export const createProductSchema = z.object({
  entrepreneur_id: z.number().int().positive(),
  cause_id: z.number().int().positive(),
  name: z.string().min(1, 'El nombre es requerido').max(200),
  description: z.string().max(2000).optional(),
  price: z.number().positive('El precio debe ser positivo'),
  contribution_text: z.string().max(200).optional(),
  contribution_amount: z.number().min(0).optional(),
  contribution_type: contributionTypeSchema.optional().default('percentage'),
  photo_url: z.string().url().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().positive().optional(),
  contribution_text: z.string().max(200).optional(),
  contribution_amount: z.number().min(0).optional(),
  contribution_type: contributionTypeSchema.optional(),
  photo_url: z.string().url().optional(),
  is_active: z.boolean().optional(),
});

export const productsQuerySchema = z.object({
  cause_id: z.coerce.number().int().positive().optional(),
});
