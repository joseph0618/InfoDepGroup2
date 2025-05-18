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

    // Get the user's ID using the clerk ID (not email)
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Create the movie with all required fields
    const movieId = await ctx.db.insert("movies", {
      user: user._id,
      title: args.title,
      description: args.description,
      releaseYear: args.releaseYear,
      genre: args.genre,
      director: args.director,
      cast: args.cast,
      imageUrl: args.imageUrl,
      imageStorageId: args.imageStorageId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: user._id,
      views: 0,
      rating: 0, // Initialize rating to 0
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
    const movie = await ctx.db.get(args.movieId);

    const allRatings = await ctx.db
      .query("ratings")
      .filter((q) => q.eq(q.field("movieId"), args.movieId))
      .collect();

    const averageRating =
      allRatings.length > 0
        ? allRatings.reduce((sum, rating) => sum + rating.score, 0) /
        allRatings.length
        : 0;

    return {
      ...movie,
      rating: averageRating,
    };
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
    try {
      // Get all movies
      const movies = await ctx.db
        .query("movies")
        .order("desc")
        .collect();

      // Get all ratings to calculate averages
      const allRatings = await ctx.db
        .query("ratings")
        .collect();

      // Group ratings by movie ID and calculate averages
      const ratingsByMovie = new Map();

      for (const rating of allRatings) {
        const movieId = rating.movieId.toString();
        if (!ratingsByMovie.has(movieId)) {
          ratingsByMovie.set(movieId, { sum: 0, count: 0 });
        }
        const movieRating = ratingsByMovie.get(movieId);
        movieRating.sum += rating.score;
        movieRating.count += 1;
      }

      // Validate and transform data
      const validatedMovies = movies.map(movie => {
        // Calculate average rating
        const movieId = movie._id.toString();
        const ratingData = ratingsByMovie.get(movieId);
        const averageRating = ratingData
          ? ratingData.sum / ratingData.count
          : 0;

        return {
          ...movie,
          genre: movie.genre,
          imageUrl: movie.imageUrl || "/default-movie.jpg",
          rating: averageRating
        };
      });

      // Sort by rating (highest first) and views as secondary sort
      return validatedMovies.sort((a, b) => {
        // First sort by rating
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        // Then by views
        return b.views - a.views;
      });
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      return []; // Return empty array instead of throwing error
    }
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

    // Execute all searches in parallel
    const [directorResults, titleResults, descResults] = await Promise.all([
      ctx.db
        .query("movies")
        .withSearchIndex("search_director", q => q.search("director", args.search))
        .take(10),
      ctx.db
        .query("movies")
        .withSearchIndex("search_title", q => q.search("title", args.search))
        .take(10),
      ctx.db
        .query("movies")
        .withSearchIndex("search_body", q => q.search("description", args.search))
        .take(10)
    ]);

    // Combine all results
    const allResults = [...directorResults, ...titleResults, ...descResults];

    // Remove duplicates using a Map to track unique IDs (more efficient than .some())
    const uniqueMoviesMap = new Map();

    for (const movie of allResults) {
      // Convert _id to string for use as a Map key
      const idStr = movie._id.toString();
      if (!uniqueMoviesMap.has(idStr)) {
        uniqueMoviesMap.set(idStr, movie);
      }
    }

    // Convert Map values back to array
    const uniqueResults = Array.from(uniqueMoviesMap.values());

    const allRatings = await ctx.db.query("ratings").collect();

    // Group ratings by movie ID and calculate averages
    const ratingsByMovie = new Map();
    for (const rating of allRatings) {
      const movieId = rating.movieId.toString();
      if (!ratingsByMovie.has(movieId)) {
        ratingsByMovie.set(movieId, { sum: 0, count: 0 });
      }
      const movieRating = ratingsByMovie.get(movieId);
      movieRating.sum += rating.score;
      movieRating.count += 1;
    }

    // Add average rating to each movie
    const uniqueResultsWithRatings = uniqueResults.map((movie) => {
      const movieId = movie._id.toString();
      const ratingData = ratingsByMovie.get(movieId);
      const averageRating = ratingData ? ratingData.sum / ratingData.count : 0;
      return {
        ...movie,
        rating: averageRating,
      };
    });

    return uniqueResultsWithRatings.slice(0, 10);
  },
});

export const getUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
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

export const incrementViews = mutation({
  args: {
    movieId: v.id("movies"),
  },
  handler: async (ctx, args) => {
    // Get the movie
    const movie = await ctx.db.get(args.movieId);

    if (!movie) {
      throw new ConvexError("Movie not found");
    }

    // Increment the views
    return await ctx.db.patch(args.movieId, {
      views: (movie.views || 0) + 1,
      updatedAt: Date.now(),
    });
  },
});