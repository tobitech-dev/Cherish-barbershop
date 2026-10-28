import { Router } from 'express';
import { listMedia,upload,removeMedia } from '../controllers/media.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { ownerOnly } from '../middleware/authorize.js';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { env } from '../config/environment.js';
const router=Router();
const storage=multer.diskStorage({
  destination: async(req,file,cb)=>{ const kind=file.mimetype.startsWith('video/')?'videos':'images'; const dir=path.resolve(env.uploadDir,kind); await fs.mkdir(dir,{recursive:true}); cb(null,dir); },
  filename:(req,file,cb)=>cb(null,`${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname).toLowerCase()}`)
});
const uploadFile=multer({storage,limits:{fileSize:env.maxUploadMb*1024*1024,files:1},fileFilter:(req,file,cb)=>{
  const ok=/^(image\/(jpeg|png|webp|gif)|video\/(mp4|webm|quicktime))$/.test(file.mimetype);
  cb(ok?null:new Error('Only JPG, PNG, WEBP, GIF, MP4, WEBM and MOV files are accepted.'),ok);
}});
router.get('/',listMedia);
router.post('/',authenticate,ownerOnly,uploadFile.single('file'),upload);
router.delete('/:id',authenticate,ownerOnly,removeMedia);
export default router;
