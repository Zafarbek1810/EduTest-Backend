import bcrypt from 'bcryptjs';
import { PrismaClient, QuestionType, TopicStatus, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.testResult.deleteMany();
  await prisma.question.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('pass123', 10);
  const teacherHash = await bcrypt.hash('teacher123', 10);

  await prisma.user.create({
    data: {
      username: 'teacher',
      passwordHash: teacherHash,
      role: 'TEACHER',
      fullName: 'O\'qituvchi Admin',
      status: UserStatus.ACTIVE,
    },
  });

  const students = [
    { fullName: 'Dilnoza Karimova', username: 'dilnoza.k' },
    { fullName: 'Bekzod Mirziyoyev', username: 'bekzod.m' },
    { fullName: 'Nigora Rahimova', username: 'nigora.r' },
    { fullName: 'Jasur Toshmatov', username: 'jasur.t' },
    { fullName: 'Madina Yusupova', username: 'madina.y', status: UserStatus.INACTIVE },
  ];

  const studentUsers = await Promise.all(
    students.map((s) =>
      prisma.user.create({
        data: {
          fullName: s.fullName,
          username: s.username,
          passwordHash,
          role: 'STUDENT',
          status: s.status ?? UserStatus.ACTIVE,
        },
      }),
    ),
  );

  const topicsData = [
    {
      name: 'React bilan tanishuv',
      status: TopicStatus.UNLOCKED,
      questions: [
        {
          type: QuestionType.MULTIPLE_CHOICE,
          questionText: 'React nima?',
          options: [
            'Foydalanuvchi interfeyslarini yaratish uchun JavaScript kutubxonasi',
            'Dasturlash tili',
            "Ma'lumotlar bazasini boshqarish tizimi",
            'Operatsion tizim',
          ],
          correctAnswer: 'Foydalanuvchi interfeyslarini yaratish uchun JavaScript kutubxonasi',
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          questionText: 'JSX qisqartmasi nimani anglatadi?',
          options: ['JavaScript XML', 'Java sintaksis kengaytmasi', 'JSON kengaytirilgan', 'JavaScript bajarilishi'],
          correctAnswer: 'JavaScript XML',
        },
        {
          type: QuestionType.OPEN_ANSWER,
          questionText: "Reactda useState hookining vazifasi nima?",
          correctAnswer: "Funksional komponentlarga holat boshqaruvini qo'shish",
        },
      ],
    },
    {
      name: 'JavaScript asoslari',
      status: TopicStatus.UNLOCKED,
      questions: [
        {
          type: QuestionType.MULTIPLE_CHOICE,
          questionText: 'JavaScriptda closure (yopilma) nima?',
          options: [
            "Tashqi doiradagi o'zgaruvchilarga kirish huquqiga ega funksiya",
            'Sikl tuzilmasi',
            "Ma'lumotlar turi",
            'Xatolarni boshqarish mexanizmi',
          ],
          correctAnswer: "Tashqi doiradagi o'zgaruvchilarga kirish huquqiga ega funksiya",
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          questionText: "Doimiy o'zgaruvchini e'lon qilish uchun qaysi kalit so'z ishlatiladi?",
          options: ['const', 'let', 'var', 'static'],
          correctAnswer: 'const',
        },
      ],
    },
    {
      name: "TypeScript ilg'or darajasi",
      status: TopicStatus.LOCKED,
      questions: [
        {
          type: QuestionType.MULTIPLE_CHOICE,
          questionText: 'TypeScriptda generic nima?',
          options: [
            'Tur parametrlari bilan qayta foydalaniladigan komponentlar yaratish usuli',
            "O'rnatilgan ma'lumotlar turi",
            'Metod dekoratori',
            'Xato turi',
          ],
          correctAnswer: 'Tur parametrlari bilan qayta foydalaniladigan komponentlar yaratish usuli',
        },
      ],
    },
  ];

  for (const t of topicsData) {
    const topic = await prisma.topic.create({
      data: { name: t.name, status: t.status },
    });
    await prisma.question.createMany({
      data: t.questions.map((q, i) => ({
        topicId: topic.id,
        type: q.type,
        questionText: q.questionText,
        options: 'options' in q ? q.options : undefined,
        correctAnswer: q.correctAnswer,
        orderIndex: i,
      })),
    });
  }

  const reactTopic = await prisma.topic.findFirst({ where: { name: 'React bilan tanishuv' } });
  if (reactTopic && studentUsers[1]) {
    await prisma.testResult.create({
      data: {
        studentId: studentUsers[1].id,
        topicId: reactTopic.id,
        score: 95,
        correctAnswers: 2,
        wrongAnswers: 1,
        totalQuestions: 3,
        timeUsed: '15:23',
        status: 'PASSED',
      },
    });
  }

  console.log('Seed completed.');
  console.log('Teacher: teacher / teacher123');
  console.log('Students: dilnoza.k, bekzod.m, ... / pass123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
