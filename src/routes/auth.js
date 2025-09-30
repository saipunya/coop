import { Router } from 'express';
import db from '../config/db.js';
import { comparePassword } from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// TODO Mapping:
// POST /auth/login
// 1) Receive username, password, rememberMe -> handled (supports remember or rememberMe)
// 2) Verify user exists in MySQL -> SELECT query
// 3) Check password with bcrypt -> comparePassword()
// 4) Generate JWT token -> signToken()
// 5) If rememberMe true => expiry 6 months (env REMEMBER_ME_DAYS) else hours (JWT_EXP_HOURS)
// 6) Save token in sessions table -> INSERT INTO sessions
// 7) Return token + basic user profile
//
// POST /auth/logout
// 1) Receive token via Authorization header
// 2) Invalidate in sessions table -> UPDATE valid=0
// 3) Return ok:true

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    let { username, password, remember, rememberMe } = req.body;
    username = (username || '').trim();
    password = (password || '').trim();
    const rememberFlag = remember !== undefined ? remember : rememberMe;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const [rows] = await db.query(
      'SELECT id, name, email, password_hash FROM users WHERE email=? OR member_no=? LIMIT 1',
      [username, username]
    );
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const ok = await comparePassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // Expiry calculation (hours vs days)
    const hours = parseInt(process.env.JWT_EXP_HOURS || '12', 10);
    const days = parseInt(process.env.REMEMBER_ME_DAYS || '180', 10);
    const expiresIn = rememberFlag ? `${days}d` : `${hours}h`;
    const token = signToken({ sub: user.id }, expiresIn);

    // Store session with appropriate expiry in DB
    const expiresSql = rememberFlag
      ? 'DATE_ADD(NOW(), INTERVAL ? DAY)'
      : 'DATE_ADD(NOW(), INTERVAL ? HOUR)';
    await db.query(
      `INSERT INTO sessions (user_id, token, expires_at) VALUES (?,?,${expiresSql})`,
      [user.id, token, rememberFlag ? days : hours]
    );

    return res.json({
      token,
      expiresIn,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
    if (token) {
      await db.query('UPDATE sessions SET valid=0 WHERE token=?', [token]);
    }
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
