import { query } from '../config/database.js';
import { AppError, asyncHandler } from '../utils/errors.js';
export const dashboard = asyncHandler(async(req,res) => {
  const [b,s,u] = await Promise.all([
    query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status='confirmed')::int AS confirmed, COUNT(*) FILTER (WHERE booking_date=CURRENT_DATE)::int AS today FROM bookings`),
    query('SELECT COUNT(*)::int AS total FROM services WHERE active=true'),
    query(`SELECT COUNT(*)::int AS total FROM users WHERE role='customer'`)
  ]);
  res.json({bookings:b.rows[0],services:s.rows[0],customers:u.rows[0]});
});
export const allBookings = asyncHandler(async(req,res) => res.json({bookings:(await query(`SELECT b.*,u.name AS customer_name,u.email AS customer_email,u.phone,s.name AS service_name,br.name AS barber_name FROM bookings b JOIN users u ON u.id=b.customer_id JOIN services s ON s.id=b.service_id LEFT JOIN barbers br ON br.id=b.barber_id ORDER BY b.start_at DESC LIMIT 500`)).rows}));
export const updateBooking = asyncHandler(async(req,res) => {
  const allowed=['confirmed','cancelled','rejected','completed'];
  if(!allowed.includes(req.body.status)) throw new AppError(400,'Invalid booking status.');
  const r=await query('UPDATE bookings SET status=$2,updated_at=NOW() WHERE id=$1 RETURNING *',[req.params.id,req.body.status]);
  if(!r.rowCount) throw new AppError(404,'Booking not found.');
  res.json({booking:r.rows[0]});
});
export const createService = asyncHandler(async(req,res) => {
  const {name,description='',priceKobo,durationMinutes,active=true}=req.body;
  if(!name || !Number.isInteger(Number(priceKobo)) || Number(priceKobo)<0 || !Number.isInteger(Number(durationMinutes)) || Number(durationMinutes)<10) throw new AppError(400,'Name, valid price and duration are required.');
  const r=await query('INSERT INTO services(name,description,price_kobo,duration_minutes,active) VALUES($1,$2,$3,$4,$5) RETURNING *',[name,description,Number(priceKobo),Number(durationMinutes),active]);
  res.status(201).json({service:r.rows[0]});
});
export const updateService = asyncHandler(async(req,res) => {
  const {name,description='',priceKobo,durationMinutes,active=true}=req.body;
  const r=await query('UPDATE services SET name=$2,description=$3,price_kobo=$4,duration_minutes=$5,active=$6,updated_at=NOW() WHERE id=$1 RETURNING *',[req.params.id,name,description,Number(priceKobo),Number(durationMinutes),active]);
  if(!r.rowCount) throw new AppError(404,'Service not found.');
  res.json({service:r.rows[0]});
});
export const deleteService = asyncHandler(async(req,res) => {
  const r=await query('UPDATE services SET active=false,updated_at=NOW() WHERE id=$1 RETURNING id',[req.params.id]);
  if(!r.rowCount) throw new AppError(404,'Service not found.');
  res.json({success:true});
});
export const createBarber = asyncHandler(async(req,res) => {
  const {name,bio='',photoUrl='',active=true}=req.body;
  if(!name) throw new AppError(400,'Barber name is required.');
  const r=await query('INSERT INTO barbers(name,bio,photo_url,active) VALUES($1,$2,$3,$4) RETURNING *',[name,bio,photoUrl,active]);
  res.status(201).json({barber:r.rows[0]});
});
export const settings = asyncHandler(async(req,res) => {
  if(req.method==='GET') return res.json({settings:(await query('SELECT key,value FROM site_settings ORDER BY key')).rows});
  const entries=Object.entries(req.body||{});
  for(const [key,value] of entries) await query(`INSERT INTO site_settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`,[key,String(value)]);
  res.json({success:true});
});
