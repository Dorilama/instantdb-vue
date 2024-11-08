// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license

import { id, tx, lookup, i } from "@instantdb/core";
import type {
  QueryResponse,
  InstantQuery,
  InstantQueryResult,
  InstantSchema,
  InstantObject,
  InstantEntity,
  InstantSchemaDatabase,
  User,
  AuthState,
  Query,
  InstaQLQueryParams,
  // schema types
  AttrsDefs,
  CardinalityKind,
  DataAttrDef,
  EntitiesDef,
  EntitiesWithLinks,
  EntityDef,
  InstantGraph,
  LinkAttrDef,
  LinkDef,
  LinksDef,
  ResolveAttrs,
  ValueTypes,
} from "@instantdb/core";

import { InstantVue } from "./InstantVue";
import { init, init_experimental } from "./init";
import type { Config } from "./init";
import type { CursorSchema } from "./components";

export { id, tx, lookup, init, init_experimental, InstantVue, i };
export type {
  Config,
  Query,
  QueryResponse,
  InstantObject,
  User,
  AuthState,
  InstantQuery,
  InstantQueryResult,
  InstantSchema,
  InstantEntity,
  InstantSchemaDatabase,
  InstaQLQueryParams,
  // schema types
  AttrsDefs,
  CardinalityKind,
  DataAttrDef,
  EntitiesDef,
  EntitiesWithLinks,
  EntityDef,
  InstantGraph,
  LinkAttrDef,
  LinkDef,
  LinksDef,
  ResolveAttrs,
  ValueTypes,
  //
  CursorSchema,
};
