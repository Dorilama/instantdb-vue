import { init } from "@dorilama/instantdb-vue";

// Visit https://instantdb.com/dash to get your APP_ID :)
const APP_ID = import.meta.env["VITE_INSTANT_APP_ID"];

// Optional: Declare your schema for intellisense!
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
      name: string;
    };
    topics: {
      notification: { text: string };
    };
  };
};

export const db = init<Schema, RoomSchema>({ appId: APP_ID });
