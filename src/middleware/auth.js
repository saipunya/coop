import db from '../config/db.js';
import { verifyToken, signToken } from '../utils/jwt.js';

export async function authRequired(req, res, next) {
  try {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const [rows] = await db.query(
      'SELECT * FROM sessions WHERE token=? AND valid=1 AND expires_at > NOW()',
      [token]
    );
    if (!rows.length) return res.status(401).json({ error: 'Session expired' });

    req.user = { id: decoded.sub };
    req.sessionToken = token;

    // Optional auto-refresh if < 25% lifetime remaining
    const expMs = decoded.exp * 1000;
    const ttl = expMs - Date.now();
    if (ttl < 0.25 * 1000 * 60 * 60 * 12) {
      const newToken = signToken({ sub: decoded.sub }, '12h');
      await db.query('UPDATE sessions SET token=? WHERE id=?', [newToken, rows[0].id]);
      res.setHeader('X-Refreshed-Token', newToken);
    }

    next();
  } catch (e) {
    next(e);
  }
}
