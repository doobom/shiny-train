import type { Config } from 'drizzle-kit';
const url = process.env.DATABASE_URL || '';
const regex = /^postgresql:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*)$/;
const match = url.match(regex);
let dbCredentials: any = { url: '' };
if (match) {
  const [_, user, password, host, portStr, database] = match;
  dbCredentials = { user, password, host, port: parseInt(portStr), database };
}

export default {
  schema: './src/server/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials
} satisfies Config;
