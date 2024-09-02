// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license

import { onScopeDispose } from "vue";

export function useTimeout() {
  let timeout = null;

  function set(delay: number, fn: () => void) {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  }

  function clear() {
    clearTimeout(timeout);
  }

  onScopeDispose(() => {
    clear();
  });

  return { set, clear };
}
