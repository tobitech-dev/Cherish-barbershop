import { z } from 'zod';
export const serviceSchema = z.object({ body: z.object({
  name: z.string().trim().min(2).max(120), description: z.string().trim().max(1000).optional(),
  priceKobo: z.coerce.number().int().nonnegative(), durationMinutes: z.coerce.number().int().min(10).max(360),
  active: z.coerce.boolean().optional()
}), query: z.any(), params: z.any() });
