import { z } from 'zod';

const causeStatusSchema = z.enum(['pending', 'active', 'completed', 'archived', 'rejected']);

export const createCauseSchema = z.object({
  title: z.string().min(1, 'El titulo es requerido').max(200),
  description: z.string().max(2000).optional(),
  target_goal: z.number().positive('La meta debe ser positiva').optional(),
  photo_url: z.string().url().optional(),
  evidence_photos: z.array(z.string().url()).optional(),
});

export const updateCauseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  target_goal: z.number().positive().optional(),
  photo_url: z.string().url().optional(),
  evidence_photos: z.array(z.string().url()).optional(),
  status: causeStatusSchema.optional(),
  admin_notes: z.string().max(500).optional(),
});

const causeUpdateTypeSchema = z.enum(['progress', 'milestone', 'gratitude', 'closing']);

export const createCauseUpdateSchema = z.object({
  cause_id: z.number().int().positive('cause_id es requerido'),
  title: z.string().min(1, 'El titulo es requerido').max(200),
  content: z.string().min(1, 'El contenido es requerido').max(5000),
  photo_url: z.string().url().optional(),
  photos: z.array(z.string().url()).optional(),
  update_type: causeUpdateTypeSchema.optional().default('progress'),
  is_closing: z.boolean().optional().default(false),
});

export const updateCauseUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(5000).optional(),
  photo_url: z.string().url().optional(),
  photos: z.array(z.string().url()).optional(),
  update_type: causeUpdateTypeSchema.optional(),
});

export const causeUpdatesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  leader_id: z.coerce.number().int().positive().optional(),
  cause_id: z.coerce.number().int().positive().optional(),
});
