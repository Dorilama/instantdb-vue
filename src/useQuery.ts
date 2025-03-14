// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license

import { weakHash, coerceQuery, InstantCoreDatabase } from "@instantdb/core";
import type {
  InstaQLParams,
  InstaQLLifecycleState,
  InstantSchemaDef,
} from "@instantdb/core";
import { shallowRef, computed, toValue, watch, ref } from "vue";
import type { ShallowRef, MaybeRefOrGetter } from "vue";
import { tryOnScopeDispose } from "./utils";

export type UseQueryInternalReturn<Schema, Q> = {
  [K in keyof InstaQLLifecycleState<Schema, Q>]: ShallowRef<
    InstaQLLifecycleState<Schema, Q>[K]
  >;
} & { stop: () => void };

function stateForResult(result: any) {
  return {
    isLoading: !Boolean(result),
    data: undefined,
    pageInfo: undefined,
    error: undefined,
    ...(result ? result : {}),
  };
}

export function useQueryInternal<
  Q extends InstaQLParams<Schema>,
  Schema extends InstantSchemaDef<any, any, any>
>(
  _core: InstantCoreDatabase<Schema>,
  _query: MaybeRefOrGetter<null | Q>,
  clientOnlyUseQuery?: boolean
): {
  state: UseQueryInternalReturn<Schema, Q>;
  query: any;
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

  const state: UseQueryInternalReturn<Schema, Q> = {
    isLoading: ref(initialState.isLoading),
    data: shallowRef(initialState.data),
    pageInfo: shallowRef(initialState.pageInfo),
    error: shallowRef(initialState.error),
    stop: () => {},
  };

  if (!clientOnlyUseQuery || _core._reactor.querySubs) {
    const stop = watch(
      queryHash,
      (_, __, onCleanup) => {
        if (!query.value) {
          state.isLoading.value = false;
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

    state.stop = stop;

    tryOnScopeDispose(() => {
      stop();
    });
  }

  return { state, query };
}
