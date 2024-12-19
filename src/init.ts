// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license

import type {
  InstantConfig as OriginalInstantConfig,
  InstantSchemaDef,
  InstantUnknownSchema,
} from "@instantdb/core";
import { InstantVueDatabase } from "./InstantVueDatabase";
import version from "./version";

type ExtraConfig = {
  __extra_vue?: Partial<{
    clientOnlyUseQuery: boolean;
  }>;
};

type DeprecatedExtraConfig = Partial<{
  /** @deprecated use __extra_vue.clientOnlyUseQuery instead */
  clientOnlyUseQuery: boolean;
}>;

export type InstantConfig<S extends InstantSchemaDef<any, any, any>> =
  OriginalInstantConfig<S> & ExtraConfig & DeprecatedExtraConfig;

/**
 *
 * The first step: init your application!
 *
 * Visit https://instantdb.com/dash to get your `appId` :)
 *
 * @example
 * import { init } from "@dorilama/instantdb-vue"
 *
 * const db = init({ appId: "my-app-id" })
 *
 * // You can also provide a a schema for type safety and editor autocomplete!
 *
 * import { init } from "@dorilama/instantdb-vue"
 * import schema from ""../instant.schema.ts";
 *
 * const db = init({ appId: "my-app-id", schema })
 *
 * // To learn more: https://instantdb.com/docs/modeling-data
 *
 */
export function init<
  Schema extends InstantSchemaDef<any, any, any> = InstantUnknownSchema
>(config: InstantConfig<Schema>) {
  return new InstantVueDatabase<Schema>(config, {
    "@dorilama/instantdb-vue": version,
  });
}

/**
 * @deprecated
 * `init_experimental` is deprecated. You can replace it with `init`.
 *
 * @example
 *
 * // Before
 * import { init_experimental } from "@dorilama/instantdb-vue"
 * const db = init_experimental({  ...  });
 *
 * // After
 * import { init } from "@dorilama/instantdb-vue"
 * const db = init({ ...  });
 */
export const init_experimental = init;
