// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license

import { weakHash, coerceQuery, i } from "@instantdb/core";
import type {
  Query,
  Exactly,
  InstantClient,
  LifecycleSubscriptionState,
  InstaQLQueryParams,
} from "@instantdb/core";
import { shallowRef, computed, toValue, watch, onScopeDispose, ref } from "vue";
import type { ShallowRef, MaybeRef } from "vue";

export type UseQueryReturn<
  Q,
  Schema,
  WithCardinalityInference extends boolean
> = {
  [K in keyof LifecycleSubscriptionState<
    Q,
    Schema,
    WithCardinalityInference
  >]: ShallowRef<
    LifecycleSubscriptionState<Q, Schema, WithCardinalityInference>[K]
  >;
};

const noop = () => {};

export function useQuery<
  Q extends Schema extends i.InstantGraph<any, any>
    ? InstaQLQueryParams<Schema>
    : //@ts-ignore TODO! same error in InstantReact with strict flag enabled
      Exactly<Query, Q>,
  Schema extends {} | i.InstantGraph<any, any, {}>,
  WithCardinalityInference extends boolean
>(
  _core: InstantClient<Schema, any, WithCardinalityInference>,
  _query: MaybeRef<null | Q>
): {
  state: UseQueryReturn<Q, Schema, WithCardinalityInference>;
  query: any;
  stop: () => void;
} {
  const query = computed(() => {
    return _query ? coerceQuery(toValue(_query)) : null;
  });
  const queryHash = computed(() => {
    return weakHash(query.value);
  });

  const state: UseQueryReturn<Q, Schema, WithCardinalityInference> = {
    isLoading: ref(true),
    data: shallowRef(undefined),
    pageInfo: shallowRef(undefined),
    error: shallowRef(undefined),
  };

  const stop = watch(
    queryHash,
    (_, __, onCleanup) => {
      if (!query.value) {
        return;
      }
      const unsubscribe = _core.subscribeQuery<Q>(query.value, (result) => {
        state.isLoading.value = !Boolean(result);
        state.data.value = result.data;
        state.pageInfo.value = result.pageInfo;
        state.error.value = result.error;
      });
      onCleanup(unsubscribe);
    },
    { immediate: true }
  );

  onScopeDispose(() => {
    stop();
  });

  return { state, query, stop };
}
