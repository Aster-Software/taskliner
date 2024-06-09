import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  workspace: defineTable({
    name: v.string(),
  }),
  project: defineTable({
    workspace_id: v.id("workspace"),
    name: v.string(),
    description: v.optional(v.string()),

    datetime_start: v.optional(v.float64()),
    datetime_end: v.optional(v.float64()),
  }),
  task: defineTable({
    workspace_id: v.id("workspace"),
    name: v.string(),
    description: v.optional(v.string()),

    datetime_start: v.optional(v.float64()),
    datetime_end: v.optional(v.float64()),

    status: v.optional(v.string()),
  }),
});
