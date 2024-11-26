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
  IInstantDatabase,
  User,
  AuthState,
  Query,
  InstaQLParams,
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
  InstaQLEntity,
  InstaQLResult,
  InstantUnknownSchema,
  InstantSchemaDef,
  BackwardsCompatibleSchema,
} from "@instantdb/core";

import { InstantVue } from "./InstantVue";
import { InstantVueDatabase } from "./InstantVueDatabase";
import { init, init_experimental } from "./init";
import type { Config, InstantConfig } from "./init";
import type { CursorSchema } from "./components";

export {
  id,
  tx,
  lookup,
  init,
  init_experimental,
  InstantVue,
  InstantVueDatabase,
  i,
};
export type {
  Config,
  InstantConfig,
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
  IInstantDatabase,
  InstaQLParams,
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
  InstaQLEntity,
  InstaQLResult,
  InstantUnknownSchema,
  InstantSchemaDef,
  BackwardsCompatibleSchema,
  //
  CursorSchema,
};
