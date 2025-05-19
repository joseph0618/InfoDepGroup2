/* eslint-disable no-unused-vars */

import { Dispatch, SetStateAction } from "react";

import { Id } from "@/convex/_generated/dataModel";
import { StyledString } from "next/dist/build/swc";

export interface EmptyStateProps {
  title: string;
  search?: boolean;
  buttonText?: string;
  buttonLink?: string;
}

export interface ProfileMovieProps {
  title: string;
  description: string;
  releaseYear: string;
  genre: string;
  director: string;
  cast: string;
  imageUrl: string;
  imageStorageId: Id<"_storage"> | null;
}

export interface MovieCardProps {
  imgUrl: string;
  title: string;
  rating: number;
  genre: string[];
  description: string;
  movieId: Id<"movies">;
}

export interface RatingProps {
  movieId: Id<"movies">;
  userId: Id<"users">;
  score: number;
}

export interface GenerateThumbnailProps {
  setImage: Dispatch<SetStateAction<string>>;
  setImageStorageId: Dispatch<SetStateAction<Id<"_storage"> | null>>;
  image: string;
  imagePrompt: string;
  setImagePrompt: Dispatch<SetStateAction<string>>;
}

export interface ProfileCardProps {
  user: {
    name: string;
    email: string;
    imageUrl?: string;
  };
  totalMovies: number;
  topMovies: {
    movieId: Id<"movies">;
    movieTitle: string;
    // rating?: number;
    // genre?: string[];
    // description?: string;
    // imgUrl: string;
  }[];
}

export type UseDotButtonType = {
  selectedIndex: number;
  scrollSnaps: number[];
  onDotButtonClick: (index: number) => void;
};

// Movie-related types (based on your schema)
export interface User {
  _id: Id<"users">;
  email: string;
  imageUrl: string;
  clerkId: string;
  name: string;
  joinedAt: number;
}

export interface Movie {
  _id?: Id<"movies">;
  user: Id<"users">;
  title: string;
  description: string;
  director?: string;
  genre?: string[];
  cast?: string[];
  releaseYear?: number;
  imageUrl?: string;
  imageStorageId?: Id<"_storage">;
  createdAt: number;
  updatedAt?: number;
  createdBy: Id<"users">;
  views: number;
  rating?: number; // Calculated field, not in schema
}

export interface Comment {
  _id: Id<"comments">;
  movieId: Id<"movies">;
  userId: Id<"users">;
  content: string;
  createdAt: number;
  updatedAt?: number;
  likes: number;
  user?: User; // For displaying user info with comment
}

export interface CommentWithUser extends Comment {
  user: User;
}

export interface Rating {
  _id: Id<"ratings">;
  movieId: Id<"movies">;
  userId: Id<"users">;
  score: number;
  createdAt: number;
  updatedAt?: number;
}

export interface CarouselProps {
  topMovieCreators: Array<{
    _id: string;
    name: string;
    imageUrl: string;
    totalMovies: number;
    topMovies: Array<{
      movieId: Id<"movies">;
      movieTitle: string;
      imgUrl?: string;
    }>;
  }>;
}