import { z } from 'zod';
export const createBookingSchema = z.object({ body: z.object({
  serviceId: z.coerce.number().int().positive(), barberId: z.coerce.number().int().positive().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  paymentChoice: z.enum(['shop', 'full', 'deposit']).default('shop'),
  notes: z.string().max(500).optional()
}), query: z.any(), params: z.any() });
