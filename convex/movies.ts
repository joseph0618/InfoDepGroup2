import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const getUrl = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

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
export const getMovieByGenre = query({  
  args: {
    genre: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("movies")
      .filter((q) => q.eq(q.field("genre"), args.genre))
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
export const getMovieBySearch = query({
  args: {
    search: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.search === "") {
      return await ctx.db.query("movies").order("desc").collect();
    }
    const directorSearch = await ctx.db
      .query("movies")
      .withSearchIndex("search_director", (q) => q.search("director", args.search))
      .take(10);
    if (directorSearch.length > 0) {
      return directorSearch;
    }
    const titleSearch = await ctx.db
      .query("movies")
      .withSearchIndex("search_title", (q) => q.search("title", args.search))
      .take(10);
    if (titleSearch.length > 0) {
      return titleSearch;
    }
    return await ctx.db
      .query("movies")
      .withSearchIndex("search_body", (q) =>
        q.search("description" || "title", args.search),
      )
      .take(10);
  },
});   

export const updatePodcastViews = mutation({
  args: {
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    const podcast = await ctx.db.get(args.podcastId);

    if (!podcast) {
      throw new ConvexError("Podcast not found");
    }

    return await ctx.db.patch(args.podcastId, {
      views: podcast.views + 1,
    });
  },
});

export const deletePodcast = mutation({
  args: {
    podcastId: v.id("podcasts"),
    imageStorageId: v.id("_storage"),
    audioStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const podcast = await ctx.db.get(args.podcastId);

    if (!podcast) {
      throw new ConvexError("Podcast not found");
    }

    await ctx.storage.delete(args.imageStorageId);
    await ctx.storage.delete(args.audioStorageId);
    return await ctx.db.delete(args.podcastId);
  },
});
