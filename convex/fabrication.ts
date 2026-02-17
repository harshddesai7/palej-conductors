import { query } from "./_generated/server";

export const list = query({
    handler: async (ctx) => {
        return await ctx.db.query("fabrication").order("desc").collect();
    },
});
