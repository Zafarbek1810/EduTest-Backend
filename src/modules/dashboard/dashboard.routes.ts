import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { getTeacherStats } from './dashboard.service.js';

const router = Router();

router.get('/teacher', authenticate, requireRole(Role.TEACHER), async (_req, res, next) => {
  try {
    res.json({ success: true, data: await getTeacherStats() });
  } catch (e) {
    next(e);
  }
});

export default router;
