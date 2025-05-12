import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";

// Rate a movie
export const rateMovie = mutation({
  args: {
    movieId: v.id("movies"),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate rating score (1-5)
    if (args.score < 1 || args.score > 5) {
      throw new ConvexError("Rating score must be between 1 and 5");
    }
    
    // Get the current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to rate a movie");
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
    
    // Check if the user has already rated this movie
    const existingRating = await ctx.db
      .query("ratings")
      .withIndex("unique_rating", (q) => 
        q.eq("movieId", args.movieId).eq("userId", user._id)
      )
      .unique();
    
    if (existingRating) {
      // Update the existing rating
      await ctx.db.patch(existingRating._id, {
        score: args.score,
        updatedAt: Date.now(),
      });
      
      return existingRating._id;
    } else {
      // Create a new rating
      const ratingId = await ctx.db.insert("ratings", {
        movieId: args.movieId,
        userId: user._id,
        score: args.score,
        createdAt: Date.now(),
      });
      
      return ratingId;
    }
  },
});

// Get user's rating for a movie
export const getUserRating = query({
  args: {
    movieId: v.id("movies"),
  },
  handler: async (ctx, args) => {
    // Get the current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null; // Return null if not logged in
    }
    
    // Get the user's ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!user) {
      return null;
    }
    
    // Get the user's rating for this movie
    const rating = await ctx.db
      .query("ratings")
      .withIndex("unique_rating", (q) => 
        q.eq("movieId", args.movieId).eq("userId", user._id)
      )
      .unique();
    
    return rating;
  },
});

// Get average rating for a movie
export const getMovieRating = query({
  args: {
    movieId: v.id("movies"),
  },
  handler: async (ctx, args) => {
    // Check if the movie exists
    const movie = await ctx.db.get(args.movieId);
    if (!movie) {
      throw new ConvexError("Movie not found");
    }
    
    // Get all ratings for this movie
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_movie", (q) => q.eq("movieId", args.movieId))
      .collect();
    
    if (ratings.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
      };
    }
    
    // Calculate the average rating
    const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
    const average = sum / ratings.length;
    
    return {
      averageRating: parseFloat(average.toFixed(1)),
      totalRatings: ratings.length,
    };
  },
});

// Get all ratings by a user
export const getUserRatings = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    
    // Get the current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to see your ratings");
    }
    
    // Get the user's ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    // Get all ratings by this user
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);
    
    // Get movie info for each rating
    const ratingsWithMovies = await Promise.all(
      ratings.map(async (rating) => {
        const movie = await ctx.db.get(rating.movieId);
        
        if (!movie) {
          return null; // Skip if movie was deleted
        }
        
        return {
          ...rating,
          movie,
        };
      })
    );
    
    // Filter out any null values (in case a movie was deleted)
    return ratingsWithMovies.filter(Boolean);
  },
});

// Get top-rated movies
export const getTopRatedMovies = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    
    // Get all movies
    const movies = await ctx.db
      .query("movies")
      .collect();
    
    // Get ratings for each movie
    const moviesWithRatings = await Promise.all(
      movies.map(async (movie) => {
        const ratings = await ctx.db
          .query("ratings")
          .withIndex("by_movie", (q) => q.eq("movieId", movie._id))
          .collect();
        
        if (ratings.length === 0) {
          return {
            ...movie,
            averageRating: 0,
            totalRatings: 0,
          };
        }
        
        const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
        const average = sum / ratings.length;
        
        return {
          ...movie,
          averageRating: parseFloat(average.toFixed(1)),
          totalRatings: ratings.length,
        };
      })
    );
    
    // Sort by average rating (highest first)
    const sortedMovies = moviesWithRatings
      .filter((movie) => movie.totalRatings > 0) // Only include movies with ratings
      .sort((a, b) => b.averageRating - a.averageRating);
    
    // Get creator info for each movie
    const topMovies = await Promise.all(
      sortedMovies.slice(0, limit).map(async (movie) => {
        const creator = await ctx.db.get(movie.createdBy);
        return {
          ...movie,
          creator,
        };
      })
    );
    
    return topMovies;
  },
});