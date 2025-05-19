"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProfileCardProps } from "@/types";

const ProfileCard = ({
  user,
  totalMovies,
  topMovies,
}: ProfileCardProps) => {
  const router = useRouter();

  const handleMovieClick = (movieId: string) => {
    router.push(`/movies/${movieId}`);
  };

  return (
    <div className="flex flex-col items-center md:flex-row gap-6 mt-6 bg-gray-800 p-6 rounded-lg shadow-lg">
      {/* User Profile Picture */}
      <Image
        src={user.imageUrl || "/default-profile.jpg"}
        width={150}
        height={150}
        alt={`${user.name}'s profile picture`}
        className="rounded-full border-4 border-gray-700"
      />

      {/* User Info */}
      <div className="flex flex-col items-center md:items-start flex-1">
        <h1 className="text-2xl font-bold text-white-1">{user.name}</h1>
        <p className="text-gray-400">{user.email}</p>
        <p className="mt-2 text-gray-300">
          Total Movies Created: <span className="font-semibold">{totalMovies}</span>
        </p>
      </div>

      {/* Top Movies */}
      {topMovies && topMovies.length > 0 && (
        <div className="mt-6 w-full">
          <h2 className="text-lg font-semibold text-white-1 mb-4">Top Movies:</h2>
          <ul className="space-y-2">
            {topMovies.map((movie) => (
              <li
                key={movie.movieId}
                className="cursor-pointer text-blue-400 hover:underline"
                onClick={() => handleMovieClick(movie.movieId)}
              >
                {movie.movieTitle}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;