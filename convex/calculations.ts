import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const save = mutation({
    args: {
        type: v.string(),
        material: v.optional(v.string()),
        shape: v.optional(v.string()),
        inputs: v.any(),
        results: v.any(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        return await ctx.db.insert("calculations", {
            ...args,
            userId,
            timestamp: Date.now(),
        });
    },
});

export const list = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        return await ctx.db
            .query("calculations")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});
