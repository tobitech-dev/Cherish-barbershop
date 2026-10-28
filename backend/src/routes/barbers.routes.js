import { Router } from 'express';
import { listBarbers } from '../controllers/services.controller.js';
const router=Router();
router.get('/',listBarbers);
export default router;
