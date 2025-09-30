import { Router } from 'express';
import db from '../config/db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/me', authRequired, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, member_no, name, email, phone, created_at, updated_at FROM users WHERE id=?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});

export default router;
