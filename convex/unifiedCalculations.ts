import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const save = mutation({
    args: {
        material: v.optional(v.string()),
        shape: v.optional(v.string()),
        mode: v.optional(v.string()),
        insulationType: v.optional(v.string()),
        kV: v.optional(v.string()),
        answerHash: v.optional(v.string()),
        inputs: v.any(),
        results: v.any(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        return await ctx.db.insert("unified_calculations", {
            ...args,
            userId,
            saveMode: "MANUAL",
            timestamp: Date.now(),
        });
    },
});

export const autoSave = mutation({
    args: {
        material: v.optional(v.string()),
        shape: v.optional(v.string()),
        mode: v.optional(v.string()),
        insulationType: v.optional(v.string()),
        kV: v.optional(v.string()),
        answerHash: v.string(),
        inputs: v.any(),
        results: v.any(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Duplicate prevention: check if this hash already exists for this user
        const existing = await ctx.db
            .query("unified_calculations")
            .withIndex("by_answerHash", (q) => q.eq("answerHash", args.answerHash))
            .filter((q) => q.eq(q.field("userId"), userId))
            .first();

        if (existing) {
            return existing._id;
        }

        return await ctx.db.insert("unified_calculations", {
            ...args,
            userId,
            saveMode: "AUTO",
            timestamp: Date.now(),
        });
    },
});

export const listAll = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        // Return all users' records (admin-wide viewing as requested)
        return await ctx.db
            .query("unified_calculations")
            .withIndex("by_timestamp", (q) => q.gt("timestamp", 0))
            .order("desc")
            .collect();
    },
});

export const list = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        return await ctx.db
            .query("unified_calculations")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});
