import {
  init,
  type InstaQLParams,
  InstaQLResult,
} from "@dorilama/instantdb-vue";

import _schema from "../../instant.schema";

export const schema = _schema;

// Visit https://instantdb.com/dash to get your APP_ID :)
const APP_ID = import.meta.env["VITE_INSTANT_APP_ID"];

export const db = init({ appId: APP_ID, schema, useDateObjects: true });
export const chatRoom = db.room("chat", "dev");

const todosQuery = { todos: {} } satisfies InstaQLParams<typeof schema>;

type TodosResult = InstaQLResult<typeof schema, typeof todosQuery, true>;

export type Todo = TodosResult["todos"][number];
