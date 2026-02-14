import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const viewer = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) {
            return null;
        }
        return await ctx.db.get(userId);
    },
});

/**
 * Seeder to create the two initial users.
 * In a real app, you'd use a more secure way to set initial passwords,
 * but for this migration we'll use the user's requested default.
 */
export const seedUsers = mutation({
    args: {},
    handler: async (ctx) => {
        // Note: The @convex-dev/auth Password provider handles user creation 
        // through its own internal mechanisms, but we can pre-create users
        // or just let them sign up the first time.
        // For this specific request, we will ensure the user records exist.

        const users = [
            { email: "deepak@rediffmail.com", name: "Deepak" },
            { email: "workwithharshdesai@gmail.com", name: "Harsh" }
        ];

        for (const u of users) {
            const existing = await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", u.email))
                .unique();

            if (!existing) {
                await ctx.db.insert("users", {
                    email: u.email,
                    name: u.name,
                });
            }
        }
    },
});
