import bcrypt from 'bcryptjs';
import { pool,query } from '../src/config/database.js';
const email=process.env.ADMIN_EMAIL, password=process.env.ADMIN_PASSWORD;
if(!email || !password || password.length<12){console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) in backend/.env first.');process.exit(1);}
try {
 const existing=await query('SELECT id FROM users WHERE email=LOWER($1)',[email]);
 if(existing.rowCount){console.log('Account already exists; no changes made.');}
 else {const hash=await bcrypt.hash(password,12);await query("INSERT INTO users(name,email,password_hash,role) VALUES('Shop Owner',LOWER($1),$2,'owner')",[email,hash]);console.log('Owner account created.');}
} catch(e){console.error(e.message);process.exitCode=1;} finally {await pool.end();}
