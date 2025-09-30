import { Router } from 'express';
import db from '../config/db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/accounts', authRequired, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, account_type, balance, updated_at FROM accounts WHERE user_id=?',
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.get('/accounts/:id/transactions', authRequired, async (req, res, next) => {
  try {
    const accountId = parseInt(req.params.id, 10);
    const [[own]] = await db.query(
      'SELECT 1 FROM accounts WHERE id=? AND user_id=?',
      [accountId, req.user.id]
    );
    if (!own) return res.status(403).json({ error: 'Forbidden' });

    const [rows] = await db.query(
      'SELECT id, tx_type, amount, date, description, source_ref, created_at FROM transactions WHERE account_id=? ORDER BY date DESC, id DESC LIMIT 200',
      [accountId]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

export default router;
