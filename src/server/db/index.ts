import { Client } from '@planetscale/database';
import { drizzle } from 'drizzle-orm/planetscale-serverless';

import * as schema from './schema';

export const db =
  import.meta.env.NODE_ENV !== 'development'
    ? drizzle(
        new Client({
          host: import.meta.env.DATABASE_HOST,
          username: import.meta.env.DATABASE_USERNAME,
          password: import.meta.env.DATABASE_PASSWORD,
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
