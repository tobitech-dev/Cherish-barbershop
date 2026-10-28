import { z } from 'zod';
export const registerSchema = z.object({ body: z.object({
  name: z.string().trim().min(2).max(100), email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
  phone: z.string().trim().min(7).max(30).optional()
}), query: z.any(), params: z.any() });
export const loginSchema = z.object({ body: z.object({ email: z.string().email(), password: z.string().min(1).max(128) }), query: z.any(), params: z.any() });
