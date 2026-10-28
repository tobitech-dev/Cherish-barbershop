import { Router } from 'express';
import { query } from '../config/database.js';
const router=Router();
router.get('/',async(req,res)=>res.json({settings:Object.fromEntries((await query('SELECT key,value FROM site_settings')).rows.map(x=>[x.key,x.value]))}));
export default router;
