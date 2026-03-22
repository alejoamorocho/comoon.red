import { z } from 'zod';

const userRoleSchema = z.enum(['leader', 'entrepreneur']);

export const loginSchema = z.object({
  email: z.string().email('Email invalido').toLowerCase(),
  password: z.string().min(1, 'La contrasena es requerida'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    email: z.string().email('Email invalido').toLowerCase(),
    password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmar contrasena es requerido'),
    role: userRoleSchema,
    name: z.string().min(1, 'El nombre es requerido').max(100),
    storeName: z.string().max(100).optional(),
    location: z.string().max(200).optional(),
    bio: z.string().max(500).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contrasenas no coinciden',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.role === 'entrepreneur' && !data.storeName) {
        return false;
      }
      return true;
    },
    {
      message: 'El nombre de la tienda es requerido para emprendedores',
      path: ['storeName'],
    },
  );

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contrasena actual es requerida'),
    newPassword: z.string().min(8, 'La nueva contrasena debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmar contrasena es requerido'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contrasenas no coinciden',
    path: ['confirmPassword'],
  });

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token es requerido'),
});
