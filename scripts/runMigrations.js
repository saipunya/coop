import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../src/config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const dir = path.join(__dirname, '../sql/migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const f of files) {
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    console.log('Running migration:', f);
    await db.query(sql);
  }
  console.log('Done');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
