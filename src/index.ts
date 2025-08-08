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
  ConnectionStatus,
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
  InstaQLFields,
  InstaQLResult,
  InstaQLEntitySubquery,
  RoomsOf,
  PresenceOf,
  TopicsOf,
  TopicOf,
  RoomHandle,
  InstantUnknownSchema,
  InstantSchemaDef,
  BackwardsCompatibleSchema,
  InstantRules,
  UpdateParams,
  LinkParams,
  ExchangeCodeForTokenParams,
  SendMagicCodeParams,
  SendMagicCodeResponse,
  SignInWithIdTokenParams,
  VerifyMagicCodeParams,
  VerifyResponse,
  // storage types
  FileOpts,
  UploadFileResponse,
  DeleteFileResponse,
} from "@instantdb/core";

import InstantVueWebDatabase from "./InstantVueWebDatabase";
import InstantVueAbstractDatabase from "./InstantVueAbstractDatabase";
import { init, init_experimental } from "./init";
import type { InstantConfig } from "./init";
import type { CursorSchema } from "./components";

/**
 * @deprecated
 * Use `InstantVueWebDatabase`
 */
const InstantVueDatabase = InstantVueWebDatabase;

export {
  id,
  tx,
  lookup,
  init,
  init_experimental,
  InstantVueWebDatabase,
  InstantVueDatabase,
  i,
  // internal
  InstantVueAbstractDatabase,
};
export type {
  InstantConfig,
  Query,
  QueryResponse,
  InstantObject,
  User,
  AuthState,
  ConnectionStatus,
  InstantQuery,
  InstantQueryResult,
  InstantSchema,
  InstantEntity,
  InstantSchemaDatabase,
  IInstantDatabase,
  InstaQLParams,
  InstaQLFields,
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
  InstaQLEntitySubquery,
  RoomsOf,
  PresenceOf,
  TopicsOf,
  TopicOf,
  RoomHandle,
  InstantUnknownSchema,
  InstantSchemaDef,
  BackwardsCompatibleSchema,
  InstantRules,
  UpdateParams,
  LinkParams,
  ExchangeCodeForTokenParams,
  SendMagicCodeParams,
  SendMagicCodeResponse,
  SignInWithIdTokenParams,
  VerifyMagicCodeParams,
  VerifyResponse,
  // storage types
  FileOpts,
  UploadFileResponse,
  DeleteFileResponse,
  //
  CursorSchema,
};
