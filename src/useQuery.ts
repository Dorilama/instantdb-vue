// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license

import { weakHash, coerceQuery, InstantCoreDatabase } from "@instantdb/core";
import type {
  InstaQLParams,
  InstaQLOptions,
  InstaQLLifecycleState,
  InstantSchemaDef,
} from "@instantdb/core";
import { shallowRef, computed, toValue, watch, ref } from "vue";
import type { ShallowRef, MaybeRefOrGetter } from "vue";
import { tryOnScopeDispose } from "./utils";
import type { Extra } from "./init";

export type UseQueryInternalReturn<Schema, Q, UseDates extends boolean> = {
  [K in keyof InstaQLLifecycleState<Schema, Q, UseDates>]: ShallowRef<
    InstaQLLifecycleState<Schema, Q, UseDates>[K]
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
  Schema extends InstantSchemaDef<any, any, any>,
  UseDates extends boolean
>(
  _core: InstantCoreDatabase<Schema, UseDates>,
  _query: MaybeRefOrGetter<null | Q>,
  _opts?: MaybeRefOrGetter<InstaQLOptions | null>,
  extra?: Extra
): {
  state: UseQueryInternalReturn<Schema, Q, UseDates>;
  query: any;
} {
  const query = computed(() => {
    let __query = toValue(_query);
    const __opts = toValue(_opts);
    if (__query && __opts && "ruleParams" in __opts) {
      __query = { $$ruleParams: __opts["ruleParams"], ...__query };
    }
    return __query ? coerceQuery(__query) : null;
  });
  const queryHash = computed(() => {
    return weakHash(query.value);
  });

  const initialState = stateForResult(
    _core._reactor.getPreviousResult(query.value)
  );

  const state: UseQueryInternalReturn<Schema, Q, UseDates> = {
    isLoading: ref(initialState.isLoading),
    data: shallowRef(initialState.data),
    pageInfo: shallowRef(initialState.pageInfo),
    error: shallowRef(initialState.error),
    stop: () => {},
  };

  if (!extra?.clientOnlyUseQuery || _core._reactor.querySubs) {
    const stop = watch(
      queryHash,
      (_, __, onCleanup) => {
        const currentState = stateForResult(
          _core._reactor.getPreviousResult(query.value)
        );
        state.isLoading.value = currentState.isLoading;
        state.data.value = currentState.data;
        state.pageInfo.value = currentState.pageInfo;
        state.error.value = currentState.error;

        if (!query.value) {
          if (extra?.stopLoadingOnNullQuery) {
            state.isLoading.value = false;
          }
          return;
        }
        const unsubscribe = _core.subscribeQuery<Q, UseDates>(
          query.value,
          (result) => {
            state.isLoading.value = !Boolean(result);
            state.data.value = result.data;
            state.pageInfo.value = result.pageInfo;
            state.error.value = result.error;
          }
        );
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
