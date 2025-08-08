import type { InstantSchemaDef } from "@instantdb/core";
import type { InstantConfig } from "./init";
import InstantVueAbstractDatabase from "./InstantVueAbstractDatabase";

export default class InstantVueWebDatabase<
  Schema extends InstantSchemaDef<any, any, any>,
  Config extends InstantConfig<Schema, boolean> = InstantConfig<Schema, false>
> extends InstantVueAbstractDatabase<Schema, Config> {}
