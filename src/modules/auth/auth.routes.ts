import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { login } from './auth.service.js';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  role: z.enum(['teacher', 'student']),
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { username, password, role } = req.body as z.infer<typeof loginSchema>;
    const result = await login(username, password, role);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
});

export default router;
