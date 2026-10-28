import { initializePayment, verifyPayment, handleWebhook } from '../services/payment.service.js';
import { asyncHandler } from '../utils/errors.js';
export const initialize = asyncHandler(async (req,res) => res.json(await initializePayment(req.user, Number(req.body.bookingId), req.body.mode === 'deposit' ? 'deposit' : 'full')));
export const verify = asyncHandler(async (req,res) => res.json(await verifyPayment(req.params.reference)));
export const webhook = asyncHandler(async (req,res) => { await handleWebhook(req.body,req.headers['x-paystack-signature']); res.json({received:true}); });
