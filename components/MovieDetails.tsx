// components/MovieDetails.tsx
import Image from 'next/image';
import { Movie } from '@/types';
import { formatDistance } from 'date-fns';

interface MovieDetailsProps {
  movie: Movie;
}

export default function MovieDetails({ movie }: MovieDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/3 lg:w-1/4">
          <div className="relative h-72 md:h-96 w-full">
            {movie.imageUrl ? (
              <Image 
                src={movie.imageUrl} 
                alt={movie.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 md:w-2/3 lg:w-3/4">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-900">{movie.title}</h1>
            {movie.rating !== undefined && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                ★ {movie.rating.toFixed(1)}
              </span>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            {movie.releaseYear && <span>Released: {movie.releaseYear}</span>}
            {movie.director && <span className="ml-4">Director: {movie.director}</span>}
          </div>
          
          {movie.genre && movie.genre.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {movie.genre.map((genre, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
          
          <div className="mt-5">
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            <p className="mt-2 text-gray-600">{movie.description}</p>
          </div>
          
          {movie.cast && movie.cast.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900">Cast</h3>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {movie.cast.map((actor, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {actor}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6 text-sm flex items-center text-gray-500">
            <span>
              <span className="font-medium">{movie.views}</span> views
            </span>
            <span className="mx-2">•</span>
            <span>
              Added {formatDistance(movie.createdAt, Date.now(), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}