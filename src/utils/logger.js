import db from '../config/db.js';

export async function audit({ userId = null, action, ip, ua, meta = {} }) {
  try {
    await db.query(
      'INSERT INTO audit_logs (user_id, action, ip, user_agent, meta) VALUES (?,?,?,?,JSON_OBJECT())',
      [userId, action, ip || '', ua || '']
    );
  } catch (e) {
    // swallow
  }
}
