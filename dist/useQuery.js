"use strict";
// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license
Object.defineProperty(exports, "__esModule", { value: true });
exports.useQuery = useQuery;
const core_1 = require("@instantdb/core");
const vue_1 = require("vue");
const noop = () => { };
function useQuery(_core, _query) {
    const query = (0, vue_1.computed)(() => {
        return _query ? (0, core_1.coerceQuery)((0, vue_1.toValue)(_query)) : null;
    });
    const queryHash = (0, vue_1.computed)(() => {
        return (0, core_1.weakHash)(query.value);
    });
    const state = {
        isLoading: (0, vue_1.ref)(true),
        data: (0, vue_1.shallowRef)(undefined),
        pageInfo: (0, vue_1.shallowRef)(undefined),
        error: (0, vue_1.shallowRef)(undefined),
    };
    let unsubscribe = noop;
    (0, vue_1.watch)(queryHash, () => {
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
    (0, vue_1.onScopeDispose)(() => {
        unsubscribe();
    });
    return { state, query };
}
//# sourceMappingURL=useQuery.js.map