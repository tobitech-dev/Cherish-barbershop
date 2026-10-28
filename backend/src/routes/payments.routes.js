import { Router } from 'express';
import { initialize,verify,webhook } from '../controllers/payments.controller.js';
import { authenticate } from '../middleware/authenticate.js';
const router=Router();
router.post('/initialize',authenticate,initialize);
router.get('/verify/:reference',verify);
router.post('/webhook',webhook);
export default router;
