import { weakHash, getInfiniteQueryInitialSnapshot } from "@instantdb/core";
import type {
  InstaQLResponse,
  ValidQuery,
  InfiniteQuerySubscription,
  InstantCoreDatabase,
  InstantSchemaDef,
  InstaQLOptions,
} from "@instantdb/core";
import { shallowRef, toValue, watch, ref } from "vue";
import type { ShallowRef, Ref, MaybeRefOrGetter } from "vue";
import { tryOnScopeDispose } from "./utils";

type InfiniteQueryResultBase<
  Schema extends InstantSchemaDef<any, any, any>,
  Q extends ValidQuery<Q, Schema>,
  UseDates extends boolean,
> =
  | {
      error: { message: string };
      data: undefined;
      isLoading: false;
    }
  | {
      error: undefined;
      data: undefined;
      isLoading: true;
    }
  | {
      error: undefined;
      data: InstaQLResponse<Schema, Q, UseDates>;
      isLoading: false;
    };

type InfiniteQueryResultRef<
  Schema extends InstantSchemaDef<any, any, any>,
  Q extends ValidQuery<Q, Schema>,
  UseDates extends boolean,
> = {
  [K in keyof InfiniteQueryResultBase<Schema, Q, UseDates>]: ShallowRef<
    InfiniteQueryResultBase<Schema, Q, UseDates>[K]
  >;
} & { canLoadNextPage: Ref<boolean> };

export type InfiniteQueryResult<
  Schema extends InstantSchemaDef<any, any, any>,
  Q extends ValidQuery<Q, Schema>,
  UseDates extends boolean,
> = InfiniteQueryResultRef<Schema, Q, UseDates> & {
  loadNextPage: () => void;
  stop: () => void;
};

const defaultState = {
  error: undefined,
  data: undefined,
  isLoading: true,
  canLoadNextPage: false,
};

export function useInfiniteQuerySubscription<
  Schema extends InstantSchemaDef<any, any, any>,
  Q extends ValidQuery<Q, Schema>,
  UseDates extends boolean,
>({
  core,
  query,
  opts,
}: {
  core: InstantCoreDatabase<Schema, UseDates>;
  query: MaybeRefOrGetter<Q | null>;
  opts?: MaybeRefOrGetter<InstaQLOptions>;
}): InfiniteQueryResult<Schema, Q, UseDates> {
  const snapshot = getInfiniteQueryInitialSnapshot(
    core,
    toValue(query),
    toValue(opts),
  );

  let subRef: InfiniteQuerySubscription | null = null;

  const state: Omit<
    InfiniteQueryResult<Schema, Q, UseDates>,
    "loadNextPage" | "stop"
  > = {
    error: shallowRef(snapshot.error),
    data: shallowRef(snapshot.data),
    isLoading: ref(!snapshot.data && !snapshot.error),
    canLoadNextPage: ref(snapshot.canLoadNextPage),
  };

  const stop = watch(
    [() => weakHash(toValue(query)), () => weakHash(toValue(opts))],
    (_, __, onCleanup) => {
      subRef = null;
      state.error.value = undefined;
      state.data.value = undefined;
      state.isLoading.value = true;
      state.canLoadNextPage.value = false;

      const queryValue = toValue(query);

      if (!queryValue) {
        return;
      }

      const sub = core.subscribeInfiniteQuery(
        queryValue,
        (resp) => {
          state.error.value = resp.error;
          state.data.value = resp.data;
          state.isLoading.value = false;
          state.canLoadNextPage.value = resp.canLoadNextPage;
        },
        toValue(opts),
      );

      subRef = sub;

      onCleanup(() => {
        sub.unsubscribe();
        if (subRef === sub) {
          subRef = null;
        }
      });
    },
  );

  const loadNextPage = () => {
    subRef?.loadNextPage();
  };

  tryOnScopeDispose(() => {
    stop();
  });

  return {
    ...state,
    loadNextPage,
    stop,
  };
}
