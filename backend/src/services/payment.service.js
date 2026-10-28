import crypto from 'node:crypto';
import { env } from '../config/environment.js';
import { query } from '../config/database.js';
import { AppError } from '../utils/errors.js';
export async function initializePayment(user, bookingId, mode) {
  if (!env.paystackSecretKey) throw new AppError(503, 'Online payments are not configured yet. Choose pay at the shop or contact the barbershop.');
  const result = await query('SELECT * FROM bookings WHERE id=$1 AND customer_id=$2', [bookingId, user.id]);
  if (!result.rowCount) throw new AppError(404, 'Booking not found.');
  const booking = result.rows[0];
  if (booking.payment_status === 'paid') throw new AppError(400, 'This booking is already paid.');
  const amount = mode === 'deposit' ? Math.max(100000, Math.round(booking.amount_kobo * 0.3)) : booking.amount_kobo;
  const reference = `CHERISH-${booking.id}-${crypto.randomUUID()}`;
  await query('INSERT INTO payment_transactions (booking_id, reference, amount_kobo, status, mode) VALUES ($1,$2,$3,$4,$5)', [booking.id, reference, amount, 'initialized', mode]);
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST', headers: { Authorization: `Bearer ${env.paystackSecretKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, amount, reference, callback_url: env.paystackCallbackUrl, metadata: { bookingId: booking.id, mode } })
  });
  const payload = await response.json();
  if (!response.ok || !payload.status) throw new AppError(502, 'Could not start payment. Please try again.');
  return { authorizationUrl: payload.data.authorization_url, reference };
}
export async function verifyPayment(reference) {
  if (!env.paystackSecretKey) throw new AppError(503, 'Online payments are not configured.');
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${env.paystackSecretKey}` } });
  const payload = await response.json();
  if (!response.ok || !payload.status || payload.data.status !== 'success') throw new AppError(400, 'Payment could not be verified.');
  const tx = await query('SELECT * FROM payment_transactions WHERE reference=$1', [reference]);
  if (!tx.rowCount) throw new AppError(404, 'Payment reference not found.');
  if (Number(payload.data.amount) !== Number(tx.rows[0].amount_kobo)) throw new AppError(400, 'Payment amount did not match.');
  await query('UPDATE payment_transactions SET status=$2, provider_transaction_id=$3, updated_at=NOW() WHERE reference=$1', [reference, 'success', String(payload.data.id)]);
  await query(`UPDATE bookings SET payment_status=CASE WHEN payment_choice='deposit' THEN 'deposit_paid' ELSE 'paid' END WHERE id=$1`, [tx.rows[0].booking_id]);
  return { success: true, bookingId: tx.rows[0].booking_id };
}
export async function handleWebhook(rawBody, signature) {
  const expected = crypto.createHmac('sha512', env.paystackSecretKey).update(rawBody).digest('hex');
  if (!signature || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) throw new AppError(401, 'Invalid payment signature.');
  const event = JSON.parse(rawBody.toString());
  if (event.event === 'charge.success') {
    const reference = event.data?.reference;
    if (reference) await verifyPayment(reference);
  }
}
