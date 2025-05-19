import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MovieCardProps } from "@/types";
import StarRating from "@/components/StarRating";
import { useUser } from "@clerk/nextjs";
import { incrementViews } from "@/convex/movies";

function MovieCard({
  movieId,
  title,
  description,
  genre,
  rating,
  imgUrl,
}: MovieCardProps) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [showRating, setShowRating] = useState(false);
  const incrementViews = useMutation(api.movies.incrementViews);

  // Get user's rating for this movie (if logged in)
  const userRating = useQuery(api.ratings.getUserRating,
    isSignedIn ? { movieId } : "skip"
  );

  const handleViews = () => {
    incrementViews({movieId})
    router.push(`/movies/${movieId}`, { scroll: true });
  };

  const handleRatingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRating(true);
  };

  const handleRatingClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRating(false);
  };

  return (
    <div
      className="w-[250px] cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-105 relative z-10 hover:z-50"
      onClick={handleViews}
      onMouseLeave={() => setShowRating(false)}
    >
      <div className="flex flex-col bg-[#1a1a1a] rounded-lg overflow-hidden shadow-md">
        <Image
          src={imgUrl}
          alt={title}
          width={180}
          height={270}
          className="object-cover w-full h-[270px]"
        />
        <div className="p-2 flex flex-col gap-1">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-sm font-bold text-white-1 truncate">{title}</h1>
              <p className="text-xs text-gray-400">
                ⭐ {rating ? rating.toFixed(1) : "N/A"} / 5.0
              </p>
            </div>
            <button
              onClick={handleRatingClick}
              className="ml-2 text-yellow-400 hover:text-yellow-300"
              title="Rate this movie"
            >
              <StarRating
                movieId={movieId}
                initialRating={userRating && userRating.score || 0}
                size={18}
                readonly={true}
              />
            </button>
          </div>
          <p className="text-xs text-white-2 line-clamp-2">Genre: {genre}</p>
        </div>
      </div>

      Rating popup
      {showRating && (
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    bg-black/90 p-4 rounded-lg shadow-lg z-10 min-w-[200px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center gap-3">
            <h3 className="text-white font-semibold bg-gray-200 text-gray-800 px-2 py-1 rounded">
              Rate "{title}"
            </h3>
            <StarRating
              movieId={movieId}
              initialRating={userRating && userRating.score || 0}
              size={32}
            />
            <button
              className="mt-2 text-xs text-gray-400 hover:text-white"
              onClick={handleRatingClose}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieCard;