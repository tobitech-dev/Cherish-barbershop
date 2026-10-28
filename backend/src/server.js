import app from './app.js';
import { env } from './config/environment.js';
import { pool } from './config/database.js';
import { ensureUploadDirs } from './services/media.service.js';
await ensureUploadDirs();
const server=app.listen(env.port,()=>console.log(`CHERISH BARBERSHOP running at http://localhost:${env.port}`));
async function shutdown(){ console.log('Shutting down...'); server.close(async()=>{await pool.end();process.exit(0);}); }
process.on('SIGINT',shutdown); process.on('SIGTERM',shutdown);
