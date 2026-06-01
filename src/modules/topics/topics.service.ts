import { QuestionType, TopicStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import { mapTopic } from '../../utils/mappers.js';

export async function listTopics(studentOnlyUnlocked = false) {
  const topics = await prisma.topic.findMany({
    where: studentOnlyUnlocked ? { status: TopicStatus.UNLOCKED } : undefined,
    include: { questions: true },
    orderBy: { createdAt: 'desc' },
  });
  return topics.map(mapTopic);
}

export async function getTopic(id: string, studentOnlyUnlocked = false) {
  const topic = await prisma.topic.findUnique({
    where: { id },
    include: { questions: true },
  });
  if (!topic) throw new NotFoundError('Mavzu topilmadi');
  if (studentOnlyUnlocked && topic.status !== TopicStatus.UNLOCKED) {
    throw new NotFoundError('Mavzu qulflangan');
  }
  return mapTopic(topic);
}

export async function createTopic(data: {
  name: string;
  status?: 'locked' | 'unlocked';
  questions: Array<{
    type: 'multiple-choice' | 'open-answer';
    questionText: string;
    options?: string[];
    correctAnswer: string;
  }>;
}) {
  const topic = await prisma.topic.create({
    data: {
      name: data.name,
      status: data.status === 'unlocked' ? TopicStatus.UNLOCKED : TopicStatus.LOCKED,
      questions: {
        create: data.questions.map((q, i) => ({
          type: q.type === 'multiple-choice' ? QuestionType.MULTIPLE_CHOICE : QuestionType.OPEN_ANSWER,
          questionText: q.questionText,
          options: q.options ?? undefined,
          correctAnswer: q.correctAnswer,
          orderIndex: i,
        })),
      },
    },
    include: { questions: true },
  });
  return mapTopic(topic);
}

export async function toggleTopicLock(id: string) {
  const topic = await prisma.topic.findUnique({ where: { id } });
  if (!topic) throw new NotFoundError('Mavzu topilmadi');

  const updated = await prisma.topic.update({
    where: { id },
    data: {
      status: topic.status === TopicStatus.LOCKED ? TopicStatus.UNLOCKED : TopicStatus.LOCKED,
    },
    include: { questions: true },
  });
  return mapTopic(updated);
}

export async function deleteTopic(id: string) {
  const topic = await prisma.topic.findUnique({ where: { id } });
  if (!topic) throw new NotFoundError('Mavzu topilmadi');
  await prisma.topic.delete({ where: { id } });
}

/** Student-facing: questions without correct answers */
export async function getTopicForTest(id: string) {
  const topic = await getTopic(id, true);
  return {
    id: topic.id,
    name: topic.name,
    questions: topic.questions.map((q) => ({
      id: q.id,
      type: q.type,
      questionText: q.questionText,
      options: q.options,
    })),
  };
}
