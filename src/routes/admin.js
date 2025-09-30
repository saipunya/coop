import { Router } from 'express';

// TODO: add admin auth middleware later
const router = Router();

router.get('/admin/ping', (req, res) => res.json({ ok: true, role: 'admin_tbd' }));

export default router;
