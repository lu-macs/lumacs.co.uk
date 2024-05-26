import { type Config } from 'drizzle-kit';

export default {
  schema: './src/server/db/schema.ts',
  driver: 'mysql2',
  dbCredentials: {
    uri: process.env.DATABASE_URL,
  },
  tablesFilter: ['lumacs_*'],
} satisfies Config;
