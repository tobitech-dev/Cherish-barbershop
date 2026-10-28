import { query } from '../config/database.js';
export async function listServices(req,res) { res.json({ services:(await query('SELECT id,name,description,price_kobo,duration_minutes FROM services WHERE active=true ORDER BY sort_order,name')).rows }); }
export async function listBarbers(req,res) { res.json({ barbers:(await query('SELECT id,name,bio,photo_url FROM barbers WHERE active=true ORDER BY sort_order,name')).rows }); }
