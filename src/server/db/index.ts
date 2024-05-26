import { Client } from '@planetscale/database';
import { drizzle } from 'drizzle-orm/planetscale-serverless';

import * as schema from './schema';

// ENVIRONMENT VARIABLES ARE NOT AVAILABLE in production

export const db =
  import.meta.env.NODE_ENV !== 'development'
    ? drizzle(
        new Client({
          url: 'replace-with-the-database-url',
          fetch: (url, init) => {
            init && delete init['cache'];
            return fetch(url, init);
          },
        }),
        { schema }
      )
    : drizzle(
        new Client({
          url: import.meta.env.DATABASE_URL,
        }),
        { schema }
      );
