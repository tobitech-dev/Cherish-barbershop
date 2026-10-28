import path from 'node:path';
import { query } from '../config/database.js';
export async function listMedia(req,res) { res.json({media:(await query('SELECT id,kind,url,alt_text,section,created_at FROM media ORDER BY created_at DESC')).rows}); }
export async function upload(req,res) {
  if (!req.file) return res.status(400).json({error:'Choose an image or video file.'});
  const kind = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
  const url = `/uploads/${kind === 'video' ? 'videos' : 'images'}/${path.basename(req.file.filename)}`;
  const r = await query('INSERT INTO media(kind,url,alt_text,section,uploaded_by) VALUES($1,$2,$3,$4,$5) RETURNING id,kind,url,alt_text,section', [kind,url,req.body.altText||'',req.body.section||'gallery',req.user.id]);
  res.status(201).json({media:r.rows[0]});
}
export async function removeMedia(req,res) {
  const r = await query('DELETE FROM media WHERE id=$1 RETURNING id,url',[req.params.id]);
  if (!r.rowCount) return res.status(404).json({error:'Media not found.'});
  res.json({success:true,media:r.rows[0]});
}
