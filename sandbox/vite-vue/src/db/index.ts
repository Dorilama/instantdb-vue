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
      userId: string;
      color: string;
      path: string;
    };
    topics: {
      notification: { text: string };
    };
  };
};

export const db = init<Schema, RoomSchema>({ appId: APP_ID });
export const chatRoomoom = db.room("chat", "main");
