// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license
import { weakHash, coerceQuery, } from "@instantdb/core";
import { shallowRef, computed, toValue, watch, onScopeDispose, ref, } from "vue";
const noop = () => { };
export function useQuery(_core, _query) {
    const query = computed(() => {
        return _query ? coerceQuery(toValue(_query)) : null;
    });
    const queryHash = computed(() => {
        return weakHash(query.value);
    });
    const state = {
        isLoading: ref(true),
        data: shallowRef(undefined),
        pageInfo: shallowRef(undefined),
        error: shallowRef(undefined),
    };
    let unsubscribe = noop;
    watch(queryHash, () => {
        unsubscribe();
        if (!query.value) {
            unsubscribe = noop;
            return;
        }
        unsubscribe = _core.subscribeQuery(query.value, (result) => {
            state.isLoading.value = !Boolean(result);
            state.data.value = result.data;
            state.pageInfo.value = result.pageInfo;
            state.error.value = result.error;
        });
    }, { immediate: true });
    onScopeDispose(() => {
        unsubscribe();
    });
    return { state, query };
}
//# sourceMappingURL=useQuery.js.map