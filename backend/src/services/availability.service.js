import { query } from '../config/database.js';
import { AppError } from '../utils/errors.js';
const OPEN = { 0: ['15:00','20:00'], 1: ['09:00','21:00'], 2: ['09:00','21:00'], 3: ['09:00','21:00'], 4: ['09:00','21:00'], 5: ['09:00','21:00'], 6: ['09:00','21:00'] };
function minutes(t) { const [h,m] = t.split(':').map(Number); return h*60+m; }
function clock(n) { return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`; }
export async function getAvailability({ date, serviceId, barberId }) {
  const day = new Date(`${date}T12:00:00+01:00`).getDay();
  const [start,end] = OPEN[day];
  const sr = await query('SELECT duration_minutes FROM services WHERE id=$1 AND active=true', [serviceId]);
  if (!sr.rowCount) throw new AppError(404, 'Service not found or unavailable.');
  const duration = sr.rows[0].duration_minutes;
  const busy = await query(
    `SELECT start_at, end_at FROM bookings WHERE booking_date=$1 AND status NOT IN ('cancelled','rejected') AND ($2::int IS NULL OR barber_id=$2)`,
    [date, barberId || null]
  );
  const taken = busy.rows.map(r => [new Date(r.start_at).getHours()*60 + new Date(r.start_at).getMinutes(), new Date(r.end_at).getHours()*60 + new Date(r.end_at).getMinutes()]);
  const now = new Date();
  const sameDay = date === new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const result = [];
  for (let m=minutes(start); m+duration<=minutes(end); m+=30) {
    if (sameDay && m <= now.getHours()*60+now.getMinutes()+30) continue;
    if (!taken.some(([a,b]) => m < b && m+duration > a)) result.push(clock(m));
  }
  return result;
}
