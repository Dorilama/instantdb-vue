// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
    }),
    docs: i.entity({
      text: i.string(),
    }),
    notes: i.entity({
      createdAt: i.any().optional(),
      text: i.string().optional(),
    }),
    todos: i.entity({
      createdAt: i.number(),
      done: i.boolean(),
      lastModified: i.date(),
      text: i.string(),
      textNew: i.string().optional(),
    }),
    user: i.entity({}),
  },
  links: {
    notesTodos: {
      forward: {
        on: "notes",
        has: "many",
        label: "todos",
      },
      reverse: {
        on: "todos",
        has: "one",
        label: "notes",
      },
    },
  },
  rooms: {
    chat: {
      presence: i.entity({
        color: i.string(),
        path: i.string(),
        userId: i.string(),
      }),
      topics: {
        emoji: i.entity({
          color: i.string().optional(),
          text: i.string(),
        }),
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
