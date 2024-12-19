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
  ConnectionStatus,
  TransactionChunk,
  PresenceOpts,
  PresenceResponse,
  RoomSchemaShape,
  InstaQLParams,
  PageInfoResponse,
  InstaQLLifecycleState,
  InstaQLResponse,
  RoomsOf,
  InstantSchemaDef,
  IInstantDatabase,
} from "@instantdb/core";
import { useQueryInternal } from "./useQuery";
import type { UseQueryInternalReturn } from "./useQuery";
import { computed, ref, shallowRef, toValue, watch, watchEffect } from "vue";
import type { ComputedRef, MaybeRefOrGetter, Ref, ShallowRef } from "vue";
import { useTimeout } from "./useTimeout";
import { tryOnScopeDispose } from "./utils";
import type { InstantConfig } from "./init";

type UseAuthReturn = { [K in keyof AuthState]: ShallowRef<AuthState[K]> };

export type PresenceHandle<
  PresenceShape,
  Keys extends keyof PresenceShape,
  State = PresenceResponse<PresenceShape, Keys>
> = { [K in keyof State]: ShallowRef<State[K]> } & {
  publishPresence: (data?: Partial<PresenceShape>) => void;
  stop: () => void;
};

export type TypingIndicatorOpts = {
  timeout?: number | null;
  stopOnEnter?: boolean;
  // Perf opt - `active` will always be an empty array
  writeOnly?: boolean;
};

export type TypingIndicatorHandle<PresenceShape> = {
  active: Ref<PresenceShape[]>;
  setActive(active: boolean): void;
  inputProps: {
    onKeyDown: (e: KeyboardEvent) => void;
    onBlur: () => void;
  };
  stop: () => void;
};

type Arrayable<T> = T[] | T;

export const defaultActivityStopTimeout = 1_000;

export class InstantVueRoom<
  Schema extends InstantSchemaDef<any, any, any>,
  RoomSchema extends RoomSchemaShape,
  RoomType extends keyof RoomSchema
> {
  _core: InstantCoreDatabase<Schema>;
  type: ComputedRef<RoomType>;
  id: ComputedRef<string>;

  constructor(
    _core: InstantCoreDatabase<Schema>,
    type: ComputedRef<RoomType>,
    id: ComputedRef<string>
  ) {
    this._core = _core;
    this.type = type;
    this.id = id;
  }

  /**
   * Listen for broadcasted events given a room and topic.
   *
   * @see https://instantdb.com/docs/presence-and-topics
   * @example
   *  <script setup>
   *    const props = defineProps({roomId: String});
   *    db.room(roomType, roomId).useTopicEffect("chat", (message, peer) => {
   *      console.log("New message", message, 'from', peer.name);
   *    });
   *
   *    // ...
   *  </script>
   */
  useTopicEffect = <TopicType extends keyof RoomSchema[RoomType]["topics"]>(
    topic: MaybeRefOrGetter<Arrayable<TopicType>>,
    onEvent: Arrayable<
      (
        event: RoomSchema[RoomType]["topics"][TopicType],
        peer: RoomSchema[RoomType]["presence"],
        topic: TopicType
      ) => any
    >
  ): (() => void) => {
    const cleanup: (() => void)[] = [];
    function unsubscribe() {
      cleanup.forEach((fn) => fn());
      cleanup.length = 0;
    }
    const stop = watchEffect((onCleanup) => {
      const _topic = toValue(topic);
      const id = this.id.value;
      const topicArray = Array.isArray(_topic) ? _topic : [_topic];
      const callbacks = Array.isArray(onEvent) ? onEvent : [onEvent];
      cleanup.push(
        ...topicArray.map((topicType) => {
          return this._core._reactor.subscribeTopic(
            id,
            topicType,
            (
              event: RoomSchema[RoomType]["topics"][TopicType],
              peer: RoomSchema[RoomType]["presence"]
            ) => {
              callbacks.forEach((cb) => {
                cb(event, peer, topicType);
              });
            }
          );
        })
      );
      onCleanup(unsubscribe);
    });

    tryOnScopeDispose(() => {
      stop();
    });

    return stop;
  };

  /**
   * Broadcast an event to a room.
   *
   * @see https://instantdb.com/docs/presence-and-topics
   * @example
   *  <script setup>
   *    const props = defineProps({roomId: String});
   *    const publishTopic = db.room(roomType, roomId).usePublishTopic("clicks");
   *  </script>
   *  <template>
   *    <button @click="() => publishTopic({ ts: Date.now() })">Click me</button>
   *  </template>
   */
  usePublishTopic = <Topic extends keyof RoomSchema[RoomType]["topics"]>(
    topic: MaybeRefOrGetter<Topic>
  ): ((data: RoomSchema[RoomType]["topics"][Topic]) => void) => {
    const stopRoomWatch = watchEffect((onCleanup) => {
      const id = this.id.value;
      const cleanup = this._core._reactor.joinRoom(id);
      onCleanup(cleanup);
    });

    let publishTopic = (data: RoomSchema[RoomType]["topics"][Topic]) => {};

    const stopTopicWatch = watchEffect(() => {
      const id = this.id.value;
      const type = this.type.value;
      const _topic = toValue(topic);
      publishTopic = (data: RoomSchema[RoomType]["topics"][Topic]) => {
        this._core._reactor.publishTopic({
          roomType: type,
          roomId: id,
          topic: _topic,
          data,
        });
      };
    });

    tryOnScopeDispose(() => {
      stopRoomWatch();
      stopTopicWatch();
    });

    return publishTopic;
  };

  /**
   * Listen for peer's presence data in a room, and publish the current user's presence.
   *
   * @see https://instantdb.com/docs/presence-and-topics
   * @example
   *  <script setup>
   *    const props = defineProps({roomId: String});
   *    const {
   *      peers,
   *      publishPresence
   *    } = db.room(roomType, roomId).usePresence({ keys: ["name", "avatar"] });
   *
   *    // ...
   *  </script>
   */
  usePresence = <Keys extends keyof RoomSchema[RoomType]["presence"]>(
    opts: MaybeRefOrGetter<
      PresenceOpts<RoomSchema[RoomType]["presence"], Keys>
    > = {}
  ): PresenceHandle<RoomSchema[RoomType]["presence"], Keys> => {
    const getInitialState = (): PresenceResponse<
      RoomSchema[RoomType]["presence"],
      Keys
    > => {
      const presence = this._core._reactor.getPresence(
        this.type.value,
        this.id.value,
        toValue(opts)
      ) ?? {
        peers: {},
        isLoading: true,
      };

      return {
        peers: presence.peers,
        isLoading: !!presence.isLoading,
        user: presence.user,
        error: presence.error,
      };
    };

    const state = {
      peers: shallowRef({}),
      isLoading: ref(false),
      user: shallowRef(undefined),
      error: shallowRef(undefined),
    };

    const stop = watchEffect((onCleanup) => {
      const id = this.id.value;
      const type = this.type.value;
      const _opts = toValue(opts);

      Object.entries(getInitialState()).forEach(([key, value]) => {
        state[
          key as keyof PresenceResponse<RoomSchema[RoomType]["presence"], Keys>
        ].value = value;
      });

      // @instantdb/core v0.14.30 removes types for subscribePresence
      // trying to restore types until fixed in core
      // by adding type to parameter in callback
      const unsubscribe = this._core._reactor.subscribePresence(
        type,
        id,
        _opts,
        (data: PresenceResponse<RoomSchema[RoomType]["presence"], Keys>) => {
          Object.entries(data).forEach(([key, value]) => {
            state[
              key as keyof PresenceResponse<
                RoomSchema[RoomType]["presence"],
                Keys
              >
            ].value = value;
          });
        }
      );
      onCleanup(unsubscribe);
    });

    tryOnScopeDispose(() => {
      stop();
    });

    return {
      ...state,
      publishPresence: (data) => {
        this._core._reactor.publishPresence(
          this.type.value,
          this.id.value,
          data
        );
      },
      stop,
    };
  };

  /**
   * Publishes presence data to a room
   *
   * @see https://instantdb.com/docs/presence-and-topics
   * @example
   *  <script setup>
   *    const props = defineProps({roomId: String});
   *    db.room(roomType, roomId).useSyncPresence({ name, avatar, color });
   *
   *    // ...
   *  </script>
   */
  useSyncPresence = (
    data: MaybeRefOrGetter<
      Partial<RoomSchema[RoomType]["presence"] | undefined>
    >,
    deps?: MaybeRefOrGetter<any[]>
  ): (() => void) => {
    const stopRoomWatch = watchEffect((onCleanup) => {
      const id = this.id.value;
      const cleanup = this._core._reactor.joinRoom(id);
      onCleanup(cleanup);
    });

    const stopEffect = watchEffect(() => {
      const id = this.id.value;
      const type = this.type.value;
      const _data = toValue(data);
      this._core._reactor.joinRoom(id);
      this._core._reactor.publishPresence(type, id, _data);
      toValue(deps);
    });

    function stop() {
      stopRoomWatch();
      stopEffect();
    }

    tryOnScopeDispose(() => {
      stop();
    });

    return stop;
  };

  /**
   * Manage typing indicator state
   *
   * @see https://instantdb.com/docs/presence-and-topics
   * @example
   *  <script setup>
   *    const props = defineProps({roomId: String});
   *    const {
   *      active,
   *      setActive,
   *      inputProps,
   *    } = db.room(roomType, roomId).useTypingIndicator("chat-input", opts);
   *  </script>
   *  <template>
   *    <input @blur="inputProps.onBlur" @keydown="inputProps.onKeyDown"/>
   *  </template>
   */
  useTypingIndicator = (
    inputName: MaybeRefOrGetter<string>,
    opts: MaybeRefOrGetter<TypingIndicatorOpts> = {}
  ): TypingIndicatorHandle<RoomSchema[RoomType]["presence"]> => {
    const timeout = useTimeout();

    const _inputName = toValue(inputName);

    //@ts-ignore TODO! same error in InstantReact
    const onservedPresence = this.usePresence(() => ({
      keys: [toValue(inputName)],
    }));

    const active = computed(() => {
      const presenceSnapshot = this._core._reactor.getPresence(
        this.type.value,
        this.id.value
      );
      onservedPresence.peers.value;

      return toValue(opts)?.writeOnly
        ? []
        : Object.values(presenceSnapshot?.peers ?? {}).filter(
            //@ts-ignore TODO! same error in InstantReact
            (p) => p[_inputName] === true
          );
    });

    const setActive = (isActive: boolean) => {
      const _opts = toValue(opts);
      const _inputName = toValue(inputName);
      const id = this.id.value;
      const type = this.type.value;
      this._core._reactor.publishPresence(type, id, {
        [_inputName]: isActive,
      } as unknown as Partial<RoomSchema[RoomType]>);

      if (!isActive) return;

      if (_opts?.timeout === null || _opts?.timeout === 0) return;

      timeout.set(_opts?.timeout ?? defaultActivityStopTimeout, () => {
        this._core._reactor.publishPresence(type, id, {
          [_inputName]: null,
        } as Partial<RoomSchema[RoomType]>);
      });
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const _opts = toValue(opts);
      const isEnter = _opts?.stopOnEnter && e.key === "Enter";
      const isActive = !isEnter;

      setActive(isActive);
    };

    function stop() {
      timeout.clear();
    }

    tryOnScopeDispose(() => {
      stop();
    });

    return {
      active,
      setActive,
      inputProps: {
        onKeyDown,
        onBlur: () => {
          setActive(false);
        },
      },
      stop,
    };
  };
}

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
   *  const {
   *   useTopicEffect,
   *   usePublishTopic,
   *   useSyncPresence,
   *   useTypingIndicator,
   * } = db.room(roomType, roomId);
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
