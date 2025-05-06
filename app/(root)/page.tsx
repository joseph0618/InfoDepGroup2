"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import PodcastCard from "@/components/PodcastCard";

const Home = () => {
  const trendingPodcasts = useQuery(api.podcasts.getTrendingPodcasts);
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
