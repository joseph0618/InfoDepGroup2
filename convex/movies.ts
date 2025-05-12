import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { getUserById } from "./users";

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
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    // Create the movie
    const movieId = await ctx.db.insert("movies", {
      ...args,
      user: user._id,
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
      createdBy: user._id,
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
    genre: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    
    // Query movies with the specified genre
    const movies = await ctx.db
      .query("movies")
      .filter((q) => q.includes("genre", args.genre))
      .order("desc")
      .take(limit);
    
    // Get creator info for each movie
    const moviesWithCreators = await Promise.all(
      movies.map(async (movie) => {
        const creator = await getUserById(ctx, movie.createdBy);
        return {
          ...movie,
          creator,
        };
      })
    );
    
    return moviesWithCreators;
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
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    
    // Search by title
    const titleResults = await ctx.db
      .query("movies")
      .withSearchIndex("search_title", (q) => q.search("title", args.query))
      .take(limit);
    
    // Search by description
    const descriptionResults = await ctx.db
      .query("movies")
      .withSearchIndex("search_body", (q) => q.search("description", args.query))
      .take(limit);
    
    // Combine and deduplicate results
    const combinedResults = [...titleResults];
    for (const movie of descriptionResults) {
      if (!combinedResults.some((m) => m._id === movie._id)) {
        combinedResults.push(movie);
      }
    }
    
    // Get creator info for each movie
    const moviesWithCreators = await Promise.all(
      combinedResults.map(async (movie) => {
        const creator = await getUserById(ctx, movie.createdBy);
        return {
          ...movie,
          creator,
        };
      })
    );
    
    return moviesWithCreators.slice(0, limit);
  },
});


