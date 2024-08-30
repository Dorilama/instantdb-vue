// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license

import {
  weakHash,
  coerceQuery,
  Query,
  Exactly,
  InstantClient,
  LifecycleSubscriptionState,
} from "@instantdb/core";
import {
  shallowRef,
  computed,
  toValue,
  watch,
  onScopeDispose,
  ShallowRef,
  MaybeRef,
  ref,
} from "vue";

export type UseQueryReturn<Q, Schema> = {
  [K in keyof LifecycleSubscriptionState<Q, Schema>]: ShallowRef<
    LifecycleSubscriptionState<Q, Schema>[K]
  >;
};

const noop = () => {};

export function useQuery<Q extends Query, Schema>(
  _core: InstantClient<Schema>,
  _query: MaybeRef<Exactly<Query, Q> | null>
): { state: UseQueryReturn<Q, Schema>; query: any; stop: () => void } {
  const query = computed(() => {
    return _query ? coerceQuery(toValue(_query)) : null;
  });
  const queryHash = computed(() => {
    return weakHash(query.value);
  });

  const state: UseQueryReturn<Q, Schema> = {
    isLoading: ref(true),
    data: shallowRef(undefined),
    pageInfo: shallowRef(undefined),
    error: shallowRef(undefined),
  };

  let unsubscribe = noop;

  const stopWatch = watch(
    queryHash,
    () => {
      unsubscribe();
      if (!query.value) {
        unsubscribe = noop;
        return;
      }
      unsubscribe = _core.subscribeQuery<Q>(query.value, (result) => {
        state.isLoading.value = !Boolean(result);
        state.data.value = result.data;
        state.pageInfo.value = result.pageInfo;
        state.error.value = result.error;
      });
    },
    { immediate: true }
  );

  function stop() {
    stopWatch();
    unsubscribe();
  }

  onScopeDispose(() => {
    stop();
  });

  return { state, query, stop };
}
