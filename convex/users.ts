import { ConvexError, v } from "convex/values";

import { internalMutation, query } from "./_generated/server";

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Remove sensitive information
    const { email, ...publicUser } = user;
    return publicUser;
  },
});

export const getUserById = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    return user;
  },
});

export const createOrUpdateUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    
    if (existingUser) {
      // Update the existing user
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
      });
      
      return existingUser._id;
    } else {
      // Create a new user
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl || "",
        joinedAt: Date.now(),
      });
      
      return userId;
    }
  },
});

export const updateUserProfile = internalMutation({
  args: {
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to update your profile");
    }
    
    // Find the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    // Prepare update data
    const updateData: Partial<{
      name: string;
      imageUrl: string;
      bio: string;
    }> = {};
    
    if (args.name !== undefined) updateData.name = args.name;
    if (args.imageUrl !== undefined) updateData.imageUrl = args.imageUrl;
    if (args.bio !== undefined) updateData.bio = args.bio;
    
    // Update the user
    await ctx.db.patch(user._id, updateData);
    
    return user._id;
  },
});

export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.delete(user._id);
  },
});

export const getTopUsersByMovieCount = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    const userData = await Promise.all(
      users.map(async (u) => {
        const movies = await ctx.db
          .query("movies")
          .filter((q) => q.eq(q.field("createdBy"), u._id))
          .collect();

        const sortedMovies = movies.sort((a, b) => b.views - a.views);

        return {
          ...u,
          totalMovies: movies.length,
          topMovies: sortedMovies.slice(0, 5).map((m) => ({
            movieTitle: m.title,
            movieId: m._id,
            // imgUrl: m.imageUrl!,
            // rating: m.rating,
            // genre: m.genre,
            // views: m.views,
            ...m
          })),
        };
      })
    );

    return userData.sort((a, b) => b.totalMovies - a.totalMovies);
  },
});
