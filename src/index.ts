// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license

import {
  id,
  tx,
  lookup,
  i,
  InstantAPIError,
  SyncTableCallbackEventType,
  StorageInterface,
} from "@instantdb/core";
import type {
  Config,
  QueryResponse,
  InstantQuery,
  InstantQueryResult,
  InstantSchema,
  InstantObject,
  InstantEntity,
  InstantSchemaDatabase,
  InstantUnknownSchemaDef,
  IInstantDatabase,
  IDatabase,
  User,
  AuthState,
  Query,
  InstaQLParams,
  InstaQLQueryParams,
  ConnectionStatus,
  ValidQuery,
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
  RoomsDef,
  PresenceOf,
  TopicsOf,
  TopicOf,
  RoomHandle,
  TransactionChunk,
  InstantUnknownSchema,
  InstantSchemaDef,
  BackwardsCompatibleSchema,
  InstantRules,
  UpdateParams,
  LinkParams,
  CreateParams,
  RuleParams,
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
  StorageInterfaceStoreName,
  // presence types
  PresencePeer,
  PresenceSlice,
  // attr types
  InstantDBAttr,
  InstantDBAttrOnDelete,
  InstantDBCheckedDataType,
  InstantDBIdent,
  InstantDBInferredType,
  // SSE types
  EventSourceType,
  // sync table types
  SyncTableCallback,
  SyncTableCallbackEvent,
  SyncTableInitialSyncBatch,
  SyncTableInitialSyncComplete,
  SyncTableSyncTransaction,
  SyncTableLoadFromStorage,
  SyncTableSetupError,
  // error types
  InstantIssue,
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
  // error
  InstantAPIError,
  // sync table
  SyncTableCallbackEventType,
  // storage interface
  StorageInterface,
};
export type {
  Config,
  InstantConfig,
  InstantUnknownSchemaDef,
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
  IDatabase,
  InstaQLParams,
  InstaQLQueryParams,
  ValidQuery,
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
  TransactionChunk,
  RoomsDef,
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
  CreateParams,
  RuleParams,
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
  StorageInterfaceStoreName,
  // presence types
  PresencePeer,
  PresenceSlice,
  // attr types
  InstantDBAttr,
  InstantDBAttrOnDelete,
  InstantDBCheckedDataType,
  InstantDBIdent,
  InstantDBInferredType,
  // SSE types
  EventSourceType,
  // sync table types
  SyncTableCallback,
  SyncTableCallbackEvent,
  SyncTableInitialSyncBatch,
  SyncTableInitialSyncComplete,
  SyncTableSyncTransaction,
  SyncTableLoadFromStorage,
  SyncTableSetupError,
  // error types
  InstantIssue,
  //
  CursorSchema,
};
