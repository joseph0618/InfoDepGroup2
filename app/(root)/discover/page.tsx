"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import EmptyState from "@/components/EmptyState";
import LoaderSpiner from "@/components/LoaderSpinner";
import MovieCard from "@/components/MovieCard";
import Searchbar from "@/components/Searchbar";

function Discover({
  searchParams: { search },
}: {
  searchParams: { search: string };
}) {
  const movieData = useQuery(api.movies.searchMovies, {
    search: search || "",
  });

  return (
    <div className="flex flex-col gap-9">
      <Searchbar />
      <div className="flex flex-col gap-9">
        <h1 className="text-20 font-bold text-white-1">
          {search ? "Search results for: " : "Discover Trending Movies"}
          {search && <span className="text-white-2">{search}</span>}
        </h1>
        {movieData ? (
          <>
            {movieData.length > 0 ? (
              <div className="podcast_grid">
                {movieData?.map(
                  ({ _id, imageUrl, title, rating, description }) => (
                    <MovieCard
                      key={_id}
                      movieId={_id}
                      title={title}
                      description={description}
                      imgUrl={imageUrl!}
                      rating={rating}
                    />
                  ),
                )}
              </div>
            ) : (
              <EmptyState title="No results found" />
            )}
          </>
        ) : (
          <LoaderSpiner />
        )}
      </div>
    </div>
  );
}

export default Discover;