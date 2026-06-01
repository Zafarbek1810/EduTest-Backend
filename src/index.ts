import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

const app = createApp();

async function main() {
  await prisma.$connect();
  app.listen(env.PORT, () => {
    console.log(`EduTest Pro API: http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
