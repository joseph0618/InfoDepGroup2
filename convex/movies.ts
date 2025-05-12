import { mutation, query } from "./_generated/server";
import { ConvexError, convexToJson, v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { getUserByClerkId, getUserById } from "./users";

export const createMovie = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    releaseYear: v.optional(v.number()),
    genre: v.optional(v.array(v.string())),
    director: v.optional(v.string()),
    cast: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    // Get the current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to create a movie");
    }
    
    // Get the user's ID
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .collect();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    // Create the movie
    const movieId = await ctx.db.insert("movies", {
      ...args,
      user: user[0]._id,
      // title: args.title,
      // description: args.description,
      // releaseYear: args.releaseYear,
      // genre: args.genre,
      // director: args.director,
      // cast: args.cast,
      // imageUrl: args.imageUrl,
      // imageStorageId: args.imageStorageId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: user[0]._id,
      views: 0,
    });
    
    return movieId;
  },
});

export const updateMovie = mutation({
  args: {
    movieId: v.id("movies"),
    title: v.string(),
    description: v.string(),
    releaseYear: v.optional(v.number()),
    genre: v.optional(v.array(v.string())),
    director: v.optional(v.string()),
    cast: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const movie = await ctx.db.get(args.movieId);

    if (!movie) {
      throw new ConvexError("Movie not found");
    }

    return await ctx.db.patch(args.movieId, {
      ...args,
      updatedAt: Date.now(),
    });
  },
});

export const getMovieById = query({
  args: {
    movieId: v.id("movies"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.movieId);
  },
});

export const getMoviesByGenre = query({
  args: {
    movieId: v.id("movies"),
    genre: v.string(),
  },
  handler: async (ctx, args) => {
    const movie = await ctx.db.get(args.movieId);

    return await ctx.db
      .query("movies")
      .filter((q) =>
        q.and(
          q.eq(q.field("genre"), movie?.genre),
          q.neq(q.field("_id"), args.movieId),
        ),
      )
      .collect();
  },
});

export const getAllMovies = query({
  handler: async (ctx) => {
    return await ctx.db.query("movies").order("desc").collect();
  },
});

export const getMovieByDirector = query({
  args: {
    director: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("movies")
      .filter((q) => q.eq(q.field("director"), args.director))
      .collect();
  },
});


export const searchMovies = query({
  args: {
    search: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.search === "") {
      return await ctx.db.query("movies").order("desc").collect();
    }

    const authorSearch = await ctx.db
      .query("movies")
      .withSearchIndex("search_director", (q) => q.search("director", args.search))
      .take(10);

    if (authorSearch.length > 0) {
      return authorSearch;
    }

    const titleSearch = await ctx.db
      .query("movies")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.search),
      )
      .take(10);

    if (titleSearch.length > 0) {
      return titleSearch;
    }

    return await ctx.db
      .query("movies")
      .withSearchIndex("search_body", (q) =>
        q.search("description", args.search),
      )
      .take(10);
  },
});

export const deleteMovie = mutation({
  args: {
    movieId: v.id("movies"),
  },
  handler: async (ctx, args) => {
    // Get the current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to delete a movie");
    }
    // Get the movie
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
    // Check if the user is the creator of the movie
    if (movie.createdBy !== user._id) {
      throw new ConvexError("You don't have permission to delete this movie");
    }
    
    // Delete the movie
    await ctx.db.delete(args.movieId);
    
    // Delete all comments associated with this movie
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_movie", (q) => q.eq("movieId", args.movieId))
      .collect();
    
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }
    
    // Delete all ratings associated with this movie
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_movie", (q) => q.eq("movieId", args.movieId))
      .collect();
    
    for (const rating of ratings) {
      await ctx.db.delete(rating._id);
    }
    
    return args.movieId;
  }
});

