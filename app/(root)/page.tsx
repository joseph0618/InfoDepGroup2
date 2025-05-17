"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import MovieCard from "@/components/MovieCard";
import { useState } from "react";

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const allMovies = useQuery(api.movies.getAllMovies);
  
  // Once movies are loaded, update the state
  if (allMovies && isLoading) {
    setIsLoading(false);
  }

  return (
    <div className="mt-9 flex flex-col gap-9">
      <section className="flex flex-col gap-5">
        <h1 className="text-3xl font-bold text-white-1">Trending Movies</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-1"></div>
          </div>
        ) : allMovies && allMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {allMovies.map(
              ({ _id, imageUrl, title, description, rating, genre }) => (
                <MovieCard
                  key={_id}
                  movieId={_id}
                  title={title}
                  rating={rating || 0} // Handle potential undefined
                  genre={genre || ["Unknown"]}
                  description={description}
                  imgUrl={imageUrl || "/default-movie.jpg"}
                />
              ),
            )}
          </div>
        ) : (
          <div className="text-center py-10 text-white-1/70">
            <p>No movies found. Be the first to add one!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;