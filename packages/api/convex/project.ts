import { v } from "convex/values";
import { mutation, query } from "./_generated/server.js";

export const one = query({
  args: {
    workspace_id: v.id("workspace"),
    project_id: v.id("project"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.project_id);

    if (project === null) throw new Error();

    return project;
  },
});

export const get = query({
  args: {
    workspace_id: v.id("workspace"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("project")
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
    const projectId = await ctx.db.insert("project", {
      workspace_id: args.workspace_id,
      name: args.name,
    });
  },
});
