import { Client } from '@planetscale/database';
import { drizzle } from 'drizzle-orm/planetscale-serverless';

import * as schema from './schema';

export const db = drizzle(
  new Client({
    url: import.meta.env.DATABASE_URL,
    fetch: (url, init) => {
      init && delete init['cache'];
      return fetch(url, init);
    },
  }),
  { schema }
);
