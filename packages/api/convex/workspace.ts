import { v } from "convex/values";
import { mutation, query } from "./_generated/server.js";

export const one = query({
  args: {
    id: v.id("workspace"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("workspace").collect();
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const workspaceId = await ctx.db.insert("workspace", { name: args.name });
  },
});
