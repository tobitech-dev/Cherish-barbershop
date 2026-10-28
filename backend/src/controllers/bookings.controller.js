import { query } from '../config/database.js';
import { createBooking, listMine } from '../services/booking.service.js';
import { getAvailability } from '../services/availability.service.js';
import { AppError, asyncHandler } from '../utils/errors.js';
export const availability = asyncHandler(async (req,res) => {
  const { date, serviceId, barberId } = req.query;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date||'') || !serviceId) throw new AppError(400,'A valid date and serviceId are required.');
  res.json({ date, slots:await getAvailability({date,serviceId:Number(serviceId),barberId:barberId?Number(barberId):null}) });
});
export const create = asyncHandler(async (req,res) => {
  const result = await createBooking(req.user.id,req.body);
  res.status(201).json(result);
});
export const mine = asyncHandler(async (req,res) => res.json({bookings:await listMine(req.user.id)}));
export const cancelMine = asyncHandler(async (req,res) => {
  const r = await query(`UPDATE bookings SET status='cancelled', updated_at=NOW() WHERE id=$1 AND customer_id=$2 AND status IN ('pending','confirmed') AND start_at > NOW() RETURNING id`,[req.params.id,req.user.id]);
  if (!r.rowCount) throw new AppError(404,'Booking not found or it can no longer be cancelled online.');
  res.json({success:true});
});
