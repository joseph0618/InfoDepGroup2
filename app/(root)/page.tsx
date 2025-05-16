"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import PodcastCard from "@/components/PodcastCard";

const Home = () => {
  const movies = useQuery(api.movies.getAllMovies, {}, {
    retry: 3,
    retryDelay: 1000
  });

  if (movies === undefined) {
    return <div className="p-4 text-center">Loading movies...</div>;
  }

  if (!Array.isArray(movies)) {
    return <div className="p-4 text-center text-red-500">Invalid data format</div>;
  }

  const trendingPodcasts = movies.map(movie => ({
    _id: movie._id,
    imageUrl: movie.imageUrl || "/default-image.jpg",
    podcastTitle: movie.title || "Untitled",
    podcastDescription: movie.description || "No description available"
  }));
  return (
    <div className="mt-9 flex flex-col gap-9">
      <section className="flex flex-col gap-5">
        <h1 className="text-3xl font-bold text-white-1">Trending Podcasts</h1>
        <div className="podcast_grid">
          {trendingPodcasts?.map(
            ({ _id, imageUrl, podcastTitle, podcastDescription }) => (
              <PodcastCard
                key={_id}
                podcastId={_id}
                title={podcastTitle}
                description={podcastDescription}
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
