import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { getResult, listResults, submitTest } from './results.service.js';
import { paramId } from '../../utils/params.js';

const router = Router();
router.use(authenticate);

const submitSchema = z.object({
  topicId: z.string(),
  answers: z.record(z.string()),
  timeUsed: z.string(),
});

router.get('/', async (req, res, next) => {
  try {
    const filters =
      req.user?.role === Role.STUDENT
        ? { studentId: req.user.userId }
        : undefined;
    res.json({ success: true, data: await listResults(filters) });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const studentId = req.user?.role === Role.STUDENT ? req.user.userId : undefined;
    res.json({ success: true, data: await getResult(paramId(req.params.id), studentId) });
  } catch (e) {
    next(e);
  }
});

router.post('/', requireRole(Role.STUDENT), validate(submitSchema), async (req, res, next) => {
  try {
    const { topicId, answers, timeUsed } = req.body as z.infer<typeof submitSchema>;
    const data = await submitTest(req.user!.userId, topicId, answers, timeUsed);
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

export default router;
