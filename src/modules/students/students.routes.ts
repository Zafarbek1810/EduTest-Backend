import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  createStudent,
  deleteStudent,
  listStudents,
  resetPassword,
  updateStudent,
} from './students.service.js';
import { paramId } from '../../utils/params.js';
import { Role } from '@prisma/client';

const router = Router();
router.use(authenticate, requireRole(Role.TEACHER));

const createSchema = z.object({
  fullName: z.string().min(2),
  username: z.string().min(3),
  password: z.string().min(6),
});

const updateSchema = z.object({
  fullName: z.string().min(2).optional(),
  username: z.string().min(3).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

const resetSchema = z.object({ password: z.string().min(6) });

router.get('/', async (_req, res, next) => {
  try {
    res.json({ success: true, data: await listStudents() });
  } catch (e) {
    next(e);
  }
});

router.post('/', validate(createSchema), async (req, res, next) => {
  try {
    res.status(201).json({ success: true, data: await createStudent(req.body) });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', validate(updateSchema), async (req, res, next) => {
  try {
    res.json({ success: true, data: await updateStudent(paramId(req.params.id), req.body) });
  } catch (e) {
    next(e);
  }
});

router.post('/:id/reset-password', validate(resetSchema), async (req, res, next) => {
  try {
    await resetPassword(paramId(req.params.id), req.body.password);
    res.json({ success: true, message: 'Parol yangilandi' });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await deleteStudent(paramId(req.params.id));
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

export default router;
