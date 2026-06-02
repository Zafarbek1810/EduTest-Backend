import { ResultStatus, TopicStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError } from '../../lib/errors.js';
import { mapResult } from '../../utils/mappers.js';

export async function listResults(filters?: { studentId?: string; topicId?: string }) {
  const results = await prisma.testResult.findMany({
    where: {
      studentId: filters?.studentId,
      topicId: filters?.topicId,
    },
    include: {
      student: { select: { id: true, fullName: true } },
      topic: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return results.map(mapResult);
}

export async function submitTest(
  studentId: string,
  topicId: string,
  answers: Record<string, string>,
  timeUsed: string,
) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { questions: true },
  });

  if (!topic || topic.status !== TopicStatus.UNLOCKED) {
    throw new NotFoundError('Test mavjud emas yoki qulflangan');
  }

  if (topic.questions.length === 0) {
    throw new ValidationError('Mavzuda savollar yo\'q');
  }

  let correct = 0;
  for (const q of topic.questions) {
    const given = (answers[q.id] ?? '').trim().toLowerCase();
    const expected = q.correctAnswer.trim().toLowerCase();
    if (given === expected) correct++;
  }

  const total = topic.questions.length;
  const wrong = total - correct;
  const score = Math.round((correct / total) * 100);
  const status = score >= 60 ? ResultStatus.PASSED : ResultStatus.FAILED;

  const result = await prisma.testResult.create({
    data: {
      studentId,
      topicId,
      submittedAnswers: answers,
      score,
      correctAnswers: correct,
      wrongAnswers: wrong,
      totalQuestions: total,
      timeUsed,
      status,
    },
    include: {
      student: { select: { id: true, fullName: true } },
      topic: { select: { id: true, name: true } },
    },
  });

  return mapResult(result);
}

export async function getResult(id: string, studentId?: string) {
  const result = await prisma.testResult.findUnique({
    where: { id },
    include: {
      student: { select: { id: true, fullName: true } },
      topic: {
        select: {
          id: true,
          name: true,
          questions: {
            orderBy: { orderIndex: 'asc' },
            select: {
              id: true,
              type: true,
              questionText: true,
              options: true,
              correctAnswer: true,
            },
          },
        },
      },
    },
  });

  if (!result) throw new NotFoundError('Natija topilmadi');
  if (studentId && result.studentId !== studentId) {
    throw new NotFoundError('Natija topilmadi');
  }

  const mapped = mapResult(result);
  const submittedAnswers = (result.submittedAnswers as Record<string, string> | null) ?? {};
  const questionBreakdown = result.topic.questions.map((question) => {
    const submittedAnswer = (submittedAnswers[question.id] ?? '').toString();
    const normalizedSubmitted = submittedAnswer.trim().toLowerCase();
    const normalizedCorrect = question.correctAnswer.trim().toLowerCase();

    return {
      questionId: question.id,
      questionText: question.questionText,
      type: question.type === 'MULTIPLE_CHOICE' ? 'multiple-choice' : 'open-answer',
      options: (question.options as string[] | null) ?? undefined,
      submittedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: normalizedSubmitted !== '' && normalizedSubmitted === normalizedCorrect,
    };
  });

  return {
    ...mapped,
    submittedAnswers,
    questionBreakdown,
  };
}
