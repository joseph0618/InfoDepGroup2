"use client";

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import MovieDetails from '@/components/MovieDetails';
import CommentSection from '@/components/CommentSection';
import { useRouter } from 'next/navigation';
import { CommentWithUser, Movie } from '@/types';

export default function MoviePage({ params }: { params: { movieId: string } }) {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  // Safely assert id type
  const movieId = params.movieId as Id<"movies">;

  // Fetch movie data
  const movie = useQuery(api.movies.getMovieById, { movieId });

  // Fetch comments
  const commentsData = useQuery(
    api.comments.getCommentsByMovie,
    { movieId, refreshKey}
  );

  const comments = commentsData?.comments || [];

  const handleCommentAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (movie === undefined) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading movie details...</div>
      </div>
    );
  }

  if (movie === null) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center">
        <div className="text-xl mb-4">Movie not found</div>
        <button 
          onClick={() => router.push('/movies')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <MovieDetails movie={movie as Movie}  />
      </div>
      
      <div className="mt-12 border-t pt-8">
        <CommentSection 
          comments={comments as CommentWithUser[]} 
          movieId={movie._id }
          onCommentAdded={handleCommentAdded}
        />
      </div>
    </div>
  );
}
