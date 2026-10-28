import { Router } from 'express';
import { query } from '../config/database.js';
const router=Router();
router.get('/',async(req,res)=>res.json({reviews:(await query('SELECT id,display_name,rating,body,created_at FROM reviews WHERE published=true ORDER BY created_at DESC LIMIT 50')).rows}));
export default router;
