import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserById } from "./users";

// Get comments for a movie
export const getCommentsByMovie = query({
    args: {
      movieId: v.id("movies"),
      limit: v.optional(v.number()),  // explicitly declare optional limit
    },
    handler: async (ctx, args) => {
      const { movieId, limit = 20 } = args;
  
      // Check if the movie exists
      const movie = await ctx.db.get(movieId);
      if (!movie) throw new ConvexError("Movie not found");
  
      // Fetch comments for this movie ordered by date (newest first)
      const comments = await ctx.db
        .query("comments")
        .withIndex("by_movie_and_date", (q) => q.eq("movieId", movieId))
        .order("desc")
        .take(limit);
        
      // Append user info to each comment
      const commentsWithUsers = await Promise.all(
        comments.map(async (comment) => ({
          ...comment,
          user: await ctx.db.get(comment.userId),
        }))
      );
  
      return {
        comments: commentsWithUsers,
      };
    },
  });
  

// Add a comment to a movie
export const addComment = mutation({
  args: {
    movieId: v.id("movies"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to comment");
    }
    
    // Check if the movie exists
    const movie = await ctx.db.get(args.movieId);
    if (!movie) {
      throw new ConvexError("Movie not found");
    }
    
    // Get the user's ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    // Create the comment
    const commentId = await ctx.db.insert("comments", {
      movieId: args.movieId,
      userId: user._id,
      content: args.content,
      createdAt: Date.now(),
      likes: 0,
    });
    
    return commentId;
  },
});

// Update a comment
export const updateComment = mutation({
  args: {
    commentId: v.id("comments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to update a comment");
    }
    
    // Get the comment
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new ConvexError("Comment not found");
    }
    
    // Get the user's ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    // Check if the user is the author of the comment
    if (comment.userId !== user._id) {
      throw new ConvexError("You don't have permission to update this comment");
    }
    
    // Update the comment
    await ctx.db.patch(args.commentId, {
      content: args.content,
      updatedAt: Date.now(),
    });
    
    return args.commentId;
  },
});

// Delete a comment
export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    // Get the current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to delete a comment");
    }
    
    // Get the comment
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new ConvexError("Comment not found");
    }
    
    // Get the user's ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    // Check if the user is the author of the comment
    if (comment.userId !== user._id) {
      throw new ConvexError("You don't have permission to delete this comment");
    }
    
    // Delete the comment
    await ctx.db.delete(args.commentId);
    
    return args.commentId;
  },
});

// Like a comment
export const likeComment = mutation({
  args: {
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    // Get the current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to like a comment");
    }
    
    // Get the comment
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new ConvexError("Comment not found");
    }
    
    // Increment the like count
    await ctx.db.patch(args.commentId, {
      likes: (comment.likes || 0) + 1,
    });
    
    return args.commentId;
  },
});

// Get comments by user
export const getCommentsByUser = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    
    // Check if the user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    // Query comments for this user
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
    
    // Get movie info for each comment
    const commentsWithMovies = await Promise.all(
      comments.map(async (comment) => {
        const movie = await ctx.db.get(comment.movieId);
        return {
          ...comment,
          movie,
          user,
        };
      })
    );
    
    return commentsWithMovies;
  },
});