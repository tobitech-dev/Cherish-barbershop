import { pool, query } from '../config/database.js';
import { AppError } from '../utils/errors.js';
export async function createBooking(userId, data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const sr = await client.query('SELECT id, name, price_kobo, duration_minutes FROM services WHERE id=$1 AND active=true FOR SHARE', [data.serviceId]);
    if (!sr.rowCount) throw new AppError(404, 'Service is not available.');
    const service = sr.rows[0];
    const barberId = data.barberId || null;
    if (barberId) {
      const br = await client.query('SELECT id FROM barbers WHERE id=$1 AND active=true', [barberId]);
      if (!br.rowCount) throw new AppError(404, 'Barber is not available.');
    }
    const start = new Date(`${data.date}T${data.time}:00+01:00`);
    if (Number.isNaN(start.getTime()) || start.getTime() < Date.now()+5*60*1000) throw new AppError(400, 'Choose a future appointment time.');
    const end = new Date(start.getTime()+service.duration_minutes*60000);
    const [hour] = data.time.split(':').map(Number);
    const dow = new Date(`${data.date}T12:00:00+01:00`).getDay();
    const open = dow === 0 ? 15 : 9, close = dow === 0 ? 20 : 21;
    if (hour < open || end.getHours() > close || (end.getHours() === close && end.getMinutes() > 0)) throw new AppError(400, 'That appointment is outside opening hours.');
    const overlap = await client.query(
      `SELECT id FROM bookings WHERE booking_date=$1 AND status NOT IN ('cancelled','rejected')
       AND (($2::int IS NULL AND barber_id IS NULL) OR barber_id=$2 OR ($2::int IS NULL))
       AND start_at < $4 AND end_at > $3 FOR UPDATE`,
      [data.date, barberId, start.toISOString(), end.toISOString()]
    );
    if (overlap.rowCount) throw new AppError(409, 'That time has just been taken. Please choose another slot.');
    const status = 'confirmed';
    const paymentStatus = data.paymentChoice === 'shop' ? 'pay_at_shop' : 'pending';
    const br = await client.query(
      `INSERT INTO bookings (customer_id, service_id, barber_id, booking_date, start_at, end_at, status, payment_choice, payment_status, amount_kobo, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id, status, booking_date, start_at, end_at, payment_status`,
      [userId, service.id, barberId, data.date, start.toISOString(), end.toISOString(), status, data.paymentChoice || 'shop', paymentStatus, service.price_kobo, data.notes || null]
    );
    await client.query('COMMIT');
    return { booking: br.rows[0], service: { name: service.name, priceKobo: service.price_kobo, durationMinutes: service.duration_minutes } };
  } catch (e) { await client.query('ROLLBACK'); if (e.code === '23P01' || e.code === '23505') throw new AppError(409, 'That time has just been taken. Please choose another slot.'); throw e; }
  finally { client.release(); }
}
export async function listMine(userId) {
  return (await query(`SELECT b.*, s.name AS service_name, br.name AS barber_name FROM bookings b JOIN services s ON s.id=b.service_id LEFT JOIN barbers br ON br.id=b.barber_id WHERE b.customer_id=$1 ORDER BY b.start_at DESC`, [userId])).rows;
}
