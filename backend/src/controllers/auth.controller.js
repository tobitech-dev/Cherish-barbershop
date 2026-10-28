import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { env } from '../config/environment.js';
import { AppError, asyncHandler } from '../utils/errors.js';
function setSession(res, user) {
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, env.jwtSecret, { expiresIn: '7d' });
  res.cookie('cherish_session', token, { httpOnly: true, secure: env.cookieSecure, sameSite: 'lax', maxAge: 7*24*60*60*1000, path: '/' });
}
export const register = asyncHandler(async (req,res) => {
  const { name,email,password,phone } = req.body;
  const exists = await query('SELECT id FROM users WHERE email=LOWER($1)', [email]);
  if (exists.rowCount) throw new AppError(409, 'An account with this email already exists.');
  const hash = await bcrypt.hash(password, 12);
  const r = await query(`INSERT INTO users(name,email,password_hash,phone,role) VALUES($1,LOWER($2),$3,$4,'customer') RETURNING id,name,email,role`, [name,email,hash,phone||null]);
  setSession(res,r.rows[0]); res.status(201).json({ user:r.rows[0] });
});
export const login = asyncHandler(async (req,res) => {
  const r = await query('SELECT id,name,email,password_hash,role FROM users WHERE email=LOWER($1)', [req.body.email]);
  if (!r.rowCount || !(await bcrypt.compare(req.body.password,r.rows[0].password_hash))) throw new AppError(401,'Email or password is incorrect.');
  const user = r.rows[0]; delete user.password_hash; setSession(res,user); res.json({user});
});
export const logout = (req,res) => { res.clearCookie('cherish_session',{httpOnly:true,secure:env.cookieSecure,sameSite:'lax',path:'/'}); res.json({success:true}); };
export const me = (req,res) => res.json({user:req.user});
