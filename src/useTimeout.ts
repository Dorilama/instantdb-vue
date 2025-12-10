// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license

import { tryOnScopeDispose } from "./utils";

export function useTimeout() {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  function set(delay: number, fn: () => void) {
    clear();

    timeout = setTimeout(fn, delay);
  }

  function clear() {
    if (timeout) {
      clearTimeout(timeout);
    }
  }

  tryOnScopeDispose(() => {
    clear();
  });

  return { set, clear };
}
