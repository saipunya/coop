import bcrypt from 'bcrypt';
import crypto from 'crypto';

const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

export async function hashPassword(password) {
  return bcrypt.hash(password, rounds);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function hashNationalId(nid) {
  return crypto.createHash('sha256').update(nid).digest('hex');
}
