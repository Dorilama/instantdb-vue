import { onScopeDispose, getCurrentScope } from "vue";

/*
MIT License

Copyright (c) 2019-PRESENT Anthony Fu<https://github.com/antfu>
*/
export function tryOnScopeDispose(fn: () => void) {
  if (getCurrentScope()) {
    onScopeDispose(fn);
    return true;
  }
  return false;
}

export type Arrayable<T> = T[] | T;
