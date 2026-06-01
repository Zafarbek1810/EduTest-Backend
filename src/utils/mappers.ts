import type { Question, TestResult, Topic, User } from '@prisma/client';

type TopicWithQuestions = Topic & { questions: Question[] };
type ResultWithRelations = TestResult & {
  student: Pick<User, 'id' | 'fullName'>;
  topic: Pick<Topic, 'id' | 'name'>;
};

export function mapStudent(user: User, stats?: { totalTests: number; averageScore: number }) {
  return {
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    password: '••••••••',
    createdDate: user.createdAt.toISOString().slice(0, 10),
    totalTests: stats?.totalTests ?? 0,
    averageScore: stats?.averageScore ?? 0,
    status: user.status === 'ACTIVE' ? 'active' : 'inactive',
  };
}

export function mapQuestion(q: Question) {
  return {
    id: q.id,
    type: q.type === 'MULTIPLE_CHOICE' ? 'multiple-choice' : 'open-answer',
    questionText: q.questionText,
    options: (q.options as string[] | null) ?? undefined,
    correctAnswer: q.correctAnswer,
  };
}

export function mapTopic(topic: TopicWithQuestions) {
  return {
    id: topic.id,
    name: topic.name,
    createdDate: topic.createdAt.toISOString().slice(0, 10),
    status: topic.status === 'UNLOCKED' ? 'unlocked' : 'locked',
    questions: topic.questions
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(mapQuestion),
  };
}

export function mapResult(result: ResultWithRelations) {
  return {
    id: result.id,
    studentId: result.studentId,
    studentName: result.student.fullName,
    topicId: result.topicId,
    topicName: result.topic.name,
    score: result.score,
    correctAnswers: result.correctAnswers,
    wrongAnswers: result.wrongAnswers,
    totalQuestions: result.totalQuestions,
    timeUsed: result.timeUsed,
    date: result.createdAt.toISOString().slice(0, 10),
    status: result.status === 'PASSED' ? 'passed' : 'failed',
  };
}
