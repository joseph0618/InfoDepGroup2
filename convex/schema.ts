import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  movies: defineTable({
    user: v.id("users"),
    title: v.string(),
    description: v.string(),
    director: v.optional(v.string()),
    genre: v.optional(v.array(v.string())),
    cast: v.optional(v.array(v.string())),
    releaseYear: v.optional(v.number()),
    
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    createdBy: v.id("users"),
    views: v.number(),
  })
    .searchIndex("search_director", { searchField: "director" })
    .searchIndex("search_title", { searchField: "title" })
    .searchIndex("search_body", { searchField: "description" }),

  users: defineTable({
    email: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    name: v.string(),
    joinedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  comments: defineTable({
    movieId: v.id("movies"),
    userId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    likes: v.number(),
  })
    .index("by_movie", ["movieId"])
    .index("by_user", ["userId"])
    .index("by_movie_and_date", ["movieId", "createdAt"]),

  ratings: defineTable({
    movieId: v.id("movies"),
    userId: v.id("users"),
    score: v.number(), 
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_movie", ["movieId"])
    .index("by_user", ["userId"])
    .index("unique_rating", ["movieId", "userId"]),
});
