import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

/** Update the signed-in user's display name. */
export const updateProfile = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const user = await getCurrentUser(ctx);
    if (user === null) {
      throw new ConvexError({ code: "unauthorized" });
    }
    const clean = name.trim().replace(/\s+/g, " ").slice(0, 60);
    if (!clean) {
      throw new ConvexError({ code: "invalid-name" });
    }
    await ctx.db.patch(user._id, { name: clean });
    return { name: clean };
  },
});
