import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const add = mutation({
    args: {
        competitorName: v.string(),
        material: v.string(),
        baseRate: v.number(),
        premium: v.number(),
        effectiveRate: v.number(),
        date: v.string(),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("competitor_rates", args);
    },
});

export const list = query({
    handler: async (ctx) => {
        return await ctx.db.query("competitor_rates").order("desc").collect();
    },
});
