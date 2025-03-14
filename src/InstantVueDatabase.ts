// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license

import {
  Auth,
  Storage,
  txInit,
  InstantCoreDatabase,
  init as core_init,
} from "@instantdb/core";
import type {
  AuthState,
  User,
  ConnectionStatus,
  TransactionChunk,
  RoomSchemaShape,
  InstaQLParams,
  PageInfoResponse,
  InstaQLResponse,
  RoomsOf,
  InstantSchemaDef,
  IInstantDatabase,
} from "@instantdb/core";
import { useQueryInternal } from "./useQuery";
import type { UseQueryInternalReturn } from "./useQuery";
import { computed, ref, shallowRef, toValue } from "vue";
import type { MaybeRefOrGetter, Ref, ShallowRef } from "vue";
import { tryOnScopeDispose } from "./utils";
import type { InstantConfig } from "./init";
import { InstantVueRoom, rooms } from "./InstantVueRoom";

type UseAuthReturn = { [K in keyof AuthState]: ShallowRef<AuthState[K]> };

export class InstantVueDatabase<
  Schema extends InstantSchemaDef<any, any, any>,
  Rooms extends RoomSchemaShape = RoomsOf<Schema>
> implements IInstantDatabase<Schema>
{
  public tx = txInit<Schema>();

  public auth: Auth;
  public storage: Storage;
  public _core: InstantCoreDatabase<Schema>;

  static Storage?: any;
  static NetworkListener?: any;

  static clientOnlyUseQuery?: boolean;

  constructor(
    config: InstantConfig<Schema>,
    versions?: { [key: string]: string }
  ) {
    const { __extra_vue, ..._config } = config;

    if (_config.clientOnlyUseQuery) {
      console.warn(
        `clientOnlyUseQuery is deprecated. use __extra_vue.clientOnlyUseQuery`
      );
    }

    this._core = core_init<Schema>(
      _config,
      // @ts-expect-error because TS can't resolve subclass statics
      this.constructor.Storage,
      // @ts-expect-error because TS can't resolve subclass statics
      this.constructor.NetworkListener,
      versions
    );
    this.auth = this._core.auth;
    this.storage = this._core.storage;
    // @ts-expect-error because TS can't resolve subclass statics
    this.constructor.clientOnlyUseQuery =
      !!__extra_vue?.clientOnlyUseQuery || !!_config.clientOnlyUseQuery;
  }

  getLocalId = (name: string) => {
    return this._core.getLocalId(name);
  };

  /**
   * Obtain a handle to a room, which allows you to listen to topics and presence data
   *
   * If you don't provide a `type` or `id`, Instant will default to `_defaultRoomType` and `_defaultRoomId`
   * as the room type and id, respectively.
   *
   * @see https://instantdb.com/docs/presence-and-topics
   *
   * @example
   *  const room = db.room('chat', roomId);
   *  const { peers } = db.rooms.usePresence(room);
   */
  room<RoomType extends keyof Rooms>(
    type?: MaybeRefOrGetter<RoomType | undefined>,
    id?: MaybeRefOrGetter<string | undefined>
  ) {
    const _type = computed(() => {
      return toValue(type) || ("_defaultRoomType" as RoomType);
    });
    const _id = computed(() => {
      return toValue(id) || "_defaultRoomId";
    });
    return new InstantVueRoom<Schema, Rooms, RoomType>(this._core, _type, _id);
  }

  /**
   * Hooks for working with rooms
   *
   * @see https://instantdb.com/docs/presence-and-topics
   *
   * @example
   *  const room = db.room('chat', roomId);
   *  const { peers } = db.rooms.usePresence(room);
   *  const publish = db.rooms.usePublishTopic(room, 'emoji');
   *  // ...
   */
  rooms = rooms;

  /**
   * Use this to write data! You can create, update, delete, and link objects
   *
   * @see https://instantdb.com/docs/instaml
   *
   * @example
   *   // Create a new object in the `goals` namespace
   *   const goalId = id();
   *   db.transact(tx.goals[goalId].update({title: "Get fit"}))
   *
   *   // Update the title
   *   db.transact(tx.goals[goalId].update({title: "Get super fit"}))
   *
   *   // Delete it
   *   db.transact(tx.goals[goalId].delete())
   *
   *   // Or create an association:
   *   todoId = id();
   *   db.transact([
   *    tx.todos[todoId].update({ title: 'Go on a run' }),
   *    tx.goals[goalId].link({todos: todoId}),
   *  ])
   */
  transact = (
    chunks: TransactionChunk<any, any> | TransactionChunk<any, any>[]
  ) => {
    return this._core.transact(chunks);
  };

  /**
   * Use this to query your data!
   *
   * @see https://instantdb.com/docs/instaql
   *
   * @example
   *  // listen to all goals
   *  db.useQuery({ goals: {} })
   *
   *  // goals where the title is "Get Fit"
   *  db.useQuery({ goals: { $: { where: { title: "Get Fit" } } } })
   *
   *  // all goals, _alongside_ their todos
   *  db.useQuery({ goals: { todos: {} } })
   *
   *  // skip if `user` is not logged in
   *  db.useQuery(auth.user ? { goals: {} } : null)
   */
  useQuery = <Q extends InstaQLParams<Schema>>(
    query: MaybeRefOrGetter<null | Q>
  ): UseQueryInternalReturn<Schema, Q> => {
    return useQueryInternal(
      this._core,
      query,
      // @ts-expect-error because TS can't resolve subclass statics
      this.constructor.clientOnlyUseQuery
    ).state;
  };

  /**
   * Listen for the logged in state. This is useful
   * for deciding when to show a login screen.
   *
   * Check out the docs for an example `Login` component too!
   *
   * @see https://instantdb.com/docs/auth
   * @example
   *  <script setup>
   *    const { isLoading, user, error } = db.useAuth()
   *  </script>
   *  <template>
   *    <div v-if="isLoading">Loading...</div>
   *    <div v-else-if="error">Uh oh! {error.message}</div>
   *    <Main v-else-if="user" user={user} />
   *    <Login v-else/>
   *  </template>
   */
  useAuth = (): UseAuthReturn & { stop: () => void } => {
    const initialState = this._core._reactor._currentUserCached;

    const state: UseAuthReturn & { stop: () => void } = {
      isLoading: ref(initialState.isLoading),
      user: shallowRef(initialState.user),
      error: shallowRef(initialState.error),
      stop: () => {},
    };
    const unsubscribe = this._core._reactor.subscribeAuth((resp: any) => {
      state.isLoading.value = false;
      state.user.value = resp.user;
      state.error.value = resp.error;
    });

    state.stop = () => {
      unsubscribe();
    };

    tryOnScopeDispose(() => {
      unsubscribe();
    });

    return state;
  };

  /**
   * One time query for the logged in state. This is useful
   * for scenarios where you want to know the current auth
   * state without subscribing to changes.
   *
   * @see https://instantdb.com/docs/auth
   * @example
   *   const user = await db.getAuth();
   *   console.log('logged in as', user.email)
   */
  getAuth = (): Promise<User | null> => {
    return this._core.getAuth();
  };

  /**
   * Listen for connection status changes to Instant. Use this for things like
   * showing connection state to users
   *
   * @see https://www.instantdb.com/docs/patterns#connection-status
   * @example
   *  <script setup>
   *    const connectionState =
   *      computed(() => (status.value === 'connecting' || status.value === 'opened'
   *        ? 'authenticating'
   *        : status.value === 'authenticated'
   *          ? 'connected'
   *          : status.value === 'closed'
   *            ? 'closed'
   *            : status.value === 'errored'
   *              ? 'errored'
   *              : 'unexpected state'));
   *  </script>
   *  <template>
   *    <div>Connection state: {connectionState}</div>
   *  </template>
   */
  useConnectionStatus = (): Ref<ConnectionStatus> => {
    const status = ref<ConnectionStatus>(
      this._core._reactor.status as ConnectionStatus
    );
    const unsubscribe = this._core.subscribeConnectionStatus((newStatus) => {
      status.value = newStatus;
    });

    tryOnScopeDispose(unsubscribe);

    return status;
  };

  /**
   * Use this for one-off queries.
   * Returns local data if available, otherwise fetches from the server.
   * Because we want to avoid stale data, this method will throw an error
   * if the user is offline or there is no active connection to the server.
   *
   * @see https://instantdb.com/docs/instaql
   *
   * @example
   *
   *  const resp = await db.queryOnce({ goals: {} });
   *  console.log(resp.data.goals)
   */
  queryOnce = <Q extends InstaQLParams<Schema>>(
    query: Q
  ): Promise<{
    data: InstaQLResponse<Schema, Q>;
    pageInfo: PageInfoResponse<Q>;
  }> => {
    return this._core.queryOnce(query);
  };
}
