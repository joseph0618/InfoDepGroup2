/* eslint-disable no-unused-vars */

import { Dispatch, SetStateAction } from "react";

import { Id } from "@/convex/_generated/dataModel";

export interface EmptyStateProps {
  title: string;
  search?: boolean;
  buttonText?: string;
  buttonLink?: string;
}
export interface ProfilePodcastProps {
  podcasts: any[]; // PodcastProps (I can't fix it!)
  listeners: number;
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
  description: string;
  movieId: Id<"movies">;
}

export interface RatingProps {
  movieId: Id<"movies">;
  userId: Id<"users">;
  score: number;
}

export interface GeneratePodcastProps {
  voiceType: string;
  setAudio: Dispatch<SetStateAction<string>>;
  audio: string;
  setAudioStorageId: Dispatch<SetStateAction<Id<"_storage"> | null>>;
  voicePrompt: string;
  setVoicePrompt: Dispatch<SetStateAction<string>>;
  setAudioDuration: Dispatch<SetStateAction<number>>;
}

export interface GenerateThumbnailProps {
  setImage: Dispatch<SetStateAction<string>>;
  setImageStorageId: Dispatch<SetStateAction<Id<"_storage"> | null>>;
  image: string;
  imagePrompt: string;
  setImagePrompt: Dispatch<SetStateAction<string>>;
}

export interface AudioProps {
  title: string;
  audioUrl: string;
  author: string;
  imageUrl: string;
  podcastId: string;
}

export interface AudioContextType {
  audio: AudioProps | undefined;
  setAudio: React.Dispatch<React.SetStateAction<AudioProps | undefined>>;
}
export interface ProfileCardProps {
  podcastData: ProfilePodcastProps;
  imageUrl: string;
  userFirstName: string;
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
  _id: Id<"movies">;
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