// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license

import type {
  Config as OriginalConfig,
  InstantConfig as OriginalInstantConfig,
  InstantGraph,
  RoomSchemaShape,
  InstantSchemaDef,
} from "@instantdb/core";
import { InstantVue } from "./InstantVue";

type ExtraConfig = {
  __extra_vue?: Partial<{
    clientOnlyUseQuery: boolean;
  }>;
};

type DeprecatedExtraConfig = Partial<{
  /** @deprecated use __extra_vue.clientOnlyUseQuery instead */
  clientOnlyUseQuery: boolean;
}>;

export type Config = OriginalConfig & ExtraConfig & DeprecatedExtraConfig;

export type InstantConfig<S extends InstantSchemaDef<any, any, any>> =
  OriginalInstantConfig<S> & ExtraConfig & DeprecatedExtraConfig;

export type ConfigWithSchema<S extends InstantGraph<any, any>> = Config & {
  schema: S;
};

/**
 *
 * The first step: init your application!
 *
 * Visit https://instantdb.com/dash to get your `appId` :)
 *
 * @example
 *  const db = init({ appId: "my-app-id" })
 *
 * // You can also provide a a schema for type safety and editor autocomplete!
 *
 *  type Schema = {
 *    goals: {
 *      title: string
 *    }
 *  }
 *
 *  const db = init<Schema>({ appId: "my-app-id" })
 *
 */
export function init<
  Schema extends {} = {},
  RoomSchema extends RoomSchemaShape = {}
>(config: Config) {
  //@ts-ignore TODO! same error in InstantReact with strict flag enabled
  return new InstantVue<Schema, RoomSchema>(config);
}

export function init_experimental<
  Schema extends InstantGraph<any, any, any>,
  WithCardinalityInference extends boolean = true
>(
  config: Config & {
    schema: Schema;
    cardinalityInference?: WithCardinalityInference;
  }
) {
  return new InstantVue<
    Schema,
    Schema extends InstantGraph<any, any, infer RoomSchema>
      ? RoomSchema
      : never,
    WithCardinalityInference
  >(config);
}
