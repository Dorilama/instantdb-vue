// Docs: https://www.instantdb.com/docs/schema

import { i } from "@instantdb/core";

const _schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    todos: i.entity({
      text: i.string(),
      done: i.boolean(),
      createdAt: i.number(),
    }),
  },
  links: {},
  rooms: {
    chat: {
      presence: i.entity({
        userId: i.string(),
        color: i.string(),
        path: i.string(),
      }),
      topics: {
        emoji: i.entity({ text: i.string(), color: i.string().optional() }),
      },
    },
  },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
