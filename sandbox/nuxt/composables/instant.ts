import { init as instantInit } from "@dorilama/instantdb-vue";

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export type Schema = {
  todos: Todo;
};

export type RoomSchema = {
  chat: {
    presence: {
      userId: string;
      color: string;
      path: string;
    };
    topics: {
      emoji: { text: string; color?: string };
    };
  };
};

function init() {
  const config = useRuntimeConfig();
  const appId = config.public.instantAppId as string;
  return instantInit<Schema, RoomSchema>({ appId, clientOnlyUseQuery: true });
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
