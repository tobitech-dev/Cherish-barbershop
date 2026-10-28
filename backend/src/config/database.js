import pg from 'pg';
import { env } from './environment.js';
const { Pool } = pg;
export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: true } : false,
  max: 10,
  idleTimeoutMillis: 30000
});
pool.on('error', (error) => console.error('Unexpected database pool error', error));
export async function query(text, params = []) { return pool.query(text, params); }
