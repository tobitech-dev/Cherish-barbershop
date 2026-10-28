import path from 'node:path';
import fs from 'node:fs/promises';
import { env } from '../config/environment.js';
export async function ensureUploadDirs() {
  for (const folder of ['images','videos']) await fs.mkdir(path.resolve(env.uploadDir, folder), { recursive: true });
}
