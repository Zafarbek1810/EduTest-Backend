import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  createTopic,
  deleteTopic,
  getTopic,
  getTopicForTest,
  listTopics,
  toggleTopicLock,
} from './topics.service.js';
import { paramId } from '../../utils/params.js';

const router = Router();

const questionSchema = z.object({
  type: z.enum(['multiple-choice', 'open-answer']),
  questionText: z.string().min(1),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1),
});

const createTopicSchema = z.object({
  name: z.string().min(1),
  status: z.enum(['locked', 'unlocked']).optional(),
  questions: z.array(questionSchema).min(1),
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const studentView = req.user?.role === Role.STUDENT;
    res.json({ success: true, data: await listTopics(studentView) });
  } catch (e) {
    next(e);
  }
});

router.get('/:id/test', authenticate, requireRole(Role.STUDENT), async (req, res, next) => {
  try {
    res.json({ success: true, data: await getTopicForTest(paramId(req.params.id)) });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const studentView = req.user?.role === Role.STUDENT;
    res.json({ success: true, data: await getTopic(paramId(req.params.id), studentView) });
  } catch (e) {
    next(e);
  }
});

router.post('/', authenticate, requireRole(Role.TEACHER), validate(createTopicSchema), async (req, res, next) => {
  try {
    res.status(201).json({ success: true, data: await createTopic(req.body) });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/toggle-lock', authenticate, requireRole(Role.TEACHER), async (req, res, next) => {
  try {
    res.json({ success: true, data: await toggleTopicLock(paramId(req.params.id)) });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', authenticate, requireRole(Role.TEACHER), async (req, res, next) => {
  try {
    await deleteTopic(paramId(req.params.id));
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

export default router;
