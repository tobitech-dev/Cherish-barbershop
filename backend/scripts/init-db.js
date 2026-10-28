import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/config/database.js';
const here=path.dirname(fileURLToPath(import.meta.url));
try { const sql=await fs.readFile(path.resolve(here,'../../database/schema.sql'),'utf8'); await pool.query(sql); console.log('Database schema initialized.'); }
catch(e){ console.error(e.message); process.exitCode=1; }
finally { await pool.end(); }
