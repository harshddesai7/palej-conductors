import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
    args: {
        orderNumber: v.string(),
        customer: v.string(),
        size: v.string(),
        material: v.string(),
        insulationType: v.string(),
        targetWeight: v.number(),
        speedMhr: v.number(),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("work_instructions", {
            ...args,
            timestamp: Date.now(),
        });
    },
});

export const list = query({
    handler: async (ctx) => {
        return await ctx.db.query("work_instructions").order("desc").collect();
    },
});

export const updateStatus = mutation({
    args: {
        id: v.id("work_instructions"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: args.status });
    },
});
