import { Query, Exactly, InstantClient, LifecycleSubscriptionState } from "@instantdb/core";
import { ShallowRef, MaybeRef } from "vue";
export type useQueryReturn<Q, Schema> = {
    [K in keyof LifecycleSubscriptionState<Q, Schema>]: ShallowRef<LifecycleSubscriptionState<Q, Schema>[K]>;
};
export declare function useQuery<Q extends Query, Schema>(_core: InstantClient<Schema>, _query: MaybeRef<Exactly<Query, Q> | null>): {
    state: useQueryReturn<Q, Schema>;
    query: any;
};
//# sourceMappingURL=useQuery.d.ts.map