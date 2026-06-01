import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { UnauthorizedError } from '../../lib/errors.js';
import { signToken, type AuthPayload } from '../../middleware/auth.js';

export async function login(username: string, password: string, role: 'teacher' | 'student') {
  const dbRole: Role = role === 'teacher' ? 'TEACHER' : 'STUDENT';
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || user.role !== dbRole) {
    throw new UnauthorizedError('Foydalanuvchi nomi yoki parol noto\'g\'ri');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Foydalanuvchi nomi yoki parol noto\'g\'ri');
  }

  if (user.status !== 'ACTIVE') {
    throw new UnauthorizedError('Hisob faol emas');
  }

  const payload: AuthPayload = {
    userId: user.id,
    role: user.role,
    username: user.username,
  };

  return {
    token: signToken(payload),
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: role,
    },
  };
}
