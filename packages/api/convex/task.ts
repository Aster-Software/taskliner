import { v } from "convex/values";
import { mutation, query } from "./_generated/server.js";

export const one = query({
  args: {
    workspace_id: v.id("workspace"),
    task_id: v.id("project"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.task_id);

    if (task === null) throw new Error();

    return task;
  },
});

export const get = query({
  args: {
    workspace_id: v.id("workspace"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("task")
      .filter((x) => x.eq(x.field("workspace_id"), args.workspace_id))
      .collect();
  },
});

export const create = mutation({
  args: {
    workspace_id: v.id("workspace"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("task", {
      workspace_id: args.workspace_id,
      name: args.name,
    });
  },
});

export const update = mutation({
  args: {
    workspace_id: v.id("workspace"),
    task_id: v.id("task"),

    name: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const update = {} as typeof args;

    if (args.name !== undefined) update.name = args.name;
    if (args.status !== undefined) update.status = args.status;

    await ctx.db.patch(args.task_id, update);
  },
});
