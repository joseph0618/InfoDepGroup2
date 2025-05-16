"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import MovieCard from "@/components/MovieCard";

const Home = () => {
  const AllMovies = useQuery(api.movies.getAllMovies);
  return (
    <div className="mt-9 flex flex-col gap-9">
      <section className="flex flex-col gap-5">
        <h1 className="text-3xl font-bold text-white-1">Trending Movies</h1>
        <div className="podcast_grid">
          {AllMovies?.map(
            ({ _id, imageUrl, title, description, rating }) => (
              <MovieCard
                key={_id}
                movieId={_id}
                title={title}
                rating={rating}
                description={description}
                imgUrl={imageUrl!}
              />
            ),
          )}
        </div>
        <div></div>
      </section>
    </div>
  );
};

export default Home;