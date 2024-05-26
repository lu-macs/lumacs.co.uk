import { relations, sql } from 'drizzle-orm';
import {
  bigint,
  char,
  mysqlEnum,
  mysqlTableCreator,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = mysqlTableCreator((name) => `lumacs_${name}`);

export const image = createTable('images', {
  id: char('id', { length: 255 }).primaryKey().notNull(),
  type: mysqlEnum('type', ['image', 'video']).notNull(),
  createdAt: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const imageRelations = relations(image, ({ many }) => ({
  tags: many(tags),
}));

export const tags = createTable('tags', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  imageId: char('image_id', { length: 255 }).notNull(),
  tag: varchar('tag', { length: 255 }).notNull(),
  createdAt: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const tagsRelations = relations(tags, ({ one }) => ({
  image: one(image, {
    fields: [tags.imageId],
    references: [image.id],
  }),
}));
