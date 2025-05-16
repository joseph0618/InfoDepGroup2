"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import EmptyState from "@/components/EmptyState";
import LoaderSpiner from "@/components/LoaderSpinner";
import PodcastCard from "@/components/MovieCard";
import Searchbar from "@/components/Searchbar";

function Discover({
  searchParams: { search },
}: {
  searchParams: { search: string };
}) {
  const podcastData = useQuery(api.podcasts.getPodcastBySearch, {
    search: search || "",
  });

  return (
    <div className="flex flex-col gap-9">
      <Searchbar />
      <div className="flex flex-col gap-9">
        <h1 className="text-20 font-bold text-white-1">
          {search ? "Search results for: " : "Discover Trending Podcasts"}
          {search && <span className="text-white-2">{search}</span>}
        </h1>
        {podcastData ? (
          <>
            {podcastData.length > 0 ? (
              <div className="podcast_grid">
                {podcastData?.map(
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
