import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const submitFeedback = mutation({
    args: {
        calculationId: v.id("calculations"),
        verdict: v.string(), // "RIGHT", "WRONG"
        inputsSnapshot: v.any(),
        selectionSnapshot: v.any(),
        resultsSnapshot: v.any(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        return await ctx.db.insert("feedback", {
            ...args,
            userId,
            timestamp: Date.now(),
        });
    },
});

export const listFeedback = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        return await ctx.db
            .query("feedback")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});
