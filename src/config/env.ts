import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173')
    .describe('Vergul bilan ajratilgan frontend manzillari'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const lines = parsed.error.issues.map((issue) => {
    const key = issue.path.join('.');
    const hint =
      key === 'JWT_SECRET'
        ? 'Render → Environment → JWT_SECRET (kamida 16 belgili tasodifiy matn)'
        : key === 'DATABASE_URL'
          ? 'Neon → Connection string → DATABASE_URL'
          : '';
    return `  - ${key}: ${issue.message}${hint ? ` — ${hint}` : ''}`;
  });
  console.error(
    'Server ishga tushmadi: muhit o\'zgaruvchilari noto\'g\'ri yoki yo\'q.\n' +
      lines.join('\n'),
  );
  process.exit(1);
}

export const env = parsed.data;

/** Netlify + mahalliy dev uchun bir nechta origin */
export const corsOrigins = env.CORS_ORIGIN.split(',')
  .map((o) => o.trim())
  .filter(Boolean);
