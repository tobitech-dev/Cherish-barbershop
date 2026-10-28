import { Router } from 'express';
import { listServices,listBarbers } from '../controllers/services.controller.js';
const router=Router();
router.get('/',listServices);
router.get('/barbers',listBarbers);
export default router;
