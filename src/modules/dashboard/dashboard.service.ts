import { TopicStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

export async function getTeacherStats() {
  const [totalStudents, totalTopics, totalTests, activeTopics, results, todayResults] =
    await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.topic.count(),
      prisma.testResult.count(),
      prisma.topic.count({ where: { status: TopicStatus.UNLOCKED } }),
      prisma.testResult.findMany({ select: { score: true } }),
      prisma.testResult.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

  const averageScore =
    results.length > 0
      ? results.reduce((s, r) => s + r.score, 0) / results.length
      : 0;

  const recentActivity = await prisma.testResult.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      student: { select: { fullName: true } },
      topic: { select: { name: true } },
    },
  });

  return {
    totalStudents,
    totalTopics,
    totalTests,
    activeTests: activeTopics,
    averageScore: Math.round(averageScore * 10) / 10,
    todayParticipants: todayResults,
    recentActivity: recentActivity.map((r) => ({
      id: r.id,
      studentName: r.student.fullName,
      topicName: r.topic.name,
      score: r.score,
      date: r.createdAt.toISOString().slice(0, 10),
      status: r.status === 'PASSED' ? 'passed' : 'failed',
    })),
  };
}
