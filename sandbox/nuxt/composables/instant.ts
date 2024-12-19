import { init as instantInit } from "@dorilama/instantdb-vue";
import type { InstaQLParams, InstaQLResult } from "@dorilama/instantdb-vue";
import schema from "../instant.schema";

const todosQuery = { todos: {} } satisfies InstaQLParams<typeof schema>;

type TodosResult = InstaQLResult<typeof schema, typeof todosQuery>;

export type Todo = TodosResult["todos"][number];

function init() {
  const config = useRuntimeConfig();
  const appId = config.public.instantAppId as string;
  return instantInit({
    appId,
    __extra_vue: { clientOnlyUseQuery: true },
    schema,
  });
}

let db: ReturnType<typeof init>;

export function useDb() {
  if (!db) {
    db = init();
  }

  return db;
}

export const useClientOnlyQuery: typeof db.useQuery = (query) => {
  const db = useDb();
  if (typeof window === "undefined") {
    return {
      isLoading: ref(true),
      data: shallowRef(undefined),
      pageInfo: shallowRef(undefined),
      error: shallowRef(undefined),
      stop: () => {},
    };
  }
  return db.useQuery(query);
};
