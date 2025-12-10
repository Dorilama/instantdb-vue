// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license

import type { InstantSchemaDef } from "@instantdb/core";
import type { InstantConfig } from "./init";
import InstantVueAbstractDatabase from "./InstantVueAbstractDatabase";
import { EventSource } from "eventsource";

export default class InstantVueWebDatabase<
  Schema extends InstantSchemaDef<any, any, any>,
  UseDates extends boolean = false,
  Config extends InstantConfig<Schema, UseDates> = InstantConfig<Schema, UseDates>
> extends InstantVueAbstractDatabase<Schema, UseDates, Config> {
  static EventSourceImpl = EventSource;
}
