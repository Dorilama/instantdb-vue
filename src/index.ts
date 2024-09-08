// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license

import { id, tx, lookup, i } from "@instantdb/core";
import type {
  QueryResponse,
  InstantQuery,
  InstantQueryResult,
  InstantObject,
  User,
  AuthState,
  Query,
  Config,
} from "@instantdb/core";

import { InstantVue } from "./InstantVue";
import { init, init_experimental } from "./init";
import type { CursorSchema } from "./components";

export { id, tx, lookup, init, init_experimental, InstantVue, i };
export type {
  QueryResponse,
  InstantQuery,
  InstantQueryResult,
  InstantObject,
  User,
  AuthState,
  Query,
  Config,
  CursorSchema,
};
