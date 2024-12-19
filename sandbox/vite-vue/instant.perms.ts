// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/core";

const rules = {
  /**
   * Welcome to Instant's permission system!
   * Right now your rules are empty. To start filling them in, check out the docs:
   * https://www.instantdb.com/docs/permissions
   *
   * Here's an example to give you a feel:
   * posts: {
   *   allow: {
   *     view: "true",
   *     create: "isOwner",
   *     update: "isOwner",
   *     delete: "isOwner",
   *   },
   *   bind: ["isOwner", "data.creator == auth.uid"],
   * },
   */
} satisfies InstantRules;

export default rules;
