// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license

import { id, tx, lookup } from "@instantdb/core";
import type {
  QueryResponse,
  InstantObject,
  User,
  AuthState,
  Query,
  Config,
  i,
} from "@instantdb/core";

import { InstantVue } from "./InstantVue";
import { init } from "./init";

export { id, tx, lookup, init, InstantVue };
export type { Config, Query, QueryResponse, InstantObject, User, AuthState, i };
