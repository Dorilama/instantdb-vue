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
import type { ShallowRef, MaybeRefOrGetter } from "vue";

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

function stateForResult(result: any) {
  return {
    isLoading: !Boolean(result),
    data: undefined,
    pageInfo: undefined,
    error: undefined,
    ...(result ? result : {}),
  };
}

export function useQuery<
  Q extends Schema extends i.InstantGraph<any, any>
    ? InstaQLQueryParams<Schema>
    : //@ts-ignore TODO! same error in InstantReact with strict flag enabled
      Exactly<Query, Q>,
  Schema extends {} | i.InstantGraph<any, any, {}>,
  WithCardinalityInference extends boolean
>(
  _core: InstantClient<Schema, any, WithCardinalityInference>,
  _query: MaybeRefOrGetter<null | Q>
): {
  state: UseQueryReturn<Q, Schema, WithCardinalityInference>;
  query: any;
  stop: () => void;
} {
  const query = computed(() => {
    const value = toValue(_query);
    return value ? coerceQuery(value) : null;
  });
  const queryHash = computed(() => {
    return weakHash(query.value);
  });

  const initialState = stateForResult(
    _core._reactor.getPreviousResult(query.value)
  );

  const state: UseQueryReturn<Q, Schema, WithCardinalityInference> = {
    isLoading: ref(initialState.isLoading),
    data: shallowRef(initialState.data),
    pageInfo: shallowRef(initialState.pageInfo),
    error: shallowRef(initialState.error),
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
