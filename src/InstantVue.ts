// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license

import {
  init as initCore,

  // types
  Config,
  Query,
  Exactly,
  AuthState,
  InstantClient,
  TransactionChunk,
  Auth,
  LifecycleSubscriptionState,
  PresenceOpts,
  PresenceResponse,
  RoomSchemaShape,
  Storage,
} from "@instantdb/core";
// import {
//   KeyboardEvent,
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
import { useQuery, UseQueryReturn } from "./useQuery";
import {
  MaybeRef,
  onScopeDispose,
  Ref,
  ref,
  shallowRef,
  ShallowRef,
  toValue,
  watchEffect,
} from "vue";
// import { useTimeout } from "./useTimeout";

type UseAuthReturn = { [K in keyof AuthState]: ShallowRef<AuthState[K]> };

// export type PresenceHandle<
//   PresenceShape,
//   Keys extends keyof PresenceShape
// > = PresenceResponse<PresenceShape, Keys> & {
//   publishPresence: (data: Partial<PresenceShape>) => void;
// };

// export type TypingIndicatorOpts = {
//   timeout?: number | null;
//   stopOnEnter?: boolean;
//   // Perf opt - `active` will always be an empty array
//   writeOnly?: boolean;
// };

// export type TypingIndicatorHandle<PresenceShape> = {
//   active: PresenceShape[];
//   setActive(active: boolean): void;
//   inputProps: {
//     onKeyDown: (e: KeyboardEvent) => void;
//     onBlur: () => void;
//   };
// };

type Arrayable<T> = T[] | T;

// export const defaultActivityStopTimeout = 1_000;

export class InstantReactRoom<
  Schema,
  RoomSchema extends RoomSchemaShape,
  RoomType extends keyof RoomSchema
> {
  _core: InstantClient<Schema, RoomSchema>;
  type: RoomType;
  id: Ref<string>;

  constructor(
    _core: InstantClient<Schema, RoomSchema>,
    type: RoomType,
    id: string
  ) {
    this._core = _core;
    this.type = type;
    this.id = ref(id);
  }

  /**
   * Listen for broadcasted events given a room and topic.
   *
   * @see https://instantdb.com/docs/presence-and-topics
   * @example
   *  function App({ roomId }) {
   *    db.room(roomType, roomId).useTopicEffect("chat", (message, peer) => {
   *      console.log("New message", message, 'from', peer.name);
   *    });
   *
   *    // ...
   *  }
   */
  useTopicEffect = <TopicType extends keyof RoomSchema[RoomType]["topics"]>(
    topic: MaybeRef<Arrayable<TopicType>>,
    onEvent: Arrayable<
      (
        event: RoomSchema[RoomType]["topics"][TopicType],
        peer: RoomSchema[RoomType]["presence"]
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
      const topicArray = Array.isArray(_topic) ? _topic : [_topic];
      const callbacks = Array.isArray(onEvent) ? onEvent : [onEvent];
      cleanup.push(
        ...topicArray.map((topicType) => {
          return this._core._reactor.subscribeTopic(
            this.id.value,
            topicType,
            (event, peer) => {
              callbacks.forEach((cb) => {
                cb(event, peer);
              });
            }
          );
        })
      );
      onCleanup(unsubscribe);
    });

    onScopeDispose(() => {
      stop();
    });

    return stop;
  };

  /**
   * Broadcast an event to a room.
   *
   * @see https://instantdb.com/docs/presence-and-topics
   * @example
   * function App({ roomId }) {
   *   const publishTopic = db.room(roomType, roomId).usePublishTopic("clicks");
   *
   *   return (
   *     <button onClick={() => publishTopic({ ts: Date.now() })}>Click me</button>
   *   );
   * }
   *
   */
  usePublishTopic = <Topic extends keyof RoomSchema[RoomType]["topics"]>(
    topic: MaybeRef<Topic>
  ): ((data: RoomSchema[RoomType]["topics"][Topic]) => void) => {
    const stopRoomWatch = watchEffect((onCleanup) => {
      const cleanup = this._core._reactor.joinRoom(this.id.value);
      onCleanup(cleanup);
    });

    let publishTopic = (data: RoomSchema[RoomType]["topics"][Topic]) => {};

    const stopTopicWatch = watchEffect(() => {
      publishTopic = (data: RoomSchema[RoomType]["topics"][Topic]) => {
        this._core._reactor.publishTopic({
          roomType: this.type,
          roomId: this.id.value,
          topic: toValue(topic),
          data,
        });
      };
    });

    onScopeDispose(() => {
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
   *  function App({ roomId }) {
   *    const {
   *      peers,
   *      publishPresence
   *    } = db.room(roomType, roomId).usePresence({ keys: ["name", "avatar"] });
   *
   *    // ...
   *  }
   */
  // usePresence = <Keys extends keyof RoomSchema[RoomType]["presence"]>(
  //   opts: PresenceOpts<RoomSchema[RoomType]["presence"], Keys> = {}
  // ): PresenceHandle<RoomSchema[RoomType]["presence"], Keys> => {
  //   const [state, setState] = useState<
  //     PresenceResponse<RoomSchema[RoomType]["presence"], Keys>
  //   >(() => {
  //     return (
  //       this._core._reactor.getPresence(this.type, this.id, opts) ?? {
  //         peers: {},
  //         isLoading: true,
  //       }
  //     );
  //   });

  //   useEffect(() => {
  //     const unsub = this._core._reactor.subscribePresence(
  //       this.type,
  //       this.id,
  //       opts,
  //       (data) => {
  //         setState(data);
  //       }
  //     );

  //     return unsub;
  //   }, [this.id, opts.user, opts.peers?.join(), opts.keys?.join()]);

  //   return {
  //     ...state,
  //     publishPresence: (data) => {
  //       this._core._reactor.publishPresence(this.type, this.id, data);
  //     },
  //   };
  // };

  /**
   * Publishes presence data to a room
   *
   * @see https://instantdb.com/docs/presence-and-topics
   * @example
   *  function App({ roomId }) {
   *    db.room(roomType, roomId).useSyncPresence({ name, avatar, color });
   *
   *    // ...
   *  }
   */
  // useSyncPresence = (
  //   data: Partial<RoomSchema[RoomType]["presence"]>,
  //   deps?: any[]
  // ): void => {
  //   useEffect(() => {
  //     return this._core._reactor.publishPresence(this.type, this.id, data);
  //   }, [this.type, this.id, deps ?? JSON.stringify(data)]);
  // };

  /**
   * Manage typing indicator state
   *
   * @see https://instantdb.com/docs/presence-and-topics
   * @example
   *  function App({ roomId }) {
   *    const {
   *      active,
   *      setActive,
   *      inputProps,
   *    } = db.room(roomType, roomId).useTypingIndicator("chat-input", opts);
   *
   *    return <input {...inputProps} />;
   *  }
   */
  // useTypingIndicator = (
  //   inputName: string,
  //   opts: TypingIndicatorOpts = {}
  // ): TypingIndicatorHandle<RoomSchema[RoomType]["presence"]> => {
  //   const timeout = useTimeout();

  //   const onservedPresence = this.usePresence({
  //     keys: [inputName],
  //   });

  //   const active = useMemo(() => {
  //     const presenceSnapshot = this._core._reactor.getPresence(
  //       this.type,
  //       this.id
  //     );

  //     return opts?.writeOnly
  //       ? []
  //       : Object.values(presenceSnapshot?.peers ?? {}).filter(
  //           (p) => p[inputName] === true
  //         );
  //   }, [opts?.writeOnly, onservedPresence]);

  //   const setActive = (isActive: boolean) => {
  //     this._core._reactor.publishPresence(this.type, this.id, {
  //       [inputName]: isActive,
  //     } as unknown as Partial<RoomSchema[RoomType]>);

  //     if (!isActive) return;

  //     if (opts?.timeout === null || opts?.timeout === 0) return;

  //     timeout.set(opts?.timeout ?? defaultActivityStopTimeout, () => {
  //       this._core._reactor.publishPresence(this.type, this.id, {
  //         [inputName]: null,
  //       } as Partial<RoomSchema[RoomType]>);
  //     });
  //   };

  //   return {
  //     active,
  //     setActive: (a: boolean) => {
  //       setActive(a);
  //     },
  //     inputProps: {
  //       onKeyDown: (e: KeyboardEvent) => {
  //         const isEnter = opts?.stopOnEnter && e.key === "Enter";
  //         const isActive = !isEnter;

  //         setActive(isActive);
  //       },
  //       onBlur: () => {
  //         setActive(false);
  //       },
  //     },
  //   };
  // };
}

export class InstantVue<Schema = {}, RoomSchema extends RoomSchemaShape = {}> {
  public auth: Auth;
  public storage: Storage;
  public _core: InstantClient<Schema, RoomSchema>;

  static Storage?: any;
  static NetworkListener?: any;

  constructor(config: Config) {
    this._core = initCore<Schema, RoomSchema>(
      config,
      // @ts-expect-error because TS can't resolve subclass statics
      this.constructor.Storage,
      // @ts-expect-error because TS can't resolve subclass statics
      this.constructor.NetworkListener
    );
    this.auth = this._core.auth;
    this.storage = this._core.storage;
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
  // room<RoomType extends keyof RoomSchema>(
  //   type: RoomType = "_defaultRoomType" as RoomType,
  //   id: string = "_defaultRoomId"
  // ) {
  //   return new InstantReactRoom<Schema, RoomSchema, RoomType>(
  //     this._core,
  //     type,
  //     id
  //   );
  // }

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
  transact = (chunks: TransactionChunk | TransactionChunk[]) => {
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
  useQuery = <Q extends Query>(
    query: MaybeRef<Exactly<Query, Q> | null>
  ): UseQueryReturn<Q, Schema> => {
    return useQuery(this._core, query).state;
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
   *
   *  <template>
   *    <div v-if="isLoading">Loading...</div>
   *    <div v-else-if="error">Uh oh! {error.message}</div>
   *    <Main v-else-if="user" user={user} />
   *    <Login v-else/>
   *  </template>
   *
   */
  useAuth = (): UseAuthReturn => {
    // (XXX): Don't set `isLoading` true if we already have data, would
    // be better to immediately show loaded data
    const state: UseAuthReturn = {
      isLoading: ref(true),
      user: shallowRef(undefined),
      error: shallowRef(undefined),
    };
    const unsubscribe = this._core._reactor.subscribeAuth((resp: any) => {
      state.isLoading.value = false;
      state.user.value = resp.user;
      state.error.value = resp.error;
    });

    onScopeDispose(() => {
      unsubscribe();
    });

    return state;
  };
}
