import { Config, Query, Exactly, InstantClient, TransactionChunk, Auth, RoomSchemaShape, Storage } from "@instantdb/core";
import { useQueryReturn } from "./useQuery";
import { MaybeRef } from "vue";
export declare class InstantVue<Schema = {}, RoomSchema extends RoomSchemaShape = {}> {
    auth: Auth;
    storage: Storage;
    _core: InstantClient<Schema, RoomSchema>;
    static Storage?: any;
    static NetworkListener?: any;
    constructor(config: Config);
    getLocalId: (name: string) => Promise<string>;
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
    transact: (chunks: TransactionChunk | TransactionChunk[]) => Promise<import("@instantdb/core").TransactionResult>;
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
    useQuery: <Q extends Query>(query: MaybeRef<Exactly<Query, Q> | null>) => useQueryReturn<Q, Schema>;
}
//# sourceMappingURL=InstantVue.d.ts.map