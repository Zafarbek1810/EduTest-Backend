import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ConflictError, NotFoundError } from '../../lib/errors.js';
import { mapStudent } from '../../utils/mappers.js';

async function getStudentStats(studentId: string) {
  const results = await prisma.testResult.findMany({
    where: { studentId },
    select: { score: true },
  });
  const totalTests = results.length;
  const averageScore =
    totalTests > 0 ? results.reduce((s, r) => s + r.score, 0) / totalTests : 0;
  return { totalTests, averageScore: Math.round(averageScore * 10) / 10 };
}

export async function listStudents() {
  const students = await prisma.user.findMany({
    where: { role: Role.STUDENT },
    orderBy: { createdAt: 'desc' },
  });

  return Promise.all(
    students.map(async (s) => {
      const stats = await getStudentStats(s.id);
      return mapStudent(s, stats);
    }),
  );
}

export async function createStudent(data: {
  fullName: string;
  username: string;
  password: string;
}) {
  const exists = await prisma.user.findUnique({ where: { username: data.username } });
  if (exists) throw new ConflictError('Bu foydalanuvchi nomi band');

  const passwordHash = await bcrypt.hash(data.password, 10);
  const student = await prisma.user.create({
    data: {
      fullName: data.fullName,
      username: data.username,
      passwordHash,
      role: Role.STUDENT,
    },
  });

  return mapStudent(student, { totalTests: 0, averageScore: 0 });
}

export async function updateStudent(
  id: string,
  data: Partial<{ fullName: string; username: string; status: 'active' | 'inactive' }>,
) {
  const student = await prisma.user.findFirst({ where: { id, role: Role.STUDENT } });
  if (!student) throw new NotFoundError('Talaba topilmadi');

  if (data.username && data.username !== student.username) {
    const exists = await prisma.user.findUnique({ where: { username: data.username } });
    if (exists) throw new ConflictError('Bu foydalanuvchi nomi band');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      fullName: data.fullName,
      username: data.username,
      status: data.status === 'active' ? 'ACTIVE' : data.status === 'inactive' ? 'INACTIVE' : undefined,
    },
  });

  const stats = await getStudentStats(id);
  return mapStudent(updated, stats);
}

export async function resetPassword(id: string, password: string) {
  const student = await prisma.user.findFirst({ where: { id, role: Role.STUDENT } });
  if (!student) throw new NotFoundError('Talaba topilmadi');

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  return { success: true };
}

export async function deleteStudent(id: string) {
  const student = await prisma.user.findFirst({ where: { id, role: Role.STUDENT } });
  if (!student) throw new NotFoundError('Talaba topilmadi');
  await prisma.user.delete({ where: { id } });
}
