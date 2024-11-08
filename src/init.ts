// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license

import type {
  Config as InstantConfig,
  InstantGraph,
  RoomSchemaShape,
} from "@instantdb/core";
import { InstantVue } from "./InstantVue";

export type Config = InstantConfig &
  Partial<{
    clientOnlyUseQuery: boolean;
  }>;

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
