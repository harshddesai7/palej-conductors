import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    ...authTables,
    users: defineTable({
        name: v.optional(v.string()),
        image: v.optional(v.string()),
        email: v.optional(v.string()),
    }).index("by_email", ["email"]),
    fabrication: defineTable({
        externalId: v.optional(v.string()),
        date: v.optional(v.string()),
        size: v.string(),
        insulationType: v.string(),
        coveringThickness: v.string(),
        insulation1: v.optional(v.string()),
        insulation2: v.optional(v.string()),
        totalInsulation: v.optional(v.string()),
        material: v.string(),
        bareWeight: v.number(),
        finalQuantity: v.number(),
    }).index("by_insulationType", ["insulationType"]),
    calculations: defineTable({
        userId: v.string(), // auth.currentUser?._id
        type: v.string(), // "Unified", "Bare", "Factor", "LME"
        material: v.optional(v.string()),
        shape: v.optional(v.string()),
        inputs: v.any(),
        results: v.any(),
        timestamp: v.number(),
    }).index("by_userId", ["userId"]),
    competitor_rates: defineTable({
        competitorName: v.string(),
        material: v.string(), // "ALUMINIUM", "COPPER"
        baseRate: v.number(),
        premium: v.number(),
        effectiveRate: v.number(),
        date: v.string(),
        notes: v.optional(v.string()),
    }).index("by_competitor", ["competitorName"]),
    work_instructions: defineTable({
        orderNumber: v.string(),
        customer: v.string(),
        size: v.string(),
        material: v.string(),
        insulationType: v.string(),
        targetWeight: v.number(),
        speedMhr: v.number(),
        status: v.string(), // "PENDING", "ACTIVE", "COMPLETED"
        timestamp: v.number(),
    }).index("by_status", ["status"]),
});
