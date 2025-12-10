// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license

import type {
  PresenceOpts,
  PresenceResponse,
  RoomSchemaShape,
  InstantCoreDatabase,
  InstantSchemaDef,
} from "@instantdb/core";

import { computed, ref, shallowRef, toValue, watchEffect } from "vue";
import type { ComputedRef, MaybeRefOrGetter, Ref, ShallowRef } from "vue";

import { useTimeout } from "./useTimeout";
import { tryOnScopeDispose, type Arrayable } from "./utils";

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

export const defaultActivityStopTimeout = 1_000;

// ------
// #region Topics

/**
 * Listen for broadcasted events given a room and topic.
 *
 * @see https://instantdb.com/docs/presence-and-topics
 * @example
 *  <script setup>
 *    const props = defineProps({roomId: String});
 *    const room = db.room('chats', roomId);
 *    db.rooms.useTopicEffect(room, 'emoji', (message, peer) => {
 *      console.log(peer.name, 'sent', message);
 *    });
 *
 *    // ...
 *  </script>
 */
export function useTopicEffect<
  RoomSchema extends RoomSchemaShape,
  RoomType extends keyof RoomSchema,
  TopicType extends keyof RoomSchema[RoomType]["topics"]
>(
  room: InstantVueRoom<any, RoomSchema, RoomType>,
  topic: MaybeRefOrGetter<Arrayable<TopicType>>,
  onEvent: Arrayable<
    (
      event: RoomSchema[RoomType]["topics"][TopicType],
      peer: RoomSchema[RoomType]["presence"],
      topic: TopicType
    ) => any
  >
): () => void {
  const cleanup: (() => void)[] = [];

  function unsubscribe() {
    cleanup.forEach((fn) => fn());
    cleanup.length = 0;
  }

  const stop = watchEffect((onCleanup) => {
    const _topic = toValue(topic);
    const id = room.id.value;
    const topicArray = Array.isArray(_topic) ? _topic : [_topic];
    const callbacks = Array.isArray(onEvent) ? onEvent : [onEvent];
    cleanup.push(
      ...topicArray.map((topicType) => {
        return room.core._reactor.subscribeTopic(
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
}

/**
 * Broadcast an event to a room.
 *
 * @see https://instantdb.com/docs/presence-and-topics
 * @example
 *  <script setup>
 *    const props = defineProps({roomId: String});
 *    const room = db.room('chats', roomId);
 *    const publishTopic = db.rooms.usePublishTopic(room, "emoji");
 *  </script>
 *  <template>
 *    <button @click="() => publishTopic({ emoji: "🔥" })">Send emoji</button>
 *  </template>
 */
export function usePublishTopic<
  RoomSchema extends RoomSchemaShape,
  RoomType extends keyof RoomSchema,
  TopicType extends keyof RoomSchema[RoomType]["topics"]
>(
  room: InstantVueRoom<any, RoomSchema, RoomType>,
  topic: MaybeRefOrGetter<TopicType>
): (data: RoomSchema[RoomType]["topics"][TopicType]) => void {
  const stopRoomWatch = watchEffect((onCleanup) => {
    const id = room.id.value;
    const cleanup = room.core._reactor.joinRoom(id);
    onCleanup(cleanup);
  });

  let publishTopic = (data: RoomSchema[RoomType]["topics"][TopicType]) => {};

  const stopTopicWatch = watchEffect(() => {
    const id = room.id.value;
    const type = room.type.value;
    const _topic = toValue(topic);
    publishTopic = (data: RoomSchema[RoomType]["topics"][TopicType]) => {
      room.core._reactor.publishTopic({
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
}

// #endregion

// ---------
// #region Presence

/**
 * Listen for peer's presence data in a room, and publish the current user's presence.
 *
 * @see https://instantdb.com/docs/presence-and-topics
 * @example
 *  <script setup>
 *    const props = defineProps({roomId: String});
 *    const room = db.room('chats', roomId);
 *    const {
 *      peers,
 *      publishPresence
 *    } = db.rooms.usePresence(room, { keys: ["name", "avatar"] });
 *
 *    // ...
 *  </script>
 */
export function usePresence<
  RoomSchema extends RoomSchemaShape,
  RoomType extends keyof RoomSchema,
  Keys extends keyof RoomSchema[RoomType]["presence"]
>(
  room: InstantVueRoom<any, RoomSchema, RoomType>,
  opts: MaybeRefOrGetter<
    PresenceOpts<RoomSchema[RoomType]["presence"], Keys>
  > = {}
): PresenceHandle<RoomSchema[RoomType]["presence"], Keys> {
  const getInitialState = (): PresenceResponse<
    RoomSchema[RoomType]["presence"],
    Keys
  > => {
    const presence = room.core._reactor.getPresence(
      room.type.value,
      room.id.value,
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
    const id = room.id.value;
    const type = room.type.value;
    const _opts = toValue(opts);

    Object.entries(getInitialState()).forEach(([key, value]) => {
      state[
        key as keyof PresenceResponse<RoomSchema[RoomType]["presence"], Keys>
      ].value = value;
    });

    const unsubscribe = room.core._reactor.subscribePresence(
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
      room.core._reactor.publishPresence(room.type.value, room.id.value, data);
    },
    stop,
  };
}

/**
 * Publishes presence data to a room
 *
 * @see https://instantdb.com/docs/presence-and-topics
 * @example
 *  <script setup>
 *    const props = defineProps({roomId: String});
 *    const room = db.room('chats', roomId);
 *    db.rooms.useSyncPresence(room, { name, avatar, color });
 *
 *    // ...
 *  </script>
 */
export function useSyncPresence<
  RoomSchema extends RoomSchemaShape,
  RoomType extends keyof RoomSchema
>(
  room: InstantVueRoom<any, RoomSchema, RoomType>,
  data: MaybeRefOrGetter<Partial<RoomSchema[RoomType]["presence"] | undefined>>,
  deps?: MaybeRefOrGetter<any[]>
): () => void {
  const stopJoinRoom = watchEffect((onCleanup) => {
    const id = room.id.value;
    const _data = toValue(data);
    const cleanup = room.core._reactor.joinRoom(id, _data);
    onCleanup(cleanup);
  });

  const stopPublishPresence = watchEffect(() => {
    const id = room.id.value;
    const type = room.type.value;
    const _data = toValue(data);
    toValue(deps);
    room.core._reactor.publishPresence(type, id, _data);
  });

  function stop() {
    stopJoinRoom();
    stopPublishPresence();
  }

  tryOnScopeDispose(() => {
    stop();
  });

  return stop;
}

// #endregion

// -----------------
// #region Typing Indicator

/**
 * Manage typing indicator state
 *
 * @see https://instantdb.com/docs/presence-and-topics
 * @example
 *  <script setup>
 *    const props = defineProps({roomId: String});
 *    const room = db.room('chats', roomId);
 *    const {
 *      active,
 *      setActive,
 *      inputProps,
 *    } = db.rooms.useTypingIndicator(room, "chat-input");
 *  </script>
 *  <template>
 *    <input @blur="inputProps.onBlur" @keydown="inputProps.onKeyDown"/>
 *  </template>
 */
export function useTypingIndicator<
  RoomSchema extends RoomSchemaShape,
  RoomType extends keyof RoomSchema
>(
  room: InstantVueRoom<any, RoomSchema, RoomType>,
  inputName: MaybeRefOrGetter<string>,
  opts: MaybeRefOrGetter<TypingIndicatorOpts> = {}
): TypingIndicatorHandle<RoomSchema[RoomType]["presence"]> {
  const timeout = useTimeout();

  const _inputName = toValue(inputName);

  const onservedPresence = rooms.usePresence(
    room,
    //@ts-ignore TODO! same error in InstantReact
    () => ({
      keys: [toValue(inputName)],
    })
  );

  const active = computed(() => {
    const presenceSnapshot = room.core._reactor.getPresence(
      room.type.value,
      room.id.value
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
    const id = room.id.value;
    const type = room.type.value;
    room.core._reactor.publishPresence(type, id, {
      [_inputName]: isActive,
    } as unknown as Partial<RoomSchema[RoomType]>);

    if (!isActive) return;

    if (_opts?.timeout === null || _opts?.timeout === 0) return;

    timeout.set(_opts?.timeout ?? defaultActivityStopTimeout, () => {
      room.core._reactor.publishPresence(type, id, {
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
}

// #endregion

// --------------
// #region Hooks
export const rooms = {
  useTopicEffect,
  usePublishTopic,
  usePresence,
  useSyncPresence,
  useTypingIndicator,
};

// #endregion

// ------------
// #region Class

export class InstantVueRoom<
  Schema extends InstantSchemaDef<any, any, any>,
  RoomSchema extends RoomSchemaShape,
  RoomType extends keyof RoomSchema
> {
  core: InstantCoreDatabase<Schema, boolean>;
  /** @deprecated use `core` instead */
  _core: InstantCoreDatabase<Schema, boolean>;
  type: ComputedRef<RoomType>;
  id: ComputedRef<string>;

  constructor(
    core: InstantCoreDatabase<Schema, boolean>,
    type: ComputedRef<RoomType>,
    id: ComputedRef<string>
  ) {
    this.core = core;
    this._core = core;
    this.type = type;
    this.id = id;
  }

  /**
   * @deprecated
   * `db.room(...).useTopicEffect` is deprecated. You can replace it with `db.rooms.useTopicEffect`.
   *
   * @example
   *
   * // Before
   * const room = db.room('chat', 'room-id');
   * room.useTopicEffect('emoji', (message, peer) => {  });
   *
   * // After
   * const room = db.room('chat', 'room-id');
   * db.rooms.useTopicEffect(room, 'emoji', (message, peer) => {  });
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
    return rooms.useTopicEffect(this, topic, onEvent);
  };

  /**
   * @deprecated
   * `db.room(...).usePublishTopic` is deprecated. You can replace it with `db.rooms.usePublishTopic`.
   *
   * @example
   *
   * // Before
   * const room = db.room('chat', 'room-id');
   * const publish = room.usePublishTopic('emoji');
   *
   * // After
   * const room = db.room('chat', 'room-id');
   * const publish = db.rooms.usePublishTopic(room, 'emoji');
   */
  usePublishTopic = <Topic extends keyof RoomSchema[RoomType]["topics"]>(
    topic: MaybeRefOrGetter<Topic>
  ): ((data: RoomSchema[RoomType]["topics"][Topic]) => void) => {
    return rooms.usePublishTopic(this, topic);
  };

  /**
   * @deprecated
   * `db.room(...).usePresence` is deprecated. You can replace it with `db.rooms.usePresence`.
   *
   * @example
   *
   * // Before
   * const room = db.room('chat', 'room-id');
   * const { peers } = room.usePresence({ keys: ["name", "avatar"] });
   *
   * // After
   * const room = db.room('chat', 'room-id');
   * const { peers } = db.rooms.usePresence(room, { keys: ["name", "avatar"] });
   */
  usePresence = <Keys extends keyof RoomSchema[RoomType]["presence"]>(
    opts: MaybeRefOrGetter<
      PresenceOpts<RoomSchema[RoomType]["presence"], Keys>
    > = {}
  ): PresenceHandle<RoomSchema[RoomType]["presence"], Keys> => {
    return rooms.usePresence(this, opts);
  };

  /**
   * @deprecated
   * `db.room(...).useSyncPresence` is deprecated. You can replace it with `db.rooms.useSyncPresence`.
   *
   * @example
   *
   * // Before
   * const room = db.room('chat', 'room-id');
   * room.useSyncPresence(room, { nickname });
   *
   * // After
   * const room = db.room('chat', 'room-id');
   * db.rooms.useSyncPresence(room, { nickname });
   */
  useSyncPresence = (
    data: MaybeRefOrGetter<
      Partial<RoomSchema[RoomType]["presence"] | undefined>
    >,
    deps?: MaybeRefOrGetter<any[]>
  ): (() => void) => {
    return rooms.useSyncPresence(this, data, deps);
  };

  /**
   * @deprecated
   * `db.room(...).useTypingIndicator` is deprecated. You can replace it with `db.rooms.useTypingIndicator`.
   *
   * @example
   *
   * // Before
   * const room = db.room('chat', 'room-id');
   * const typing = room.useTypingIndiactor(room, 'chat-input');
   *
   * // After
   * const room = db.room('chat', 'room-id');
   * const typing = db.rooms.useTypingIndiactor(room, 'chat-input');
   */
  useTypingIndicator = (
    inputName: MaybeRefOrGetter<string>,
    opts: MaybeRefOrGetter<TypingIndicatorOpts> = {}
  ): TypingIndicatorHandle<RoomSchema[RoomType]["presence"]> => {
    return rooms.useTypingIndicator(this, inputName, opts);
  };
}

// #endregion
